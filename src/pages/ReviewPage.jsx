import React, { useRef } from "react";
import SvgClothing from "../components/SvgClothing";
import "../styles/ReviewPage.css";

export default function ReviewPage({
  customization,
  fabricSampleFile,
  customizationImageFile,
  onUploadFabric,
  onUploadCustomizationImage,
  onConfirmOrder,
  onBack,
}) {
  const fabricFileRef = useRef(null);
  const customImageFileRef = useRef(null);

  const handleFabricUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadFabric(file);
    }
  };

  const handleCustomizationImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadCustomizationImage(file);
    }
  };

  const fabricImage = fabricSampleFile
    ? URL.createObjectURL(fabricSampleFile)
    : null;

  const customizationImage = customizationImageFile
    ? URL.createObjectURL(customizationImageFile)
    : null;

  const clothingDescriptions = {
    coat: "Classic dress coat with premium tailoring",
    barong: "Traditional barong with detailed embroidery",
    suit: "Complete suit with jacket and pants",
    pants: "Formal pants with perfect fit",
  };

  return (
    <div className="review-page">
      <h2>Review Your Order</h2>

      <div className="review-container">
        {/* Left: Customization Summary */}
        <div className="review-summary">
          <h3>Your Customization</h3>
          <div className="preview-box">
            <SvgClothing
              type={customization.clothingType}
              color={customization.color}
              pattern={customization.pattern}
              width={280}
              height={400}
            />
          </div>

          <div className="specs-list">
            <div className="spec-item">
              <span className="spec-label">Clothing Type:</span>
              <span className="spec-value">
                {customization.clothingType.toUpperCase()}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Description:</span>
              <span className="spec-value">
                {clothingDescriptions[customization.clothingType]}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Color:</span>
              <div
                className="color-preview"
                style={{ backgroundColor: customization.color }}
              />
              <span className="spec-value">{customization.color}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fabric:</span>
              <span className="spec-value">
                {customization.fabricType.charAt(0).toUpperCase() +
                  customization.fabricType.slice(1)}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Pattern:</span>
              <span className="spec-value">
                {customization.pattern.charAt(0).toUpperCase() +
                  customization.pattern.slice(1)}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fit:</span>
              <span className="spec-value">
                {customization.clothingFit.charAt(0).toUpperCase() +
                  customization.clothingFit.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Upload Samples */}
        <div className="upload-section">
          <h3>Upload Samples</h3>

          {/* Fabric Sample Upload */}
          <div className="upload-card">
            <h4>Fabric Sample</h4>
            <p className="upload-desc">
              Upload a picture of the fabric you want to use
            </p>
            <button
              className="upload-btn"
              onClick={() => fabricFileRef.current.click()}
            >
              {fabricSampleFile ? " Fabric Uploaded" : " Upload Fabric"}
            </button>
            <input
              ref={fabricFileRef}
              type="file"
              accept="image/*"
              onChange={handleFabricUpload}
              style={{ display: "none" }}
            />
            {fabricImage && (
              <div className="preview-image">
                <img src={fabricImage} alt="Fabric Sample" />
                <p className="file-name">{fabricSampleFile.name}</p>
              </div>
            )}
          </div>

          {/* Customization Image Upload */}
          <div className="upload-card">
            <h4>Customization Details</h4>
            <p className="upload-desc">
              Upload reference images for customization details
            </p>
            <button
              className="upload-btn"
              onClick={() => customImageFileRef.current.click()}
            >
              {customizationImageFile
                ? "Details Uploaded"
                : "Upload Details"}
            </button>
            <input
              ref={customImageFileRef}
              type="file"
              accept="image/*"
              onChange={handleCustomizationImageUpload}
              style={{ display: "none" }}
            />
            {customizationImage && (
              <div className="preview-image">
                <img src={customizationImage} alt="Customization Details" />
                <p className="file-name">{customizationImageFile.name}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="review-actions">
            <button className="btn-back-review" onClick={onBack}>
              ← Back
            </button>
            <button className="btn-confirm" onClick={onConfirmOrder}>
              ✓ Confirm & Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
