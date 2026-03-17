import React, { useState, useEffect, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import Upload from "antd/es/upload";
import Swal from "sweetalert2";

import {
  Plus,
  Search,
  Scissors,
  Trash2,
  Edit2,
  Clock,
  X,
  Camera,
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Type,
  LayoutGrid,
  AlignLeft,
} from "lucide-react";
import "./ServicesScreen.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

const CATEGORY_OPTIONS = [
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

function ServicesScreen() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 8,
  });
  const [submitting, setSubmitting] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchServices(1);
  }, [activeTab]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchServices(1), 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const fetchServices = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        category: activeTab,
      });
      const res = await fetch(`${BASE_URL}/services?${params}`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (data.services) {
        setServices(data.services);
        setPagination(data.pagination);
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

  const handleSaveService = async (e) => {
    e.preventDefault();
    const submitData = {
      name: serviceName,
      imageUrl: image,
      rate: price,
      category: category?.value,
      duration,
      description,
    };
    try {
      const url = editingService
        ? `${BASE_URL}/services/${editingService.id}`
        : `${BASE_URL}/services`;
      setSubmitting(true);
      const res = await fetch(url, {
        method: editingService ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(submitData),
      });
      setSubmitting(false);
      if (res.ok) {
        fetchServices(pagination.currentPage);
        closeModal();
      }
    } catch (error) {
      setSubmitting(false);
      alert("Error saving service");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete the service!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${BASE_URL}/services/${id}`, {
            method: "DELETE",
            headers: { Authorization: `${token}` },
          });
          Swal.fire({
            title: "Deleted!",
            text: "Your service has been deleted.",
            icon: "success",
          });
          fetchServices(pagination.currentPage);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setPrice(service.rate);
      setCategory({ value: service.category, label: service.category });
      setImage(service.imageUrl);
      setDuration(service.duration || "30");
      setDescription(service.description || "");
    } else {
      setEditingService(null);
      setServiceName("");
      setPrice("");
      setCategory(null);
      setImage(null);
      setDuration("30");
      setDescription("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="sv-screen">
      <div className="sv-header">
        <div className="sv-title-sec">
          <h1>All Services</h1>
          <p>Manage and organize your parlor services</p>
        </div>
        <div className="sv-actions">
          <div className="sv-search">
            <Search size={18} />
            <input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="sv-add-btn" onClick={() => openModal()}>
            <Plus size={18} /> <span>New Service</span>
          </button>
        </div>
      </div>

      <div className="sv-filter-bar">
        <div className="sv-tabs">
          {["All", "Hair", "Skin", "Nails", "Makeup"].map((cat) => (
            <button
              key={cat}
              className={`sv-tab ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="sv-grid-container">
        {loading ? (
          <div className="sv-loader">
            <div className="sv-spinner"></div>
          </div>
        ) : services.length === 0 ? (
          <NotFound title={"Services"} />
        ) : (
          <>
            <div className="sv-grid">
              {services.map((service) => (
                <div key={service.id} className="sv-card">
                  <div className="sv-card-media">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} />
                    ) : (
                      <div className="sv-img-placeholder">
                        <Scissors size={32} />
                      </div>
                    )}
                    <div className="sv-card-overlay">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setViewModalOpen(true);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openModal(service)}>
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="del"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="sv-card-badge">
                      {service?.categoryName ?? "Unavailable"}
                    </div>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-card-info">
                      <h3>{service.name}</h3>
                      <p>
                        <Clock size={14} /> {service.duration || "30"} mins
                      </p>
                    </div>
                    <div className="sv-card-price">{service.rate}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sv-pagination-wrapper">
              <div className="sv-pagination-modern">
                <button
                  className="sv-pag-nav"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchServices(pagination.currentPage - 1)}
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
                  onClick={() => fetchServices(pagination.currentPage + 1)}
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
                  {editingService ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3>
                    {editingService ? "Update Service" : "Create New Service"}
                  </h3>
                  <p>Enter the service details below</p>
                </div>
              </div>
              <button className="sv-close-x" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="sv-form-modern">
              <div className="sv-form-grid">
                <div className="sv-form-sidebar">
                  <label className="sv-label-modern">Service Image</label>
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
                    <label className="sv-label-modern">
                      <Type size={14} /> Service Name
                    </label>
                    <input
                      placeholder="e.g. Premium Haircut"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sv-input-group-modern">
                    <label className="sv-label-modern">
                      <LayoutGrid size={14} /> Category
                    </label>
                    <CreatableSelect
                      styles={customSelectStyles}
                      options={CATEGORY_OPTIONS}
                      value={category}
                      placeholder="Select category..."
                      onChange={setCategory}
                    />
                  </div>

                  <div className="sv-input-row-modern">
                    <div className="sv-input-group-modern">
                      <label className="sv-label-modern">Price</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    {/* <div className="sv-input-group-modern">
                      <label className="sv-label-modern">
                        <Clock size={14} /> Duration (min)
                      </label>
                      <input
                        type="number"
                        placeholder="30"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="sv-input-group-modern full-width">
                <label className="sv-label-modern">
                  <AlignLeft size={14} /> Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Service description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    ? "Processing..."
                    : editingService
                    ? "Update Details"
                    : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && editingService && (
        <div className="sv-modal-backdrop">
          <div className="sv-modal view-modal">
            <div className="sv-view-img">
              {editingService.imageUrl ? (
                <img src={editingService.imageUrl} alt="" />
              ) : (
                <Scissors size={40} />
              )}
              <button className="sv-view-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="sv-view-body">
              <div className="sv-view-header">
                <span className="sv-tag">{editingService.category}</span>
                <h2>{editingService.name}</h2>
                <div className="sv-view-meta">
                  <span>
                    <Clock size={16} /> {editingService.duration} min
                  </span>
                  <span className="sv-view-price">{editingService.rate}</span>
                </div>
              </div>
              <p className="sv-view-desc">
                {editingService.description ||
                  "No description provided for this service."}
              </p>
              <button className="sv-btn-primary-view full" onClick={closeModal}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesScreen;
