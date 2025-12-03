import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { RGBELoader } from 'three-stdlib';

const Clothing3DViewer = ({ 
  modelPath = '/models/Suit.glb', 
  color = '#1a1a1a',
  pattern = 'solid',
  fabricType = 'cotton',
  variantName = '',
  clothingType = '',
  clothingFit = 'regular',
  width = '100%',
  height = '500px'
}) => {
  // Log all received props
  console.log('🎯 [Clothing3DViewer] Received props:', {
    modelPath,
    modelPathType: typeof modelPath,
    modelPathLength: modelPath?.length,
    color,
    pattern,
    fabricType,
    variantName,
    clothingType,
    clothingFit
  });
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const floorRef = useRef(null);
  const animationIdRef = useRef(null);
  const initAttemptRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Helper function to center camera on model - fills ~80% of viewport
  const centerCameraOnModel = useCallback((model, camera, controls, containerHeight) => {
    if (!model || !camera || !controls) return;

    // Calculate bounding box of the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Get the maximum dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate camera distance to fit model in ~80% of viewport
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) / 0.8; // 0.8 = 80% fill
    
    // Position camera in front of model
    camera.position.set(center.x, center.y, center.z + cameraDistance);
    camera.lookAt(center);
    
    // Update controls target to model center
    controls.target.copy(center);
    controls.update();
    
    console.log('📷 Camera centered on model:', {
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) },
      modelSize: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
      cameraDistance: cameraDistance.toFixed(2)
    });
  }, []);

  // Generate pattern texture with NEUTRAL base (not colored)
  const generatePatternTexture = (patternType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
  
    // Use WHITE base - material color will tint it naturally
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1024);
  
    // Pattern lines in black/gray - these will show up clearly
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  
    switch (patternType) {
      case "pinstripe":
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        for (let x = 0; x < 1024; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        break;
  
      case "chalkstripe":
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        for (let x = 0; x < 1024; x += 70) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        break;
  
      case "herringbone":
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        const angle = Math.PI / 6;
        for (let y = -200; y < 1224; y += 16) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y - 300);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, y + 8);
          ctx.lineTo(1024, y + 308);
          ctx.stroke();
        }
        break;
  
      case "birdseye":
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        for (let x = 20; x < 1024; x += 40) {
          for (let y = 20; y < 1024; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
  
      case "houndstooth":
        const hs = 32;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        for (let x = 0; x < 1024; x += hs * 2) {
          for (let y = 0; y < 1024; y += hs * 2) {
            // Checkerboard base
            ctx.fillRect(x, y, hs, hs);
            ctx.fillRect(x + hs, y + hs, hs, hs);
            
            // Houndstooth "teeth"
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + hs/2, y + hs/2);
            ctx.lineTo(x, y + hs);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x + hs, y);
            ctx.lineTo(x + hs * 1.5, y + hs/2);
            ctx.lineTo(x + hs, y + hs);
            ctx.fill();
          }
        }
        break;
  
      case "glenplaid":
        // Prince of Wales check
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        
        // Main grid
        for (let i = 0; i < 1024; i += 100) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1024);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(1024, i);
          ctx.stroke();
        }
        
        // Secondary grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 50; i < 1024; i += 100) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1024);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(1024, i);
          ctx.stroke();
        }
        break;
  
      case "windowpane":
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
        for (let i = 0; i < 1024; i += 150) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1024);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(1024, i);
          ctx.stroke();
        }
        break;
  
      default:
        // solid - return null to disable texture
        return null;
    }
  
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.needsUpdate = true;
    return texture;
  };

  // Initialize 3D scene with retry logic for proper dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    // CRITICAL: Validate modelPath BEFORE doing anything
    if (!modelPath || typeof modelPath !== 'string' || modelPath.trim() === '') {
      console.error('❌ [Clothing3DViewer] useEffect: Invalid modelPath, skipping initialization:', modelPath);
      setError(`Invalid model path: "${modelPath}". Please check your configuration.`);
      setLoading(false);
      return;
    }
    
    // Check for invalid path patterns BEFORE initializing scene
    if (modelPath.match(/\/models\/_(men|women)\.glb$/) || 
        modelPath === '/models/_men.glb' || 
        modelPath === '/models/_women.glb') {
      console.error('❌ [Clothing3DViewer] useEffect: Invalid path pattern detected:', modelPath);
      setError(`Invalid model path: "${modelPath}". Model name is missing.`);
      setLoading(false);
      return;
    }

    // Function to initialize the scene once we have valid dimensions
    const initScene = () => {
      // Get container dimensions - use fallbacks if 0
      let containerWidth = containerRef.current.clientWidth;
      let containerHeight = containerRef.current.clientHeight;
      
      console.log('📐 Container dimensions (attempt #' + initAttemptRef.current + '):', containerWidth, 'x', containerHeight);
      
      // If dimensions are still 0, retry with requestAnimationFrame (up to 10 attempts)
      if ((containerWidth === 0 || containerHeight === 0) && initAttemptRef.current < 10) {
        initAttemptRef.current++;
        console.log('⏳ Waiting for container layout... retry #' + initAttemptRef.current);
        requestAnimationFrame(initScene);
        return;
      }
      
      // Use fallback dimensions if still 0 after retries
      if (containerWidth === 0) {
        containerWidth = 600;
        console.warn('⚠️ Using fallback width: 600px');
      }
      if (containerHeight === 0) {
        containerHeight = 500;
        console.warn('⚠️ Using fallback height: 500px');
      }

      console.log('🎬 Initializing 3D scene...');
      console.log('🎬 [Clothing3DViewer] useEffect triggered with modelPath:', modelPath);
      console.log('📐 Final dimensions:', containerWidth, 'x', containerHeight);

      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;

      // Create camera with valid dimensions
      const camera = new THREE.PerspectiveCamera(
        45,
        containerWidth / containerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      camera.lookAt(0, -2, 0);
      cameraRef.current = camera;
      console.log('✅ Camera at:', camera.position.x, camera.position.y, camera.position.z);

      // Create renderer with HIGH QUALITY settings
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        precision: "highp" // High precision for better quality
      });
      
      renderer.setSize(containerWidth, containerHeight);
      // Use FULL device pixel ratio for sharp, crisp rendering
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // Enhanced shadow settings for precise rendering
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0; // Neutral exposure for accurate colors
      renderer.physicallyCorrectLights = true; // Physically accurate lighting
      renderer.setClearColor(0xf0f0f0, 1); // Slightly darker for contrast
      
      // Ensure canvas is visible and on top
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.zIndex = '1';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      
      // Clear container before appending
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      console.log('🎨 Renderer created:', {
        width: containerWidth,
        height: containerHeight,
        pixelRatio: renderer.getPixelRatio(),
        alpha: false
      });
      
      setIsReady(true);

      // ========== PROFESSIONAL STUDIO 3-POINT LIGHTING ==========
      
      // Soft ambient fill - provides base illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      // Hemisphere light for natural sky/ground color variation
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 0.6);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      // KEY LIGHT - Main light source (simulates window/softbox)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      keyLight.position.set(5, 8, 8);
      keyLight.castShadow = true;
      // High-resolution shadow map for crisp shadows
      keyLight.shadow.mapSize.width = 4096;
      keyLight.shadow.mapSize.height = 4096;
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 50;
      keyLight.shadow.camera.left = -10;
      keyLight.shadow.camera.right = 10;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -10;
      keyLight.shadow.bias = -0.0001; // Reduce shadow acne
      keyLight.shadow.normalBias = 0.02;
      scene.add(keyLight);

      // FILL LIGHT - Softens shadows on opposite side
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
      fillLight.position.set(-6, 4, 4);
      fillLight.castShadow = false; // Only key light casts shadows
      scene.add(fillLight);

      // RIM/BACK LIGHT - Creates edge definition and separation
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
      rimLight.position.set(0, 6, -8);
      scene.add(rimLight);
      
      // ACCENT LIGHT - Top-down for fabric highlight
      const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
      topLight.position.set(0, 12, 0);
      scene.add(topLight);

      // ========== SHADOW-RECEIVING FLOOR ==========
      const floorGeometry = new THREE.PlaneGeometry(50, 50);
      const floorMaterial = new THREE.ShadowMaterial({
        opacity: 0.15, // Subtle shadow
        color: 0x000000
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -3; // Position below model
      floor.receiveShadow = true;
      scene.add(floor);
      floorRef.current = floor;

      // ========== ORBIT CONTROLS with IMPROVED ZOOM ==========
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      // Allow close zoom for fabric detail inspection
      controls.minDistance = 0.5;  // Very close for button/fabric details
      controls.maxDistance = 15;   // Reasonable max distance
      controls.target.set(0, 0, 0);
      controls.maxPolarAngle = Math.PI / 2 + 0.3;
      controls.minPolarAngle = 0.1; // Prevent going completely overhead
      controls.enablePan = true;
      controls.panSpeed = 0.8;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2; // Slightly faster zoom
      controlsRef.current = controls;

      // Load model using Three.js GLTFLoader (following threejs.org documentation pattern)
      // Reference: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
      const loader = new GLTFLoader();
      
      loader.load(
        modelPath,
        // onLoad callback - called when model is successfully loaded
        (gltf) => {
          const model = gltf.scene;
          modelRef.current = model;

          // Initial scale - will be adjusted by auto-center
          model.scale.set(5, 5, 5);
          model.position.set(0, 0, 0);
          
          // Apply HIGH-QUALITY materials with proper fabric properties
          const fabricProps = {
            wool:     { roughness: 0.85, metalness: 0.0, envMapIntensity: 0.3 },
            cashmere: { roughness: 0.80, metalness: 0.02, envMapIntensity: 0.5 },
            cotton:   { roughness: 0.88, metalness: 0.0, envMapIntensity: 0.2 },
            linen:    { roughness: 0.92, metalness: 0.0, envMapIntensity: 0.2 },
            silk:     { roughness: 0.20, metalness: 0.15, envMapIntensity: 1.2 },
            velvet:   { roughness: 0.95, metalness: 0.0, envMapIntensity: 0.4 },
            tweed:    { roughness: 0.90, metalness: 0.01, envMapIntensity: 0.25 },
            piña:     { roughness: 0.40, metalness: 0.05, envMapIntensity: 1.0 },
            jusi:     { roughness: 0.45, metalness: 0.08, envMapIntensity: 0.9 },
            organza:  { roughness: 0.25, metalness: 0.12, envMapIntensity: 1.4 },
          };
          
          const fabric = fabricProps[fabricType] || fabricProps.wool;
          
          // Traverse model and apply HIGH-QUALITY materials with shadows
          model.traverse((child) => {
            if (child.isMesh) {
              // Create MeshStandardMaterial with enhanced settings
              child.material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: fabric.roughness,
                metalness: fabric.metalness,
                envMapIntensity: fabric.envMapIntensity,
                side: THREE.DoubleSide,
                flatShading: false, // Smooth shading for fabric
              });
              // Enable shadows on ALL meshes
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Ensure geometry normals are computed for proper lighting
              if (child.geometry) {
                child.geometry.computeVertexNormals();
              }
            }
          });

          // Add model to scene
          scene.add(model);
          
          // AUTO-CENTER: Calculate bounding box and position camera to fill ~80% viewport
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          
          // Position model so its center is at origin
          model.position.sub(center);
          model.position.y += size.y / 2 - 1; // Raise slightly above floor
          
          // Update floor position
          if (floorRef.current) {
            floorRef.current.position.y = model.position.y - size.y / 2 - 0.1;
          }
          
          // Calculate camera distance for 80% viewport fill
          const fov = camera.fov * (Math.PI / 180);
          const cameraZ = (maxDim / 0.8) / (2 * Math.tan(fov / 2));
          
          // Position camera
          camera.position.set(0, size.y * 0.3, cameraZ);
          camera.lookAt(0, size.y * 0.2, 0);
          
          // Update controls target
          controls.target.set(0, size.y * 0.2, 0);
          controls.update();
          
          console.log('📷 Auto-centered camera:', {
            modelSize: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
            cameraZ: cameraZ.toFixed(2),
            modelCenter: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
          });
          
          setLoading(false);
          setError(null);
          console.log('✅ Model loaded with studio lighting and auto-centering!');
        },
        // onProgress callback - called during loading
        (progress) => {
          if (progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`📊 Loading: ${percent}%`);
          }
        },
        // onError callback - called if loading fails
        (loadError) => {
          console.error('❌ Error loading model:', loadError);
          setError(`Failed to load model: ${loadError.message || 'Unknown error'}`);
          setLoading(false);
        }
      );

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          // Clear and render the scene
          rendererRef.current.clear();
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      // Start animation loop
      console.log('🎬 Starting animation loop...');
      animate();
    };

    // Handle resize - defined outside initScene for cleanup access
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const w = containerRef.current.clientWidth || 600;
      const h = containerRef.current.clientHeight || 500;
      
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Reset attempt counter and start initialization
    initAttemptRef.current = 0;
    initScene();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up...');
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Dispose of model geometry and materials
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        
        // Remove model from scene if it's still there
        if (sceneRef.current && modelRef.current.parent === sceneRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
        modelRef.current = null;
      }
      
      if (containerRef.current && rendererRef.current?.domElement) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // Element may already be removed
        }
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      // Dispose floor
      if (floorRef.current) {
        if (floorRef.current.geometry) floorRef.current.geometry.dispose();
        if (floorRef.current.material) floorRef.current.material.dispose();
        if (sceneRef.current) sceneRef.current.remove(floorRef.current);
        floorRef.current = null;
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      setIsReady(false);
    };
  }, [modelPath, centerCameraOnModel]);

  // Update fabric properties, pattern, and color together
  useEffect(() => {
    if (!modelRef.current) return;
  
    console.log('🎨 Updating material - Color:', color, 'Fabric:', fabricType, 'Pattern:', pattern);

    const fabricProps = {
      wool:     { roughness: 0.92, metalness: 0.02, envMapIntensity: 0.2 },
      cashmere: { roughness: 0.88, metalness: 0.05, envMapIntensity: 0.4 },
      cotton:   { roughness: 0.90, metalness: 0.00, envMapIntensity: 0.1 },
      linen:    { roughness: 0.95, metalness: 0.00, envMapIntensity: 0.15 },
      silk:     { roughness: 0.15, metalness: 0.25, envMapIntensity: 1.6 },
      velvet:   { roughness: 0.98, metalness: 0.00, envMapIntensity: 0.3 },
      tweed:    { roughness: 0.94, metalness: 0.03, envMapIntensity: 0.2 },
      piña:     { roughness: 0.35, metalness: 0.08, envMapIntensity: 1.3 },
      jusi:     { roughness: 0.40, metalness: 0.10, envMapIntensity: 1.2 },
      organza:  { roughness: 0.20, metalness: 0.18, envMapIntensity: 1.8 },
    };
  
    const props = fabricProps[fabricType] || fabricProps.wool;
  
    // Generate pattern texture (neutral base)
    const patternTexture = pattern !== "solid" 
      ? generatePatternTexture(pattern)
      : null;
  
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Update or create material
        if (!child.material.isMeshStandardMaterial) {
          child.material = new THREE.MeshStandardMaterial();
        }

        // Set color
        child.material.color.set(color);
        
        // Set fabric properties
        child.material.roughness = props.roughness;
        child.material.metalness = props.metalness;
        child.material.envMapIntensity = props.envMapIntensity;
  
        // Set pattern texture
        if (patternTexture) {
          child.material.map = patternTexture;
        } else {
          child.material.map = null;
        }

        child.material.side = THREE.DoubleSide;
        child.material.transparent = false;
        child.material.opacity = 1;
        child.material.wireframe = false; // Ensure wireframe is OFF for real clothing
        child.material.needsUpdate = true;
        
        // Ensure mesh is visible
        child.visible = true;
      }
    });

    console.log('✅ Material updated successfully - Color:', color, 'Fabric:', fabricType, 'Pattern:', pattern);
    
    // Force render after material update
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [fabricType, pattern, color]);

  // Update fit (scale model) and RE-CENTER CAMERA
  useEffect(() => {
    if (!modelRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    console.log('📏 Updating fit to:', clothingFit);
    
    const fitScales = {
      regular: { x: 1.0, y: 1.0, z: 1.0 },
      slim: { x: 0.92, y: 1.0, z: 0.92 },
      loose: { x: 1.10, y: 1.0, z: 1.10 }
    };
    
    const scale = fitScales[clothingFit] || fitScales.regular;
    const model = modelRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    // Store current model world position before scaling
    const currentWorldPos = new THREE.Vector3();
    model.getWorldPosition(currentWorldPos);
    
    // Apply fit scale multiplier to current scale
    const currentScale = model.scale.clone();
    const baseScaleX = currentScale.x / (fitScales.regular.x || 1);
    const baseScaleY = currentScale.y / (fitScales.regular.y || 1);
    const baseScaleZ = currentScale.z / (fitScales.regular.z || 1);
    
    model.scale.set(
      baseScaleX * scale.x,
      baseScaleY * scale.y,
      baseScaleZ * scale.z
    );
    
    // Recalculate bounding box after scale change
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (maxDim > 0) {
      // Update floor position based on new model bounds
      if (floorRef.current) {
        const modelBottom = box.min.y;
        floorRef.current.position.y = modelBottom - 0.05;
      }
      
      // RE-CENTER CAMERA on the new geometry
      const fov = camera.fov * (Math.PI / 180);
      const idealDistance = (maxDim / 0.8) / (2 * Math.tan(fov / 2));
      
      // Smoothly position camera to view the resized model
      const targetY = center.y;
      camera.position.set(0, targetY + size.y * 0.1, idealDistance);
      camera.lookAt(center);
      
      // Update controls target to new center
      controls.target.copy(center);
      controls.update();
      
      console.log(`✅ Applied ${clothingFit} fit - Camera re-centered:`, {
        scale: scale,
        newSize: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
        cameraDistance: idealDistance.toFixed(2)
      });
      
      // Force render after changes
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    } else {
      console.warn('⚠️ Cannot update fit: invalid model dimensions');
    }
  }, [clothingFit]);

  // Parse height to ensure it's usable
  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div style={{ 
      position: 'relative', 
      width, 
      height: containerHeight,
      minHeight: '450px' // Ensure minimum height
    }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
        }} 
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
            Loading 3D Model...
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            This may take a moment
          </div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#d32f2f', marginBottom: '10px' }}>
            Loading Error
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {error}
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            🖱️ Drag to rotate • 🔍 Scroll to zoom
          </div>
          
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div>✅ Model Loaded</div>
            {variantName && (
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.9,
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '6px',
                marginTop: '2px'
              }}>
                <strong>Style:</strong> {variantName}
              </div>
            )}
            {clothingType && (
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                <strong>Type:</strong> {clothingType}
              </div>
            )}
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              <strong>Fabric:</strong> {fabricType}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              <strong>Pattern:</strong> {pattern}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              <strong>Fit:</strong> {clothingFit}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Clothing3DViewer;