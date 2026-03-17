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

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const dummyData = {
  user: {
    username: "Style Lounge Family Salon ",
    email: "Style Lounge Family Salon .salon@gmail.com",
    phone: "+91 98765 43210",
    profileImage: "https://i.pravatar.cc/150?img=32",
    experience: "8+ Years",
  },
  shop: {
    parlourName: "Kerala Classic Salon",
    about:
      "Kerala Classic Salon is a premium unisex salon offering modern grooming with a traditional touch.",
    address: "MG Road, Kochi, Kerala – 682016",
    totalRating: 4.7,
    totalCustomers: 3200,
    openingHours: "9:00 AM – 9:00 PM",
    amenities: ["AC", "Parking", "Free WiFi", "Card Payment"],
    services: [
      "Haircut",
      "Hair Spa",
      "Facial",
      "Beard Styling",
      "Bridal Makeup",
      "Keratin Treatment",
    ],
    gallery: [],
    lat: 9.9312,
    lng: 76.2673,
    googleReviewUrl: "https://maps.google.com",
  },
};


const dummyGallery = [
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
  "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"
];


const MyProfileScreen = () => {
  const [previewImg, setPreviewImg] = useState(null);
  const [formData, setFormData] = useState(dummyData);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  const images =
    formData.shop.gallery.length > 0
      ? formData.shop.gallery
      : dummyGallery;


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/shops", {
          headers: { Authorization: token },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
            user: { ...dummyData.user, ...data.user },
            shop: { ...dummyData.shop, ...data.shop },
          });
        }
      } catch (err) {
        console.error(err);
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
    await fetch("http://localhost:5000/api/v1/shops", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(formData),
    });
    alert("Profile updated");
  };

  return (<>
    <div className="container profileNew my-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 dash-header">
        <div className="d-flex align-items-center">
          <ChevronLeft className="go-back-btn" onClick={() => navigate(-1)} size={28} />
          {/* <button className="btn btn-icon me-3" >
      Go Back
    </button> */}
          <h4 className="mb-0 new-head-dash">
            Dashboard <span className="text-muted fw-normal font-sheriff" >/ Profile</span>
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


      {/* PROFILE SUMMARY */}
      <div className="profile-card-modern mb-4">
  <div className="profile-header">
    <img
      src={formData.user.profileImage}
      alt="profile"
      className="profile-avatar"
    />

    <div className="profile-main">
      <h5 className="profile-name">{formData.user.username}</h5>
      <p className="profile-parlour">{formData.shop.parlourName}</p>

      <div className="profile-meta">
        <span className="rating-badge">
          <Star size={14} fill="currentColor" />
          {formData.shop.totalRating}
        </span>
        <span className="dot">•</span>
        <span className="experience">
          {formData.user.experience}
        </span>
      </div>
    </div>

    <div className="profile-stats">
      <strong>{formData.shop.totalCustomers}+</strong>
      <span>Happy Customers</span>
    </div>
  </div>
</div>


      {/* DETAILS */}
<div className="row g-4 mb-4">
  <div className="col-md-6">
    <div className="card info-card h-100">
      <div className="card-body profile-card">
        <h6 className="card-title-accent">Contact & Business</h6>

        <div className="info-row">
          <Mail size={16} />
          <span>{formData.user.email}</span>
        </div>

        <div className="info-row">
          <Phone size={16} />
          <span>{formData.user.phone}</span>
        </div>

        <div className="info-row">
          <MapPin size={16} />
          <span>{formData.shop.address}</span>
        </div>

        <div className="info-row">
          <Clock size={16} />
          <span>{formData.shop.openingHours}</span>
        </div>

        <h6 className="card-title-accent mt-4">Amenities</h6>
        <div className="chip-group">
          {formData.shop.amenities.map((a, i) => (
            <span key={i} className="chip">{a}</span>
          ))}
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-6">
    <div className="card info-card h-100">
      <div className="card-body profile-card">
        <h6 className="card-title-accent">About</h6>
        <p className="about-text">{formData.shop.about}</p>

        <h6 className="card-title-accent mt-4">Services</h6>
        <div className="chip-group">
          {formData.shop.services.map((s, i) => (
            <span key={i} className="chip service">{s}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>


      {/* GALLERY */}
      <>
        <div className="card mb-4">
          <div className="card-body">
            {/* <h6 className="mb-3">Gallery</h6> */}

            <div className="row g-3">
              {images.map((img, i) => (
                <div className="col-6 col-md-4 col-lg-3" key={i}>
                  <div
                    className="gallery-box"
                    onClick={() => setPreviewImg(img)}
                  >
                    <img src={img} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {previewImg && (
          <div className="image-modal" onClick={() => setPreviewImg(null)}>
            <span className="close-btn">&times;</span>
            <img src={previewImg} className="modal-img" />
          </div>
        )}
      </>


      {/* MAP */}
      <div className="card">
        <iframe
          height="300"
          className="w-100 border-0"
          loading="lazy"
          src={`https://www.google.com/maps?q=${formData.shop.lat},${formData.shop.lng}&z=15&output=embed`}
        />
        <a
          href={formData.shop.googleReviewUrl}
          target="_blank"
          rel="noreferrer"
          className="map-link"
        >
          <Globe size={16} /> View on Google Maps
        </a>
      </div>

      {/* EDIT OFFCANVAS */}
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

    {/* PROFILE IMAGE */}
    <div className="ep-section">
      <h6 className="ep-section-title">Profile Image</h6>

      <div className="ep-profile-wrap">
        <img
          src={formData.user.profileImage}
          className="ep-profile-img"
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
          <span className="ep-hint">
            JPG / PNG • Square recommended
          </span>
        </div>
      </div>
    </div>

    {/* USER INFO */}
    <div className="ep-section">
      <h6 className="ep-section-title">User Information</h6>

      <div className="ep-grid">
        <input
          className="ep-input"
          placeholder="Username"
          value={formData.user.username}
          onChange={(e) =>
            handleChange("user", "username", e.target.value)
          }
        />

        <input
          className="ep-input"
          placeholder="Email"
          value={formData.user.email}
          onChange={(e) =>
            handleChange("user", "email", e.target.value)
          }
        />

        <input
          className="ep-input"
          placeholder="Phone"
          value={formData.user.phone}
          onChange={(e) =>
            handleChange("user", "phone", e.target.value)
          }
        />
      </div>
    </div>

    {/* SHOP INFO */}
    <div className="ep-section">
      <h6 className="ep-section-title">Shop Details</h6>

      <input
        className="ep-input"
        placeholder="Parlour Name"
        value={formData.shop.parlourName}
        onChange={(e) =>
          handleChange("shop", "parlourName", e.target.value)
        }
      />

      <textarea
        className="ep-textarea"
        rows="4"
        placeholder="About your shop"
        value={formData.shop.about}
        onChange={(e) =>
          handleChange("shop", "about", e.target.value)
        }
      />
    </div>

    {/* GALLERY */}
    <div className="ep-section">
      <h6 className="ep-section-title">Gallery Images</h6>

      <input
        type="file"
        accept="image/*"
        multiple
        className="ep-input"
        onChange={async (e) => {
          const files = Array.from(e.target.files);
          const images = await Promise.all(
            files.map((f) => fileToBase64(f))
          );
          handleChange("shop", "gallery", [
            ...formData.shop.gallery,
            ...images,
          ]);
        }}
      />

      <div className="ep-gallery">
        {formData.shop.gallery.map((img, i) => (
          <img key={i} src={img} className="ep-gallery-img" />
        ))}
      </div>
    </div>

    {/* MAP */}
    <div className="ep-section">
      <h6 className="ep-section-title">Location</h6>

      <div className="ep-grid">
        <input
          className="ep-input"
          placeholder="Latitude"
          value={formData.shop.lat}
          onChange={(e) =>
            handleChange("shop", "lat", e.target.value)
          }
        />

      <input
  className="ep-input"
  placeholder="Longitude"
  value={formData.shop.lng}
  onChange={(e) =>
    handleChange("shop", "lng", e.target.value)
  }
/>

      </div>

      <iframe
        className="ep-map"
        src={`https://www.google.com/maps?q=${formData.shop.lat},${formData.shop.lng}&z=15&output=embed`}
      />
    </div>

    {/* SAVE */}
    <div className="ep-save">
  <button
    className="ep-cancel-btn"
    data-bs-dismiss="offcanvas"
  >
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
    <Footer /></>
  );
};

export default MyProfileScreen;
