import React, { useState } from "react";
import "./App.css";
import CustomizationPage from "./pages/CustomizationPage";
import ReviewPage from "./pages/ReviewPage";

const CLOTHING_CATALOG = [
  {
    id: "coat",
    label: "Coats",
    image: "",
    desc: "Layered outerwear silhouettes",
    variants: [
      {
        id: "coat_trench",
        name: "Modern Trench Coat",
        detail: "Waist belt, storm flap, structured lapels",
        prompt: "modern tailored trench coat with structured shoulders, cinched waist belt, storm flap and matte buttons",
        fabrics: ["cotton", "linen", "wool"],
        defaultColor: "#1a1a1a",
      },
      {
        id: "coat_cocoon",
        name: "Cocoon Coat",
        detail: "Minimal seams, rounded silhouette",
        prompt: "minimal cocoon coat with rounded silhouette, hidden placket and hand stitched edges",
        fabrics: ["wool", "silk"],
        defaultColor: "#4a4a4a",
      },
      {
        id: "coat_overcoat",
        name: "Double-Breasted Overcoat",
        detail: "Peak lapels, double-breasted closure",
        prompt: "double breasted overcoat with peak lapels, long line drape and polished buttons",
        fabrics: ["wool", "cotton"],
        defaultColor: "#8b0000",
      },
    ],
  },
  {
    id: "barong",
    label: "Barongs",
    image: "",
    desc: "Traditional Filipino formalwear",
    variants: [
      {
        id: "barong_classic",
        name: "Classic Piña Barong",
        detail: "Sheer piña fabric, hand embroidery",
        prompt:
          "sheer pina barong tagalog with ornate kalado embroidery and translucent texture",
        fabrics: ["piña", "jusi", "organza"],
        defaultColor: "#f6e8c3",
      },
    ],
  },
  {
    id: "suit",
    label: "Suits",
    image: "",
    desc: "Full tailored ensembles",
    variants: [
      {
        id: "suit_classic",
        name: "Classic Two-Piece",
        detail: "Notch lapel, slim trousers",
        prompt: "classic two piece suit with notch lapels, slim trousers and refined tailoring",
        fabrics: ["wool", "cotton"],
        defaultColor: "#1a1a1a",
      },
      {
        id: "suit_double",
        name: "Double-Breasted Suit",
        detail: "Six button front, peak lapel",
        prompt: "double breasted suit with peak lapels, sharp pleated trousers and satin buttons",
        fabrics: ["wool", "silk"],
        defaultColor: "#2b6cb0",
      },
      {
        id: "suit_tux",
        name: "Evening Tuxedo",
        detail: "Satin lapel, crisp shirt",
        prompt: "evening tuxedo with satin shawl lapel, crisp shirt and silk bow tie",
        fabrics: ["silk", "wool"],
        defaultColor: "#000000",
      },
    ],
  },
  {
    id: "pants",
    label: "Trousers",
    image: "",
    desc: "Tailored bottoms",
    variants: [
      {
        id: "pants_formal",
        name: "Formal Trousers",
        detail: "Pressed crease, slim fit",
        prompt: "formal tailored trousers with sharp crease and slim silhouette",
        fabrics: ["cotton", "linen", "wool"],
        defaultColor: "#4a4a4a",
      },
      {
        id: "pants_wide",
        name: "Wide-Leg Trousers",
        detail: "High waist, flowing leg",
        prompt: "high waisted wide leg trousers with soft drape and pleats",
        fabrics: ["linen", "silk"],
        defaultColor: "#228b22",
      },
    ],
  },
];

const FABRIC_LIBRARY = {
  cotton: { id: "cotton", name: "Cotton Twill", desc: "Soft & breathable" },
  silk: { id: "silk", name: "Silk Blend", desc: "Luxurious & smooth" },
  denim: { id: "denim", name: "Selvedge Denim", desc: "Durable & classic" },
  linen: { id: "linen", name: "Irish Linen", desc: "Light & natural" },
  wool: { id: "wool", name: "Wool Cashmere", desc: "Warm & premium" },
  piña: { id: "piña", name: "Piña Fiber", desc: "Sheer pineapple fiber" },
  jusi: { id: "jusi", name: "Jusi Silk", desc: "Silky banana fiber" },
  organza: { id: "organza", name: "Organza", desc: "Crisp & translucent" },
};

const COLORS = ["#1a1a1a", "#2b6cb0", "#8b0000", "#228b22", "#4a4a4a", "#d69e2e", "#f6e8c3"];
const PATTERNS = ["solid", "stripes", "checked", "floral"];

const getDefaultVariantId = (categoryId) => {
  const category = CLOTHING_CATALOG.find((c) => c.id === categoryId);
  return category?.variants?.[0]?.id || "";
};

export default function App() {
  const [page, setPage] = useState("customize"); // customize, review, debug
  const [customization, setCustomization] = useState({
    clothingType: "coat",
    variantId: getDefaultVariantId("coat"),
    gender: "unisex",
    fabricType: "cotton",
    pattern: "solid",
    color: "#1a1a1a",
    clothingFit: "regular",
    customPrompt: "",
    generatedPrompt: "",
    aiImageUrl: "",
  });
  const [fabricSampleFile, setFabricSampleFile] = useState(null);
  const [customizationImageFile, setCustomizationImageFile] = useState(null);

  const handleSaveCustomization = (customConfig) => {
    setCustomization(customConfig);
    setPage("review");
  };

  const handleUploadFabric = (file) => {
    setFabricSampleFile(file);
  };

  const handleUploadCustomizationImage = (file) => {
    setCustomizationImageFile(file);
  };

  const handleFinalOrder = () => {
    alert(
      `✅ Order confirmed!\n\nClothing: ${customization.clothingType}\nColor: ${customization.color}\nFabric: ${customization.fabricType}\n\nFabric sample uploaded: ${fabricSampleFile ? "Yes" : "No"}\nCustomization image uploaded: ${customizationImageFile ? "Yes" : "No"}`
    );
    // Reset
    setPage("customize");
    setFabricSampleFile(null);
    setCustomizationImageFile(null);
  };

  return (
    <div className="app-wrapper">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon"></span>
            <h1>Customization</h1>
          </div>
          <nav className="nav-links">
            <button
              className={`nav-btn ${page === "customize" ? "active" : ""}`}
              onClick={() => setPage("customize")}
            >
              Customize
            </button>
            <button
              className={`nav-btn ${page === "review" ? "active" : ""}`}
              onClick={() => setPage("review")}
            >
              Review
            </button>
            <button
              className={`nav-btn ${page === "debug" ? "active" : ""}`}
              onClick={() => setPage("debug")}
              style={{ background: '#ff4444' }}
            >
              🔧 Debug 3D
            </button>
          </nav>
        </div>
      </header>

      {/* Pages */}
      <main className="app-main">
        {page === "customize" && (
          <CustomizationPage
            selectedClothing={customization.clothingType}
            catalog={CLOTHING_CATALOG}
            fabricLibrary={FABRIC_LIBRARY}
            colors={COLORS}
            patterns={PATTERNS}
            initialCustomization={customization}
            onSave={handleSaveCustomization}
          />
        )}
        {page === "review" && (
          <ReviewPage
            catalog={CLOTHING_CATALOG}
            customization={customization}
            fabricSampleFile={fabricSampleFile}
            customizationImageFile={customizationImageFile}
            onUploadFabric={handleUploadFabric}
            onUploadCustomizationImage={handleUploadCustomizationImage}
            onConfirmOrder={handleFinalOrder}
            onBack={() => setPage("customize")}
          />
        )}
        {page === "debug" && (
          <DebugPage />
        )}
      </main>
    </div>
  );
}

// Simple Debug Component
function DebugPage() {
  const [status, setStatus] = React.useState({
    three: '⏳ Checking...',
    file: '⏳ Checking...',
    details: []
  });

  React.useEffect(() => {
    const checkEverything = async () => {
      const details = [];
      
      // Check Three.js
      try {
        await import('three');
        await import('three-stdlib');
        setStatus(prev => ({ ...prev, three: '✅ Loaded' }));
        details.push('✅ Three.js and three-stdlib are installed');
      } catch (err) {
        setStatus(prev => ({ ...prev, three: '❌ Not found' }));
        details.push(`❌ Three.js error: ${err.message}`);
        details.push('💡 Run: npm install three three-stdlib');
      }

      // Check file
      try {
        const response = await fetch('/models/Suit.glb');
        if (response.ok) {
          const blob = await response.blob();
          const size = (blob.size / 1024).toFixed(2);
          setStatus(prev => ({ ...prev, file: '✅ Found' }));
          details.push(`✅ Suit.glb found (${size} KB)`);
        } else {
          setStatus(prev => ({ ...prev, file: '❌ Not found' }));
          details.push(`❌ Suit.glb returned status ${response.status}`);
          details.push('💡 Make sure file is in: public/models/Suit.glb');
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, file: '❌ Error' }));
        details.push(`❌ Cannot access file: ${err.message}`);
        details.push('💡 File must be in public/models/Suit.glb');
      }

      setStatus(prev => ({ ...prev, details }));
    };

    checkEverything();
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 3D Model Debug</h2>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Status Check:</h3>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          <strong>Three.js:</strong> {status.three}
        </div>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          <strong>Suit.glb:</strong> {status.file}
        </div>
      </div>

      <div style={{ 
        background: '#1e1e1e', 
        color: '#d4d4d4', 
        padding: '20px', 
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <h3 style={{ color: '#d4d4d4' }}>Details:</h3>
        {status.details.map((detail, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>{detail}</div>
        ))}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        background: '#fff3cd', 
        borderRadius: '8px' 
      }}>
        <h4>Quick Fixes:</h4>
        <ol>
          <li><strong>If Three.js is missing:</strong> Run <code>npm install three three-stdlib</code></li>
          <li><strong>If Suit.glb is not found:</strong> Make sure the file is at <code>public/models/Suit.glb</code></li>
          <li><strong>After fixing:</strong> Restart your dev server (<code>npm run dev</code>)</li>
        </ol>
      </div>
    </div>
  );
}