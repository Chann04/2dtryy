import React, { useState } from "react";
import "./App.css";
import ShopPage from "./pages/ShopPage";
import CustomizationPage from "./pages/CustomizationPage";
import ReviewPage from "./pages/ReviewPage";

const CLOTHING_TYPES = [
  { id: "coat", label: "Coat", image: "", desc: "Classic Dress Coat" },
  { id: "barong", label: "Barong", image: "", desc: "Traditional Barong" },
  { id: "suit", label: "Suit", image: "", desc: "Complete Suit" },
  { id: "pants", label: "Pants", image: "", desc: "Formal Pants" },
];

const FABRIC_TYPES = [
  { id: "cotton", name: "Cotton", desc: "Soft & Breathable" },
  { id: "silk", name: "Silk", desc: "Luxurious & Smooth" },
  { id: "denim", name: "Denim", desc: "Durable & Classic" },
  { id: "linen", name: "Linen", desc: "Light & Natural" },
  { id: "wool", name: "Wool", desc: "Warm & Premium" },
];

const COLORS = ["#1a1a1a", "#2b6cb0", "#8b0000", "#228b22", "#4a4a4a", "#d69e2e"];
const PATTERNS = ["solid", "stripes", "checked", "floral"];

export default function App() {
  const [page, setPage] = useState("shop"); // shop, customize, review
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [customization, setCustomization] = useState({
    clothingType: "coat",
    fabricType: "cotton",
    pattern: "solid",
    color: "#1a1a1a",
    clothingFit: "regular",
  });
  const [fabricSampleFile, setFabricSampleFile] = useState(null);
  const [customizationImageFile, setCustomizationImageFile] = useState(null);

  const handleSelectClothing = (clothingId) => {
    setSelectedClothing(clothingId);
    setCustomization((prev) => ({ ...prev, clothingType: clothingId }));
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
        {page === "shop" && <ShopPage clothingTypes={CLOTHING_TYPES} onSelect={handleSelectClothing} />}
        {page === "customize" && (
          <CustomizationPage
            selectedClothing={selectedClothing}
            fabricTypes={FABRIC_TYPES}
            colors={COLORS}
            patterns={PATTERNS}
            initialCustomization={customization}
            onSave={handleSaveCustomization}
            onBack={() => setPage("shop")}
          />
        )}
        {page === "review" && (
          <ReviewPage
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
