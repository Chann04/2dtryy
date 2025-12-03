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
  const [clothingType, setClothingType] = useState(initialCustomization.clothingType || "suits");
  const [variantId, setVariantId] = useState(initialCustomization.variantId || "double-breasted");
  const [gender, setGender] = useState(initialCustomization.gender || "male");
  const [fabricType, setFabricType] = useState(initialCustomization.fabricType || "wool");
  const [pattern, setPattern] = useState(initialCustomization.pattern || "solid");
  const [color, setColor] = useState(initialCustomization.color || "#1a1a1a");
  const [clothingFit, setClothingFit] = useState(initialCustomization.clothingFit || "regular");
  const [buttonType, setButtonType] = useState(initialCustomization.buttonType || buttonOptions[clothingType]?.[0]);

  const activeCategory = catalog.find(c => c.id === clothingType);
  const activeVariant = activeCategory?.variants.find(v => v.id === variantId) || activeCategory?.variants[0];

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
    if (clothingType === "barong") {
      return `/models/barong_male.glb`;
    }

    const genderSuffix = gender === "female" ? "_women" : "_men";
    let modelName = "";

    if (clothingType === "coats") {
      // Your files: "double breasted men.glb" or "trench coat women.glb"
      modelName = variantId === "trench" ? "trenchcoat" : "doublebreasted";
    } else if (clothingType === "suits") {
      // Your files: "doublebreastedsuit_men.glb" or "eveningtuxedo_women.glb"
      modelName = variantId === "tuxedo" ? "eveningtuxedo" : "doublebreastedsuit";
    } else if (clothingType === "trousers") {
      // Your files: "formaltrouser_men.glb" or "wideleg_women.glb"
      modelName = variantId === "wideleg" ? "wideleg" : "formaltrouser";
    }

    return `/models/${modelName}${genderSuffix}.glb`;
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