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
  Type,
  LayoutGrid,
  AlignLeft,
  Timer,
} from "lucide-react";
import "./ServicesScreen.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

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

const DURATION_OPTIONS = [
  { value: "15", label: "15 mins" },
  { value: "30", label: "30 mins" },
  { value: "45", label: "45 mins" },
  { value: "60", label: "60 mins" },
  { value: "75", label: "75 mins" },
  { value: "90", label: "90 mins" },
  { value: "120", label: "120 mins" },
];

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
  const [imageError, setImageError] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

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

  useEffect(() => {
    if (services.length > 0) {
      const categories = services
        .map((service) => service.categoryName)
        .filter((name) => name && name.trim() !== "");
      const uniqueCategories = [...new Set(categories)];
      const categoryOptionsArray = uniqueCategories.map((cat) => ({
        value: cat,
        label: cat,
      }));
      setCategoryOptions(categoryOptionsArray);
    }
  }, [services]);

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
        const initialIndexes = {};
        data.services.forEach((service) => {
          initialIndexes[service.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = ({ fileList }) => {
    const newImages = [];
    fileList.forEach((file) => {
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => {
          newImages.push(reader.result);
          if (newImages.length === fileList.length) {
            setImages(newImages);
            setImageError("");
          }
        };
      }
    });
    if (fileList.length === 0) {
      setImages([]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    if (images.length - 1 === 0 && !editingService) {
      setImageError("At least one service image is required");
    }
  };

  const handleCreateCategory = (inputValue) => {
    const newCategory = {
      value: inputValue,
      label: inputValue,
    };
    setCategoryOptions([...categoryOptions, newCategory]);
    setCategory(newCategory);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();

    if (images.length === 0 && !editingService) {
      setImageError("At least one service image is required");
      return;
    }

    if (
      images.length === 0 &&
      editingService &&
      (!editingService.images || editingService.images.length === 0)
    ) {
      setImageError("At least one service image is required");
      return;
    }

    const submitData = {
      name: serviceName,
      images: images,
      rate: price,
      category: category?.value,
      duration: duration,
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

      const responseData = await res.json();

      if (!res.ok) {
        if (
          responseData.message &&
          responseData.message.includes("Image upload failed")
        ) {
          setImageError(
            "Image upload failed. Please try uploading different images."
          );
        } else {
          Swal.fire({
            title: "Error!",
            text: responseData.message || "Failed to save service",
            icon: "error",
          });
        }
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      if (res.ok) {
        Swal.fire({
          title: "Success!",
          text: editingService
            ? "Service updated successfully"
            : "Service created successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchServices(pagination.currentPage);
        closeModal();
      }
    } catch (error) {
      setSubmitting(false);
      Swal.fire({
        title: "Error!",
        text: "Network error. Please try again.",
        icon: "error",
      });
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
      setCategory({
        value: service.categoryName || service.category?.name || "",
        label: service.categoryName || service.category?.name || "",
      });
      setImages(service.images || [service.imageUrl ? [service.imageUrl] : []]);
      setDuration(service.duration || "30");
      setDescription(service.description || "");
      setImageError("");
    } else {
      setEditingService(null);
      setServiceName("");
      setPrice("");
      setCategory(null);
      setImages([]);
      setDuration("30");
      setDescription("");
      setImageError("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setEditingService(null);
    setImageError("");
    setImages([]);
  };

  const nextImage = (serviceId, imagesArray) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] + 1) % imagesArray.length,
    }));
  };

  const prevImage = (serviceId, imagesArray) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [serviceId]:
        prev[serviceId] === 0 ? imagesArray.length - 1 : prev[serviceId] - 1,
    }));
  };

  const SkeletonCard = () => (
    <div className="sv-card skeleton-card">
      <div className="sv-card-media skeleton-media">
        <div className="skeleton-shimmer"></div>
      </div>
      <div className="sv-card-content">
        <div className="sv-card-info">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-duration"></div>
        </div>
        <div className="skeleton-text skeleton-price"></div>
      </div>
    </div>
  );

  const ServiceCarousel = ({ images, serviceId, onImageChange }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    let intervalRef = useRef(null);

    const hasMultipleImages = images && images.length > 1;

    const goToNext = () => {
      const newIdx = (currentIdx + 1) % images.length;
      setCurrentIdx(newIdx);
      if (onImageChange) onImageChange(serviceId, newIdx);
    };

    const goToPrev = () => {
      const newIdx = currentIdx === 0 ? images.length - 1 : currentIdx - 1;
      setCurrentIdx(newIdx);
      if (onImageChange) onImageChange(serviceId, newIdx);
    };

    const goToSlide = (index) => {
      setCurrentIdx(index);
      if (onImageChange) onImageChange(serviceId, index);
    };

    useEffect(() => {
      if (hasMultipleImages && isHovered) {
        intervalRef.current = setInterval(goToNext, 3000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [isHovered, images, hasMultipleImages]);

    useEffect(() => {
      if (serviceId && currentImageIndex[serviceId] !== undefined) {
        setCurrentIdx(currentImageIndex[serviceId]);
      }
    }, [serviceId, currentImageIndex]);

    if (!images || images.length === 0) {
      return (
        <div className="sv-img-placeholder">
          <Scissors size={32} />
        </div>
      );
    }

    return (
      <div
        className="sv-carousel-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sv-carousel-slides">
          {images.map((img, index) => (
            <div
              key={index}
              className={`sv-carousel-slide ${
                index === currentIdx ? "active" : ""
              }`}
              style={{ transform: `translateX(-${currentIdx * 100}%)` }}
            >
              <img src={img} alt={`Service ${index + 1}`} />
            </div>
          ))}
        </div>

        {hasMultipleImages && (
          <>
            <button
              className="sv-carousel-btn sv-carousel-prev"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="sv-carousel-btn sv-carousel-next"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight size={16} />
            </button>

            <div className="sv-carousel-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`sv-carousel-dot ${
                    index === currentIdx ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                />
              ))}
            </div>

            <div className="sv-carousel-counter">
              {currentIdx + 1}/{images.length}
            </div>
          </>
        )}
      </div>
    );
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
          {["All", ...categoryOptions.map((cat) => cat.value)].map((cat) => (
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
          <div className="sv-grid">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <NotFound title={"Services"} />
        ) : (
          <>
            <div className="sv-grid">
              {services.map((service) => {
                const serviceImages =
                  service.images ||
                  (service.imageUrl ? [service.imageUrl] : []);

                return (
                  <div key={service.id} className="sv-card">
                    <div className="sv-card-media">
                      <ServiceCarousel
                        images={serviceImages}
                        serviceId={service.id}
                        onImageChange={(id, idx) => {
                          setCurrentImageIndex((prev) => ({
                            ...prev,
                            [id]: idx,
                          }));
                        }}
                      />
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
                      <div className="sv-card-price">₹{service.rate}</div>
                    </div>
                  </div>
                );
              })}
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
                  <label className="sv-label-modern">Service Images</label>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageUpload}
                    className="sv-uploader-modern"
                    multiple
                  >
                    <div className="sv-upload-empty">
                      <Camera size={24} />
                      <span>Upload Photos</span>
                    </div>
                  </Upload>

                  {images.length > 0 && (
                    <div className="sv-image-preview-grid">
                      {images.map((img, index) => (
                        <div key={index} className="sv-image-preview-item">
                          <img src={img} alt={`service ${index}`} />
                          <button
                            type="button"
                            className="sv-image-remove-btn"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imageError && (
                    <div className="sv-error-message">{imageError}</div>
                  )}
                  {images.length === 0 && !editingService && !imageError && (
                    <div className="sv-hint-text">
                      At least one image is required *
                    </div>
                  )}
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
                      options={categoryOptions}
                      value={category}
                      placeholder="Select or create category..."
                      onChange={setCategory}
                      onCreateOption={handleCreateCategory}
                      formatCreateLabel={(inputValue) =>
                        `Create "${inputValue}"`
                      }
                      isClearable
                    />
                  </div>

                  <div className="sv-input-row-modern">
                    <div className="sv-input-group-modern">
                      <label className="sv-label-modern">
                        <Timer size={14} /> Duration
                      </label>
                      <select
                        className="sv-duration-select"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      >
                        {DURATION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sv-input-group-modern">
                      <label className="sv-label-modern">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
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
              {editingService.images && editingService.images.length > 0 ? (
                <img src={editingService.images[0]} alt="" />
              ) : editingService.imageUrl ? (
                <img src={editingService.imageUrl} alt="" />
              ) : (
                <Scissors size={40} />
              )}
              {editingService.images && editingService.images.length > 1 && (
                <div className="sv-view-image-count">
                  +{editingService.images.length - 1} more
                </div>
              )}
              <button className="sv-view-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="sv-view-body">
              <div className="sv-view-header">
                <span className="sv-tag">
                  {editingService.categoryName || editingService.category?.name}
                </span>
                <h2>{editingService.name}</h2>
                <div className="sv-view-meta">
                  <span>
                    <Clock size={16} /> {editingService.duration || "30"} min
                  </span>
                  <span className="sv-view-price">₹{editingService.rate}</span>
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
