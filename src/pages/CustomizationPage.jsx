import React, { useEffect, useMemo, useState } from "react";
import Clothing3DViewer from "../components/Clothing3DViewer";
import { catalog } from "../data/catalog";
import { fabricLibrary } from "../data/fabrics";
import { colors } from "../data/colors";
import { patterns } from "../data/patterns";

// Button options for different clothing types
const buttonOptions = {
  coats: ["Horn", "Metal", "Leather", "Mother of Pearl"],
  suits: ["Horn", "Metal", "Mother of Pearl", "Fabric Covered"],
  barong: ["Shell", "Mother of Pearl", "None (Traditional)"],
  trousers: ["Metal Hook", "Button Fly", "Hidden Clasp"]
};

export default function CustomizationPage({
  initialCustomization = {},
  onSave,
  onBack,
}) {
  // Ensure initial values are never empty strings
  const getInitialClothingType = () => {
    const val = initialCustomization.clothingType;
    return (val && typeof val === 'string' && val.trim()) ? val.trim() : "suits";
  };
  const getInitialVariantId = () => {
    const val = initialCustomization.variantId;
    return (val && typeof val === 'string' && val.trim()) ? val.trim() : "double-breasted";
  };
  const getInitialGender = () => {
    const val = initialCustomization.gender;
    return (val && typeof val === 'string' && val.trim()) ? val.trim() : "male";
  };
  
  const [clothingType, setClothingType] = useState(getInitialClothingType());
  const [variantId, setVariantId] = useState(getInitialVariantId());
  const [gender, setGender] = useState(getInitialGender());
  
  console.log('🎯 [CustomizationPage] Initial state:', {
    clothingType,
    variantId,
    gender,
    initialCustomization
  });
  const [fabricType, setFabricType] = useState(initialCustomization.fabricType || "wool");
  const [pattern, setPattern] = useState(initialCustomization.pattern || "solid");
  const [color, setColor] = useState(initialCustomization.color || "#1a1a1a");
  const [clothingFit, setClothingFit] = useState(initialCustomization.clothingFit || "regular");
  const [buttonType, setButtonType] = useState(initialCustomization.buttonType || buttonOptions[clothingType]?.[0]);

  const activeCategory = catalog.find(c => c.id === clothingType);
  const activeVariant = activeCategory?.variants.find(v => v.id === variantId) || activeCategory?.variants[0];

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔄 [CustomizationPage] State changed:', {
      clothingType,
      variantId,
      gender,
      activeCategory: activeCategory?.id,
      activeVariant: activeVariant?.id
    });
  }, [clothingType, variantId, gender, activeCategory, activeVariant]);

  // Auto-set gender for barong
  useEffect(() => {
    if (clothingType === "barong") {
      setGender("male");
    }
  }, [clothingType]);

  // Auto-set default variant and fabric when category changes
  useEffect(() => {
    if (activeVariant && variantId !== activeVariant.id) {
      setVariantId(activeVariant.id);
    }
    
    // Reset fabric if current fabric isn't allowed for this category
    if (clothingType === "barong" && !["piña", "organza"].includes(fabricType)) {
      setFabricType("piña");
    } else if (clothingType !== "barong" && fabricType === "piña") {
      setFabricType("wool");
    }

    // Set default button type for category
    if (buttonOptions[clothingType]) {
      setButtonType(buttonOptions[clothingType][0]);
    }
  }, [clothingType, activeVariant, variantId, fabricType]);

  // Dynamic model path - matches your exact GLB filenames
  const modelPath = useMemo(() => {
    // Log raw inputs BEFORE validation
    console.log('🔍 [CustomizationPage] Raw inputs BEFORE validation:', {
      clothingType: clothingType,
      clothingTypeType: typeof clothingType,
      clothingTypeLength: clothingType?.length,
      variantId: variantId,
      variantIdType: typeof variantId,
      gender: gender,
      genderType: typeof gender
    });
    
    // Validate inputs - handle empty strings, null, undefined more robustly
    const validClothingType = (clothingType && typeof clothingType === 'string' && clothingType.trim()) ? clothingType.trim() : "suits";
    const validGender = (gender && typeof gender === 'string' && gender.trim()) ? gender.trim() : "male";
    const validVariantId = (variantId && typeof variantId === 'string' && variantId.trim()) ? variantId.trim() : "double-breasted";
    
    console.log('🔍 [CustomizationPage] Validated inputs:', {
      validClothingType,
      validVariantId,
      validGender
    });
    
    let path;
    let modelName = ""; // Initialize outside if/else to ensure it's always set
    
    if (validClothingType === "barong") {
      path = `/models/barong_men.glb`;
      console.log('✅ [CustomizationPage] Barong path:', path);
      return path;
    } else {
      const genderSuffix = validGender === "female" ? "_women" : "_men";

      // Determine modelName based on clothingType
      if (validClothingType === "coats") {
        modelName = validVariantId === "trench" ? "trenchcoat" : "doublebreasted";
      } else if (validClothingType === "suits") {
        modelName = validVariantId === "tuxedo" ? "eveningtuxedo" : "doublebreastedsuit";
      } else if (validClothingType === "trousers") {
        modelName = validVariantId === "wideleg" ? "wideleg" : "formaltrouser";
      } else {
        // Fallback: if clothingType is unknown, default to suits
        console.warn(`⚠️ [CustomizationPage] Unknown clothingType: "${validClothingType}", defaulting to suits`);
        modelName = validVariantId === "tuxedo" ? "eveningtuxedo" : "doublebreastedsuit";
      }

      // CRITICAL: Safety check - ensure modelName is NEVER empty
      if (!modelName || modelName.trim() === "") {
        console.error(`❌ [CustomizationPage] CRITICAL: modelName is empty!`);
        console.error(`❌ [CustomizationPage] clothingType: "${validClothingType}" (type: ${typeof validClothingType})`);
        console.error(`❌ [CustomizationPage] variantId: "${validVariantId}" (type: ${typeof validVariantId})`);
        // Force a safe default
        modelName = "doublebreastedsuit";
        console.warn(`⚠️ [CustomizationPage] Forced modelName to: "${modelName}"`);
      }

      path = `/models/${modelName}${genderSuffix}.glb`;
      
      // Final validation: ensure path doesn't contain _men.glb or _women.glb without prefix
      if (path.includes('/models/_men.glb') || path.includes('/models/_women.glb')) {
        console.error(`❌ [CustomizationPage] CRITICAL: Generated invalid path: "${path}"`);
        console.error(`❌ [CustomizationPage] modelName was: "${modelName}"`);
        // Force a safe path
        path = `/models/doublebreastedsuit${genderSuffix}.glb`;
        console.warn(`⚠️ [CustomizationPage] Forced path to: "${path}"`);
      }
    }
    
    // Debug logging
    console.log('🔍 [CustomizationPage] Model path constructed:', {
      clothingType: validClothingType,
      variantId: validVariantId,
      gender: validGender,
      modelName: modelName,
      finalPath: path,
      fullURL: window.location.origin + path
    });
    
    // ABSOLUTE FINAL SAFETY CHECK: Never return a path with _men.glb or _women.glb without prefix
    if (!path || path === '/models/_men.glb' || path === '/models/_women.glb' || 
        path.match(/\/models\/_(men|women)\.glb$/)) {
      console.error(`❌ [CustomizationPage] ABSOLUTE FINAL CHECK FAILED: Invalid path "${path}"`);
      console.error(`❌ [CustomizationPage] Forcing safe default path`);
      const safeGenderSuffix = (validGender === "female") ? "_women" : "_men";
      path = `/models/doublebreastedsuit${safeGenderSuffix}.glb`;
      console.warn(`⚠️ [CustomizationPage] Forced safe path: "${path}"`);
    }
    
    return path;
  }, [clothingType, variantId, gender]);

  // Available fabrics based on category
  const availableFabrics = useMemo(() => {
    if (clothingType === "barong") {
      return ["piña", "organza"];
    }
    // Exclude piña for non-barong items
    return Object.keys(fabricLibrary).filter(f => f !== "piña");
  }, [clothingType]);

  return (
    <div className="customization-page">
      <div className="customization-container">
        {/* 3D Preview */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2>3D Preview</h2>
            <p>Drag to rotate • Scroll to zoom</p>
          </div>

          <div className="ai-preview-box">
            {modelPath && 
             typeof modelPath === 'string' && 
             modelPath.trim() !== '' && 
             !modelPath.match(/\/models\/_(men|women)\.glb$/) &&
             modelPath !== '/models/_men.glb' &&
             modelPath !== '/models/_women.glb' ? (
              <Clothing3DViewer
                key={modelPath}
                modelPath={modelPath}
                color={color}
                pattern={pattern}
                fabricType={fabricType}
                variantName={activeVariant?.name}
                clothingType={activeCategory?.label}
                clothingFit={clothingFit}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#d32f2f', marginBottom: '10px' }}>
                    Invalid Model Path
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Waiting for valid model configuration...
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                    Path: {modelPath || '(empty)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="controls-panel-custom">
          <h2>Customize Your {activeVariant?.name || activeCategory?.label}</h2>

                    {/* Gender (hide for barong) */}
                    {clothingType !== "barong" && (
            <div className="control-section">
              <label>Gender</label>
              <div className="button-group">
                {["male", "female"].map(g => (
                  <button
                    key={g}
                    className={gender === g ? "active" : ""}
                    onClick={() => setGender(g)}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="control-section">
            <label>Category</label>
            <div className="button-group">
              {catalog.map(cat => (
                <button
                  key={cat.id}
                  className={clothingType === cat.id ? "active" : ""}
                  onClick={() => setClothingType(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Variant */}
          {activeCategory?.variants.length > 1 && (
            <div className="control-section">
              <label>Style</label>
              <div className="variant-grid">
                {activeCategory.variants.map(v => (
                  <button
                    key={v.id}
                    className={variantId === v.id ? "active" : ""}
                    onClick={() => setVariantId(v.id)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Fit */}
          <div className="control-section">
            <label>Fit</label>
            <div className="button-group">
              {["Slim", "Regular", "Loose"].map(f => (
                <button
                  key={f}
                  className={clothingFit === f.toLowerCase() ? "active" : ""}
                  onClick={() => setClothingFit(f.toLowerCase())}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="control-section">
            <label>Color</label>
            <div className="color-grid">
              {colors.map(c => (
                <button
                  key={c}
                  style={{ background: c }}
                  className={color === c ? "active" : ""}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)}
              style={{ marginTop: '10px', cursor: 'pointer' }}
            />
          </div>

          {/* Fabric */}
          <div className="control-section">
            <label>Fabric</label>
            <div className="fabric-grid">
              {availableFabrics.map(f => (
                <button
                  key={f}
                  className={fabricType === f ? "active" : ""}
                  onClick={() => setFabricType(f)}
                  title={fabricLibrary[f]?.desc}
                >
                  {fabricLibrary[f]?.name || f}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern */}
          <div className="control-section">
            <label>Pattern</label>
            <div className="pattern-grid">
              {patterns.map(p => (
                <button
                  key={p}
                  className={pattern === p ? "active" : ""}
                  onClick={() => setPattern(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Button Type - NEW */}
          <div className="control-section">
            <label>Button Type</label>
            <div className="button-grid">
              {buttonOptions[clothingType]?.map(btn => (
                <button
                  key={btn}
                  className={buttonType === btn ? "active" : ""}
                  onClick={() => setButtonType(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            {onBack && <button onClick={onBack}>← Back</button>}
            <button onClick={() => onSave({
              clothingType, 
              variantId, 
              gender, 
              fabricType, 
              pattern, 
              color, 
              clothingFit,
              buttonType
            })}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}