import React, { useEffect, useMemo, useState } from "react";
import "../styles/CustomizationPage.css";

export default function CustomizationPage({
  selectedClothing,
  catalog = [],
  fabricLibrary = {},
  colors = [],
  patterns = [],
  initialCustomization,
  onSave,
  onBack,
}) {
  const defaultCategoryId = selectedClothing || initialCustomization.clothingType || catalog[0]?.id;
  const [clothingType, setClothingType] = useState(defaultCategoryId);
  const [variantId, setVariantId] = useState(initialCustomization.variantId || "");
  const [fabricType, setFabricType] = useState(initialCustomization.fabricType);
  const [pattern, setPattern] = useState(initialCustomization.pattern);
  const [color, setColor] = useState(initialCustomization.color);
  const [clothingFit, setClothingFit] = useState(initialCustomization.clothingFit);
  const [customPrompt, setCustomPrompt] = useState(initialCustomization.customPrompt || "");
  const [generatedPrompt, setGeneratedPrompt] = useState(initialCustomization.generatedPrompt || "");
  const [aiImageUrl, setAiImageUrl] = useState(initialCustomization.aiImageUrl || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const activeCategory = useMemo(
    () => catalog.find((item) => item.id === clothingType) || catalog[0],
    [catalog, clothingType]
  );

  const variants = activeCategory?.variants || [];
  const activeVariant =
    variants.find((variant) => variant.id === variantId) || variants[0] || null;

  useEffect(() => {
    if (!variants.length) return;
    if (!variantId || !variants.some((variant) => variant.id === variantId)) {
      setVariantId(variants[0].id);
      setColor(variants[0].defaultColor || color);
      if (variants[0].fabrics?.length) {
        setFabricType(variants[0].fabrics[0]);
      }
    }
  }, [clothingType, variants, variantId, color]);

  useEffect(() => {
    if (activeVariant?.fabrics?.length && !activeVariant.fabrics.includes(fabricType)) {
      setFabricType(activeVariant.fabrics[0]);
    }
  }, [activeVariant, fabricType]);

  const handleVariantSelect = (variant) => {
    setVariantId(variant.id);
    if (variant.defaultColor) {
      setColor(variant.defaultColor);
    }
    if (variant.fabrics?.length) {
      setFabricType(variant.fabrics[0]);
    }
  };

  const buildPrompt = () => {
    const fabricName = fabricLibrary[fabricType]?.name || fabricType;
    const basePrompt = activeVariant?.prompt || `${activeCategory?.label} garment`;
    const patternDescriptor = pattern === "solid" ? "smooth finish" : `${pattern} pattern`;
    const fitDescriptor = clothingFit ? `${clothingFit} fit` : "";
    const colorDescriptor = color ? `color ${color}` : "";
    return `High fidelity studio photo of a ${activeVariant?.name || activeCategory?.label} with ${fitDescriptor}, ${basePrompt}, crafted from ${fabricName} featuring ${patternDescriptor}, dyed in ${colorDescriptor}. ${customPrompt}`.trim();
  };

  const generateImage = async () => {
    const prompt = buildPrompt();
    setGeneratedPrompt(prompt);
    setIsGenerating(true);
    setError("");
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?bust=${Date.now()}`;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setAiImageUrl(fallbackUrl);
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
          quality: "high",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to call OpenAI image API");
      }
      const data = await response.json();
      const imageUrl = data?.data?.[0]?.url;
      setAiImageUrl(imageUrl || fallbackUrl);
    } catch (err) {
      console.error(err);
      setAiImageUrl(fallbackUrl);
      setError("Using sample generator while OpenAI preview is unavailable.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!aiImageUrl) return;
    const link = document.createElement("a");
    link.href = aiImageUrl;
    link.download = `${activeVariant?.id || clothingType}-preview.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    onSave({
      clothingType,
      variantId: activeVariant?.id,
      fabricType,
      pattern,
      color,
      clothingFit,
      customPrompt,
      generatedPrompt,
      aiImageUrl,
    });
  };

  const fabricsForVariant = (activeVariant?.fabrics || []).map((fabricId) => fabricLibrary[fabricId]).filter(Boolean);

  return (
    <div className="customization-page">
      <div className="customization-container">
        {/* Preview Panel */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2>AI Photo Preview</h2>
            <p>Generate a photorealistic sample powered by OpenAI or the free fallback engine.</p>
          </div>
          <div className="ai-preview-box">
            {aiImageUrl ? (
              <img src={aiImageUrl} alt="AI generated garment preview" />
            ) : (
              <div className="preview-placeholder">
                <span role="img" aria-label="sparkles">
                  
                </span>
                <p>No AI image yet. Select options then hit “Generate Preview”.</p>
              </div>
            )}
          </div>
          <div className="preview-actions">
            <button className="generate-btn" onClick={generateImage} disabled={isGenerating}>
              {isGenerating ? "Generating..." : " Generate Preview"}
            </button>
            <button className="download-btn" onClick={handleDownloadImage} disabled={!aiImageUrl}>
               Download Image
            </button>
          </div>
          {generatedPrompt && (
            <div className="prompt-chip">
              <strong>Prompt:</strong> {generatedPrompt}
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
        </div>

        {/* Controls Panel */}
        <div className="controls-panel-custom">
          <h2>Design your {activeVariant?.name || activeCategory?.label}</h2>

          {/* Clothing Categories */}
          <div className="control-section">
            <label className="control-label">Category</label>
            <div className="button-group">
              {catalog.map((cat) => (
                <button
                  key={cat.id}
                  className={`model-btn ${clothingType === cat.id ? "active" : ""}`}
                  onClick={() => setClothingType(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variant Selection */}
          <div className="control-section">
            <label className="control-label">Style Variants</label>
            <div className="variant-grid">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  className={`variant-card ${variantId === variant.id ? "active" : ""}`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="variant-name">{variant.name}</div>
                  <div className="variant-detail">{variant.detail}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clothing Fit */}
          <div className="control-section">
            <label className="control-label">Fit</label>
            <div className="button-group">
              {["regular", "slim", "loose"].map((fit) => (
                <button
                  key={fit}
                  className={`model-btn ${clothingFit === fit ? "active" : ""}`}
                  onClick={() => setClothingFit(fit)}
                >
                  {fit.charAt(0).toUpperCase() + fit.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="control-section">
            <label className="control-label">Color Palette</label>
            <div className="color-grid">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${color === c ? "active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
            <div className="custom-color-input">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              <span>Custom Color: {color}</span>
            </div>
          </div>

          {/* Fabric Selection */}
          <div className="control-section">
            <label className="control-label">Fabric Options</label>
            <div className="fabric-grid">
              {fabricsForVariant.map((fabric) => (
                <button
                  key={fabric.id}
                  className={`fabric-card ${fabricType === fabric.id ? "active" : ""}`}
                  onClick={() => setFabricType(fabric.id)}
                >
                  <div className="fabric-name">{fabric.name}</div>
                  <div className="fabric-desc">{fabric.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="control-section">
            <label className="control-label">Pattern</label>
            <div className="pattern-grid">
              {patterns.map((p) => (
                <button
                  key={p}
                  className={`pattern-btn ${pattern === p ? "active" : ""}`}
                  onClick={() => setPattern(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Design Prompt */}
          <div className="control-section">
            <label className="control-label">Unique Design Notes</label>
            <textarea
              className="prompt-textarea"
              placeholder="Describe special embroidery, accessories, setting, etc."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <small className="helper-text">
              Your inputs + selected options become the AI prompt to render the preview.
            </small>
          </div>

          
          <div className="action-buttons">
            <button className="btn-back" onClick={onBack}>
              ← Back
            </button>
            <button className="btn-next" onClick={handleSave}>
              Continue to Review →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
