import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';

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
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('🎬 Initializing 3D scene...');

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;
    console.log('✅ Camera at:', camera.position.x, camera.position.y, camera.position.z);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 1, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.3;
    controlsRef.current = controls;

    // Load model
    const loader = new GLTFLoader();
    console.log('📦 Loading model from:', modelPath);
    console.log('📦 Full URL:', window.location.origin + modelPath);
    
    loader.load(
      modelPath,
      (gltf) => {
        console.log('✅ Model loaded successfully!');
        
        const model = gltf.scene;
        modelRef.current = model;

        // Get bounding box for proper scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('📏 Model size:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
        console.log('📍 Model center:', center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));

        // Scale to fit viewport nicely
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        model.scale.setScalar(scale);
        
        console.log('🔍 Calculated scale:', scale.toFixed(4));
        
        // Center model at origin
        const scaledCenter = center.clone().multiplyScalar(scale);
        model.position.set(
          -scaledCenter.x,
          -scaledCenter.y + 0.5, // Slight lift for better framing
          -scaledCenter.z
        );
        
        console.log('📌 Model positioned at:', model.position.x.toFixed(2), model.position.y.toFixed(2), model.position.z.toFixed(2));

        // Apply initial materials
        let meshCount = 0;
        model.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Ensure material exists and is visible
            if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.1
              });
            } else {
              // If material exists, make sure it's a standard material
              if (!child.material.isMeshStandardMaterial) {
                const oldColor = child.material.color ? child.material.color.getHex() : 0xffffff;
                child.material = new THREE.MeshStandardMaterial({
                  color: oldColor,
                  roughness: 0.8,
                  metalness: 0.1
                });
              }
            }
            
            // Make sure material is double-sided and visible
            child.material.side = THREE.DoubleSide;
            child.material.transparent = false;
            child.material.opacity = 1;
            child.material.needsUpdate = true;
            child.visible = true;
            child.frustumCulled = false; // Prevent culling issues
            
            console.log(`  Mesh ${meshCount}:`, child.name, 'material:', child.material.type, 'color:', child.material.color?.getHexString());
          }
        });
        
        console.log(`✅ Prepared ${meshCount} meshes`);

        scene.add(model);
        setLoading(false);
        setError(null);
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        if (progress.total > 0) {
          console.log(`📊 Loading: ${percent}%`);
        }
      },
      (error) => {
        console.error('❌ Error loading model:', error);
        setError(`Failed to load model: ${error.message}`);
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
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up...');
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [modelPath]);

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
        child.material.needsUpdate = true;
      }
    });

    console.log('✅ Material updated successfully');
  }, [fabricType, pattern, color]);

  // Update fit (scale model)
  useEffect(() => {
    if (!modelRef.current) return;
    
    console.log('📏 Updating fit to:', clothingFit);
    
    const fitScales = {
      regular: { x: 1.0, y: 1.0, z: 1.0 },
      slim: { x: 0.92, y: 1.0, z: 0.92 },
      loose: { x: 1.10, y: 1.0, z: 1.10 }
    };
    
    const scale = fitScales[clothingFit] || fitScales.regular;
    
    // Get the base scale (from initial model loading)
    const box = new THREE.Box3().setFromObject(modelRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const baseScale = 2.5 / maxDim;
    
    modelRef.current.scale.set(
      baseScale * scale.x,
      baseScale * scale.y,
      baseScale * scale.z
    );
    
    console.log(`✅ Applied ${clothingFit} fit scale:`, scale);
  }, [clothingFit]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
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