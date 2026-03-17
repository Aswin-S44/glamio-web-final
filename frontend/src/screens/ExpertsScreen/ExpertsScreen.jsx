import React, { useState, useEffect, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import Upload from "antd/es/upload";
import Swal from "sweetalert2";
import {
  Plus,
  Search,
  User,
  Trash2,
  Edit2,
  X,
  Camera,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  Type,
  LayoutGrid,
  AlignLeft,
} from "lucide-react";
import "./ExpertsScreen.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

const SPECIALISATION_OPTIONS = [
  { value: "Hair", label: "Hair Cut" },
  { value: "Skin", label: "Skin Care" },
  { value: "Nails", label: "Nail Art" },
  { value: "Makeup", label: "Makeup" },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    padding: "5px",
    borderRadius: "12px",
    background: "#fff",
    border: state.isFocused ? "2px solid #1a1a1a" : "1px solid #e5e7eb",
    boxShadow: "none",
    fontSize: "14px",
    minHeight: "45px",
    transition: "all 0.2s ease",
    "&:hover": { borderColor: "#1a1a1a" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1a1a1a"
      : state.isFocused
      ? "#f3f4f6"
      : "#fff",
    color: state.isSelected ? "#fff" : "#374151",
    fontSize: "14px",
    "&:active": { backgroundColor: "#1a1a1a" },
  }),
};

function ExpertsScreen() {
  const [experts, setExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 8,
  });
  const [submitting, setSubmitting] = useState(false);

  const [expertName, setExpertName] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [specialist, setSpecialist] = useState(null);
  const [image, setImage] = useState(null);

  const token = localStorage.getItem("token");
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchExperts(1);
  }, [activeTab]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchExperts(1), 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const fetchExperts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        specialist: activeTab === "All" ? "" : activeTab,
      });
      const res = await fetch(`${BASE_URL}/expert?${params}`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (data.experts) {
        setExperts(data.experts);
        setPagination(
          data.pagination || { currentPage: 1, totalPages: 1, limit: 8 }
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async ({ fileList }) => {
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(fileList[fileList.length - 1].originFileObj);
      reader.onload = () => setImage(reader.result);
    } else {
      setImage(null);
    }
  };

  const handleSaveExpert = async (e) => {
    e.preventDefault();
    const submitData = {
      name: expertName,
      about,
      address,
      image,
      specialist: specialist?.value,
    };
    try {
      const url = editingExpert
        ? `${BASE_URL}/expert/${editingExpert.id}`
        : `${BASE_URL}/expert`;
      setSubmitting(true);
      const res = await fetch(url, {
        method: editingExpert ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(submitData),
      });
      setSubmitting(false);
      if (res.ok) {
        fetchExperts(pagination.currentPage);
        closeModal();
      }
    } catch (error) {
      setSubmitting(false);
      Swal.fire("Error", "Failed to save expert profile", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1a1a1a",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete expert",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${BASE_URL}/expert/${id}`, {
            method: "DELETE",
            headers: { Authorization: `${token}` },
          });
          Swal.fire("Deleted!", "Expert has been removed.", "success");
          fetchExperts(pagination.currentPage);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const openModal = (expert = null) => {
    if (expert) {
      setEditingExpert(expert);
      setExpertName(expert.name);
      setAbout(expert.about);
      setAddress(expert.address);
      setSpecialist({ value: expert.specialist, label: expert.specialist });
      setImage(expert.image);
    } else {
      setEditingExpert(null);
      setExpertName("");
      setAbout("");
      setAddress("");
      setSpecialist(null);
      setImage(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setEditingExpert(null);
  };

  return (
    <div className="sv-screen">
      <div className="sv-header">
        <div className="sv-title-sec">
          <h1>Our Experts</h1>
          <p>Manage and organize your professional team members</p>
        </div>
        <div className="sv-actions">
          <div className="sv-search">
            <Search size={18} />
            <input
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="sv-add-btn" onClick={() => openModal()}>
            <Plus size={18} /> <span>Add Expert</span>
          </button>
        </div>
      </div>

      <div className="sv-grid-container">
        {loading ? (
          <div className="sv-loader">
            <div className="sv-spinner"></div>
          </div>
        ) : experts.length === 0 ? (
          <NotFound title={"Experts"} />
        ) : (
          <>
            <div className="sv-grid">
              {experts.map((expert) => (
                <div key={expert.id} className="sv-card">
                  <div className="sv-card-media">
                    {expert.image ? (
                      <img src={expert.image} alt={expert.name} />
                    ) : (
                      <div className="sv-img-placeholder">
                        <User size={32} />
                      </div>
                    )}
                    <div className="sv-card-overlay">
                      <button
                        onClick={() => {
                          setEditingExpert(expert);
                          setViewModalOpen(true);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openModal(expert)}>
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="del"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="sv-card-badge">
                      {expert.specialist || "General"}
                    </div>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-card-info">
                      <h3>{expert.name}</h3>
                      <p>
                        <MapPin size={14} /> {expert.address || "No address"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sv-pagination-wrapper">
              <div className="sv-pagination-modern">
                <button
                  className="sv-pag-nav"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchExperts(pagination.currentPage - 1)}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="sv-pag-numbers">
                  <span className="sv-pag-current">
                    {pagination.currentPage}
                  </span>
                  <span className="sv-pag-divider">/</span>
                  <span className="sv-pag-total">{pagination.totalPages}</span>
                </div>
                <button
                  className="sv-pag-nav"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchExperts(pagination.currentPage + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="sv-modal-backdrop">
          <div className="sv-modal-modern">
            <div className="sv-modal-header-modern">
              <div className="sv-modal-title">
                <div className="sv-modal-icon-box">
                  {editingExpert ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3>
                    {editingExpert ? "Update Expert" : "New Expert Profile"}
                  </h3>
                  <p>Enter the expert details below</p>
                </div>
              </div>
              <button className="sv-close-x" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpert} className="sv-form-modern">
              <div className="sv-form-grid">
                <div className="sv-form-sidebar">
                  <label className="sv-label-modern">Expert Photo</label>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageUpload}
                    className="sv-uploader-modern"
                  >
                    {image ? (
                      <div className="sv-img-preview-container">
                        <img src={image} alt="preview" />
                        <div className="sv-img-edit-overlay">
                          <Camera size={16} /> Change
                        </div>
                      </div>
                    ) : (
                      <div className="sv-upload-empty">
                        <Camera size={24} />
                        <span>Upload Photo</span>
                      </div>
                    )}
                  </Upload>
                </div>

                <div className="sv-form-main-inputs">
                  <div className="sv-input-group-modern">
                    <label className="sv-label-modern">Full Name</label>
                    <input
                      placeholder="e.g. John Doe"
                      value={expertName}
                      onChange={(e) => setExpertName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sv-input-group-modern">
                    <label className="sv-label-modern">
                      <LayoutGrid size={14} /> Specialisation
                    </label>
                    <CreatableSelect
                      styles={customSelectStyles}
                      options={SPECIALISATION_OPTIONS}
                      value={specialist}
                      placeholder="Select expertise..."
                      onChange={setSpecialist}
                    />
                  </div>

                  <div className="sv-input-group-modern">
                    <label className="sv-label-modern">
                      <MapPin size={14} /> Work Address
                    </label>
                    <input
                      placeholder="Studio or Shop location"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="sv-input-group-modern full-width">
                <label className="sv-label-modern">
                  <AlignLeft size={14} /> Brief Bio
                </label>
                <textarea
                  rows="3"
                  placeholder="Tell us about the expert's experience..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  required
                />
              </div>

              <div className="sv-modal-footer-modern">
                <button
                  type="button"
                  className="sv-btn-cancel-modern"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sv-btn-submit-modern"
                  disabled={submitting}
                >
                  {submitting
                    ? "Please wait..."
                    : editingExpert
                    ? "Update Expert"
                    : "Add Expert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && editingExpert && (
        <div className="sv-modal-backdrop">
          <div className="sv-modal view-modal">
            <div className="sv-view-img">
              {editingExpert.image ? (
                <img src={editingExpert.image} alt="" />
              ) : (
                <User size={40} />
              )}
              <button className="sv-view-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="sv-view-body">
              <div className="sv-view-header">
                <span className="sv-tag">{editingExpert.specialist}</span>
                <h2>{editingExpert.name}</h2>
                <div className="sv-view-meta">
                  <span>
                    <Briefcase size={16} /> Professional
                  </span>
                </div>
              </div>
              <p className="sv-view-desc">
                {editingExpert.about ||
                  "No biography provided for this expert."}
              </p>
              <div
                className="expert-location-info"
                style={{
                  marginBottom: "20px",
                  color: "#64748b",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MapPin size={16} /> {editingExpert.address}
              </div>
              <button className="sv-btn-primary-view full" onClick={closeModal}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpertsScreen;
