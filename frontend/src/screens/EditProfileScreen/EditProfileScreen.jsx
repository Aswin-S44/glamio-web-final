import React, { useState } from "react";
import Upload from "antd/es/upload";
import {
  Camera,
  MapPin,
  Store,
  Info,
  Link,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import "./EditProfileScreen.css";
import { convertToBase642 } from "../../utils/utils";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function EditProfileScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    parlourName: "",
    about: "",
    address: "",
    googleReviewUrl: "",
    shopImage: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const validate = () => {
    const newErrors = {};
    if (!formData.parlourName.trim()) {
      newErrors.parlourName = "Business name is required";
    }
    if (!formData.about.trim()) {
      newErrors.about = "Description is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (
      formData.googleReviewUrl &&
      !formData.googleReviewUrl.startsWith("http")
    ) {
      newErrors.googleReviewUrl = "Enter a valid URL (starting with http)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      const actualFile = lastFile.originFileObj || lastFile;
      if (actualFile instanceof Blob) {
        try {
          const base64 = await convertToBase642(actualFile);
          setFormData((prev) => ({ ...prev, shopImage: base64 }));
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const profileData = { shop: { ...formData, isProfileCompleted: true } };
        const res = await fetch("http://localhost:5000/api/v1/shops", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(profileData),
        });

        if (res.status === 200) {
          Swal.fire({
            title: "Profile Updated",
            text: "Your business details are now live.",
            icon: "success",
            confirmButtonColor: "var(--primary)",
          });
          navigate("/shop/onboard");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <div className="setup-container">
        <div className="setup-sidebar">
          <div className="brand-badge">Admin Panel</div>
          <div className="sidebar-content">
            <h2>Business Profile</h2>
            <p>
              Help customers find and trust your parlour by providing accurate
              information.
            </p>
            <div className="setup-steps">
              <div className="step active">
                <span>1</span> Basic Info
              </div>
              <div className="step">
                <span>2</span> Services
              </div>
              <div className="step">
                <span>3</span> Timing
              </div>
            </div>
          </div>
        </div>

        <div className="setup-form-area">
          <form onSubmit={handleSubmit} className="premium-form">
            <header className="form-header">
              <h3>Complete Shop Setup</h3>
              <p>Fill in the details below to publish your profile.</p>
            </header>

            <div className="upload-brand-section">
              <Upload
                className="brand-uploader"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageUpload}
              >
                {formData.shopImage ? (
                  <div className="brand-preview">
                    <img src={formData.shopImage} alt="Shop" />
                    <div className="change-overlay">
                      <Camera size={18} /> Change Image
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <ImageIcon size={32} strokeWidth={1.5} />
                    <span>Upload Shop Cover</span>
                  </div>
                )}
              </Upload>
              {formData.shopImage && (
                <button
                  type="button"
                  className="remove-asset"
                  onClick={() =>
                    setFormData((p) => ({ ...p, shopImage: null }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="input-grid">
              <div
                className={`field-box ${
                  errors.parlourName ? "error-state" : ""
                }`}
              >
                <label>
                  <Store size={16} /> Parlour Name
                </label>
                <input
                  type="text"
                  name="parlourName"
                  placeholder="e.g. Royal Glow Beauty Lounge"
                  value={formData.parlourName}
                  onChange={handleInputChange}
                />
                {errors.parlourName && (
                  <div className="hint-error">{errors.parlourName}</div>
                )}
              </div>

              <div
                className={`field-box ${errors.address ? "error-state" : ""}`}
              >
                <label>
                  <MapPin size={16} /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street name, City, State"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && (
                  <div className="hint-error">{errors.address}</div>
                )}
              </div>

              <div
                className={`field-box full-width ${
                  errors.about ? "error-state" : ""
                }`}
              >
                <label>
                  <Info size={16} /> About the Parlour
                </label>
                <textarea
                  name="about"
                  rows="4"
                  placeholder="Describe your expertise and atmosphere..."
                  value={formData.about}
                  onChange={handleInputChange}
                />
                {errors.about && (
                  <div className="hint-error">{errors.about}</div>
                )}
              </div>

              <div className="field-box full-width">
                <label>
                  <Link size={16} /> Google Review Link (Optional)
                </label>
                <input
                  type="url"
                  name="googleReviewUrl"
                  placeholder="https://g.page/r/your-id/review"
                  value={formData.googleReviewUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <footer className="form-footer">
              <button type="submit" className="prime-submit" disabled={loading}>
                {loading ? "Processing..." : "Save Profile"}
                {!loading && <ChevronRight size={18} />}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfileScreen;
