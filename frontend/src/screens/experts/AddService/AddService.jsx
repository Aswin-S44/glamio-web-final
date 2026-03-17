import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import Upload from "antd/es/upload";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  Package,
  X,
  UploadCloud,
} from "lucide-react";
import { convertToBase64 } from "../../../utils/utils";
import { useAuth } from "../../../context/AuthContext";
import "./AddService.css";
import { BASE_URL } from "../../../constants/urls";

const CATEGORY_OPTIONS = [
  { value: "hair_cut", label: "Hair Cut" },
  { value: "skin", label: "Skin Care" },
  { value: "nails", label: "Nail Art" },
  { value: "makeup", label: "Makeup" },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    padding: "6px",
    borderRadius: "14px",
    border: state.isFocused ? "2px solid var(--primary)" : "1px solid #e5e7eb",
    boxShadow: "none",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "var(--primary)" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
      ? "var(--secondary)"
      : "transparent",
    color: state.isSelected ? "#fff" : "var(--dark)",
    cursor: "pointer",
  }),
};

function AddService() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async ({ fileList }) => {
    if (fileList.length > 0) {
      const base64 = await convertToBase64(
        fileList[0].originFileObj || fileList[0]
      );
      setImage(base64);
    } else {
      setImage(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      name: serviceName,
      imageUrl: image,
      rate: price,
      category: category?.value,
    };

    try {
      const res = await fetch(`${BASE_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to create service");

      setServiceName("");
      setPrice("");
      setCategory(null);
      setImage(null);
      alert("Service added successfully!");
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-service-wrapper">
      <div className="service-form-container">
        <form className="modern-form" onSubmit={onSubmit}>
          <div className="form-header-main">
            <div className="header-icon">
              <Plus size={24} color="#fff" />
            </div>
            <div>
              <h2>Create New Service</h2>
              <p>Add details and pricing for your new beauty offering</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="full-width">
              <label className="field-label">
                <Tag size={16} /> Category
              </label>
              <CreatableSelect
                isClearable
                options={CATEGORY_OPTIONS}
                styles={customSelectStyles}
                placeholder="Select or create category..."
                value={category}
                onChange={(newValue) => setCategory(newValue)}
                required
              />
            </div>

            <div className="input-field">
              <label className="field-label">
                <Package size={16} /> Service Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bridal Glow Facial"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label className="field-label">
                <DollarSign size={16} /> Price
              </label>
              <div className="price-input-wrapper">
                <span className="currency">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="full-width">
              <label className="field-label">
                <ImageIcon size={16} /> Service Display Image
              </label>
              <Upload
                listType="picture-card"
                className="service-uploader"
                beforeUpload={() => false}
                onChange={handleImageUpload}
                maxCount={1}
                showUploadList={false}
              >
                {image ? (
                  <div className="image-preview-container">
                    <img src={image} alt="Preview" className="upload-preview" />
                    <div className="preview-overlay">
                      <Trash2
                        size={20}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="upload-trigger">
                    <UploadCloud size={32} />
                    <div className="upload-text">
                      <span>Click or drag image</span>
                      <small>PNG, JPG up to 5MB</small>
                    </div>
                  </div>
                )}
              </Upload>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddService;
