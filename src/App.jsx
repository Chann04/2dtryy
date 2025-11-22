import React, { useState } from "react";
import "./App.css";
import ShopPage from "./pages/ShopPage";
import CustomizationPage from "./pages/CustomizationPage";
import ReviewPage from "./pages/ReviewPage";

const CLOTHING_CATALOG = [
  {
    id: "coat",
    label: "Coats",
    image: "🧥",
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
    image: "👔",
    desc: "Traditional Filipino formalwear",
    variants: [
      {
        id: "barong_classic",
        name: "Classic Piña Barong",
        detail: "Sheer piña fabric, hand embroidery",
        prompt: "sheer pina barong tagalog with ornate kalado embroidery and translucent texture",
        fabrics: ["piña", "jusi", "organza"],
        defaultColor: "#f6e8c3",
      },
      {
        id: "barong_modern",
        name: "Modern Tailored Barong",
        detail: "Slim fit, geometric embroidery",
        prompt: "modern tailored barong with geometric embroidery panels and hidden buttons",
        fabrics: ["jusi", "linen"],
        defaultColor: "#d9c5a0",
      },
    ],
  },
  {
    id: "suit",
    label: "Suits",
    image: "🤵",
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
    image: "👖",
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
const PATTERNS = ["solid", "stripes", "checked", "floral", "embroidered"];

const getDefaultVariantId = (categoryId) => {
  const category = CLOTHING_CATALOG.find((c) => c.id === categoryId);
  return category?.variants?.[0]?.id || "";
};

export default function App() {
  const [page, setPage] = useState("shop"); // shop, customize, review
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [customization, setCustomization] = useState({
    clothingType: "coat",
    variantId: getDefaultVariantId("coat"),
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

  const handleSelectClothing = (categoryId) => {
    const nextVariant = getDefaultVariantId(categoryId);
    setSelectedClothing(categoryId);
    setCustomization((prev) => ({
      ...prev,
      clothingType: categoryId,
      variantId: nextVariant || prev.variantId,
      aiImageUrl: "",
      generatedPrompt: "",
    }));
    setPage("customize");
  };

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
    setPage("shop");
    setSelectedClothing(null);
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
              className={`nav-btn ${page === "shop" ? "active" : ""}`}
              onClick={() => setPage("shop")}
            >
              Shop
            </button>
            {selectedClothing && (
              <button
                className={`nav-btn ${page === "customize" ? "active" : ""}`}
                onClick={() => setPage("customize")}
              >
                Customize
              </button>
            )}
            {selectedClothing && (
              <button
                className={`nav-btn ${page === "review" ? "active" : ""}`}
                onClick={() => setPage("review")}
              >
                Review
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Pages */}
      <main className="app-main">
        {page === "shop" && <ShopPage clothingTypes={CLOTHING_CATALOG} onSelect={handleSelectClothing} />}
        {page === "customize" && (
          <CustomizationPage
            selectedClothing={selectedClothing}
            catalog={CLOTHING_CATALOG}
            fabricLibrary={FABRIC_LIBRARY}
            colors={COLORS}
            patterns={PATTERNS}
            initialCustomization={customization}
            onSave={handleSaveCustomization}
            onBack={() => setPage("shop")}
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
      </main>
    </div>
  );
}
