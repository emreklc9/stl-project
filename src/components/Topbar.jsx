import { useRef } from "react";
import appIcon from "../assets/image/3d-icon.png";
import { CUSTOM_MODEL_ID, STL_MODELS } from "../models";
import "./Topbar.scss";

export default function Topbar({
  modelId,
  customModel,
  onModelChange,
  onFileSelect,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
    event.target.value = "";
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <span className="topbar-logo">
            <img src={appIcon} alt="" className="topbar-logo-img" width={40} height={40} />
          </span>
          <div className="topbar-brand-text">
            <span className="topbar-title">STL Studio</span>
            <span className="topbar-subtitle">3D Model Görüntüleyici</span>
          </div>
        </div>

        <div className="topbar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".stl,model/stl"
            className="topbar-file-input"
            onChange={handleFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            type="button"
            className="topbar-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Dosya seç
          </button>

          <select
            className="topbar-model-select"
            value={modelId}
            onChange={(e) => onModelChange(e.target.value)}
            aria-label="STL modeli seç"
          >
            {customModel && (
              <option value={CUSTOM_MODEL_ID}>{customModel.label}</option>
            )}
            {STL_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
