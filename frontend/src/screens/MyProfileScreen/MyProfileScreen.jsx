import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Star,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyProfileScreen.css";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { apiRequest } from "../../utils/api.util";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const EMPTY_PROFILE = {
  user: {
    username: "",
    email: "",
    phone: "",
    profileImage: "",
    experience: "",
  },
  shop: {
    parlourName: "",
    about: "",
    address: "",
    totalRating: 0,
    totalCustomers: 0,
    openingHours: "",
    amenities: [],
    services: [],
    gallery: [],
    lat: "",
    lng: "",
    googleReviewUrl: "",
  },
};

const formatOpeningHours = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([day, hours]) => `${day}: ${hours}`)
      .join(", ");
  }

  return "";
};

const MyProfileScreen = () => {
  const [previewImg, setPreviewImg] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const images = Array.isArray(formData.shop.gallery) ? formData.shop.gallery : [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");
        const [profileData, servicesData] = await Promise.all([
          apiRequest("/shops", {
            headers: { Authorization: token },
          }),
          apiRequest("/services?limit=100", {
            headers: { Authorization: token },
          }).catch(() => ({ services: [] })),
        ]);

        const serviceNames = Array.isArray(servicesData?.services)
          ? servicesData.services.map((service) => service.name).filter(Boolean)
          : [];

        setFormData({
          user: {
            ...EMPTY_PROFILE.user,
            ...profileData.user,
          },
          shop: {
            ...EMPTY_PROFILE.shop,
            ...profileData.shop,
            services: serviceNames,
            gallery: Array.isArray(profileData.shop?.gallery)
              ? profileData.shop.gallery
              : [],
            lat: profileData.shop?.latitude ?? "",
            lng: profileData.shop?.longitude ?? "",
            openingHours: formatOpeningHours(profileData.shop?.openingHours),
          },
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load profile details.");
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    await fetch(`${BASE_URL}/shops`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        user: {
          username: formData.user.username,
          phone: formData.user.phone,
          profileImage: formData.user.profileImage,
        },
        shop: {
          ...formData.shop,
          latitude: formData.shop.lat,
          longitude: formData.shop.lng,
        },
      }),
    });
    alert("Profile updated");
  };

  return (
    <>
      <div className="container profileNew my-4">
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between mb-4 dash-header">
          <div className="d-flex align-items-center">
            <ChevronLeft
              className="go-back-btn"
              onClick={() => navigate(-1)}
              size={28}
            />
            <h4 className="mb-0 new-head-dash">
              Dashboard{" "}
              <span className="text-muted fw-normal font-sheriff">/ Profile</span>
            </h4>
          </div>
          <button
            className="btn btn-soft ms-auto"
            data-bs-toggle="offcanvas"
            data-bs-target="#editProfile"
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-card-modern mb-4">
          <div className="profile-header">
            <img
              src={formData.user.profileImage || DEFAULT_NO_IMAGE}
              alt="profile"
              className="profile-avatar"
            />

            <div className="profile-main">
              <h5 className="profile-name">{formData.user.username || "Shop Owner"}</h5>
              <p className="profile-parlour">{formData.shop.parlourName || "Unnamed Shop"}</p>

              <div className="profile-meta">
                <span className="rating-badge">
                  <Star size={14} fill="currentColor" />
                  {formData.shop.totalRating || 0}
                </span>
                {formData.user.experience && (
                  <>
                    <span className="dot">•</span>
                    <span className="experience">{formData.user.experience}</span>
                  </>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <strong>{formData.shop.totalCustomers || 0}+</strong>
              <span>Happy Customers</span>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card info-card h-100">
              <div className="card-body profile-card">
                <h6 className="card-title-accent">Contact & Business</h6>

                <div className="info-row">
                  <Mail size={16} />
                  <span>{formData.user.email || "Not provided"}</span>
                </div>

                <div className="info-row">
                  <Phone size={16} />
                  <span>{formData.user.phone || "Not provided"}</span>
                </div>

                <div className="info-row">
                  <MapPin size={16} />
                  <span>{formData.shop.address || "Address not set"}</span>
                </div>

                <div className="info-row">
                  <Clock size={16} />
                  <span>{formData.shop.openingHours || "Opening hours not set"}</span>
                </div>

                <h6 className="card-title-accent mt-4">Amenities</h6>
                <div className="chip-group">
                  {formData.shop.amenities.length > 0 ? (
                    formData.shop.amenities.map((amenity, i) => (
                      <span key={i} className="chip">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span>No amenities added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card info-card h-100">
              <div className="card-body profile-card">
                <h6 className="card-title-accent">About</h6>
                <p className="about-text">
                  {formData.shop.about || "No shop description added yet."}
                </p>

                <h6 className="card-title-accent mt-4">Services</h6>
                <div className="chip-group">
                  {formData.shop.services.length > 0 ? (
                    formData.shop.services.map((service, i) => (
                      <span key={i} className="chip service">
                        {service}
                      </span>
                    ))
                  ) : (
                    <span>No services added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              {images.length > 0 ? (
                images.map((img, i) => (
                  <div className="col-6 col-md-4 col-lg-3" key={i}>
                    <div className="gallery-box" onClick={() => setPreviewImg(img)}>
                      <img src={img} alt={`Gallery ${i + 1}`} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="mb-0">No gallery images uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {previewImg && (
          <div className="image-modal" onClick={() => setPreviewImg(null)}>
            <span className="close-btn">&times;</span>
            <img src={previewImg} className="modal-img" alt="Preview" />
          </div>
        )}

        <div className="card">
          {formData.shop.lat && formData.shop.lng ? (
            <>
              <iframe
                height="300"
                className="w-100 border-0"
                loading="lazy"
                title="Shop location"
                src={`https://www.google.com/maps?q=${formData.shop.lat},${formData.shop.lng}&z=15&output=embed`}
              />
              {formData.shop.googleReviewUrl && (
                <a
                  href={formData.shop.googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="map-link"
                >
                  <Globe size={16} /> View on Google Maps
                </a>
              )}
            </>
          ) : (
            <div className="p-4">Location has not been configured yet.</div>
          )}
        </div>

        <div
          className="ep-offcanvas offcanvas offcanvas-end offcanvas-xl"
          tabIndex="-1"
          id="editProfile"
        >
          <div className="ep-header offcanvas-header">
            <h4 className="ep-title">Edit Profile</h4>
            <button className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>

          <div className="ep-body offcanvas-body profile-modal" id="editProfileBody">
            <div className="ep-section">
              <h6 className="ep-section-title">Profile Image</h6>

              <div className="ep-profile-wrap">
                <img
                  src={formData.user.profileImage || DEFAULT_NO_IMAGE}
                  className="ep-profile-img"
                  alt="Profile"
                />

                <div className="ep-profile-upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="ep-input"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const base64 = await fileToBase64(file);
                      handleChange("user", "profileImage", base64);
                    }}
                  />
                  <span className="ep-hint">JPG / PNG • Square recommended</span>
                </div>
              </div>
            </div>

            <div className="ep-section">
              <h6 className="ep-section-title">User Information</h6>

              <div className="ep-grid">
                <input
                  className="ep-input"
                  placeholder="Username"
                  value={formData.user.username}
                  onChange={(e) => handleChange("user", "username", e.target.value)}
                />

                <input
                  className="ep-input"
                  placeholder="Email"
                  value={formData.user.email}
                  onChange={(e) => handleChange("user", "email", e.target.value)}
                />

                <input
                  className="ep-input"
                  placeholder="Phone"
                  value={formData.user.phone}
                  onChange={(e) => handleChange("user", "phone", e.target.value)}
                />
              </div>
            </div>

            <div className="ep-section">
              <h6 className="ep-section-title">Shop Details</h6>

              <input
                className="ep-input"
                placeholder="Parlour Name"
                value={formData.shop.parlourName}
                onChange={(e) => handleChange("shop", "parlourName", e.target.value)}
              />

              <textarea
                className="ep-textarea"
                rows="4"
                placeholder="About your shop"
                value={formData.shop.about}
                onChange={(e) => handleChange("shop", "about", e.target.value)}
              />
            </div>

            <div className="ep-section">
              <h6 className="ep-section-title">Gallery Images</h6>

              <input
                type="file"
                accept="image/*"
                multiple
                className="ep-input"
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  const nextImages = await Promise.all(files.map((file) => fileToBase64(file)));
                  handleChange("shop", "gallery", [...images, ...nextImages]);
                }}
              />

              <div className="ep-gallery">
                {images.map((img, i) => (
                  <img key={i} src={img} className="ep-gallery-img" alt={`Gallery ${i + 1}`} />
                ))}
              </div>
            </div>

            <div className="ep-section">
              <h6 className="ep-section-title">Location</h6>

              <div className="ep-grid">
                <input
                  className="ep-input"
                  placeholder="Latitude"
                  value={formData.shop.lat}
                  onChange={(e) => handleChange("shop", "lat", e.target.value)}
                />

                <input
                  className="ep-input"
                  placeholder="Longitude"
                  value={formData.shop.lng}
                  onChange={(e) => handleChange("shop", "lng", e.target.value)}
                />
              </div>

              {formData.shop.lat && formData.shop.lng && (
                <iframe
                  className="ep-map"
                  title="Edit location preview"
                  src={`https://www.google.com/maps?q=${formData.shop.lat},${formData.shop.lng}&z=15&output=embed`}
                />
              )}
            </div>

            <div className="ep-save">
              <button className="ep-cancel-btn" data-bs-dismiss="offcanvas">
                Cancel
              </button>

              <button
                className="ep-save-btn"
                onClick={handleSave}
                data-bs-dismiss="offcanvas"
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProfileScreen;
