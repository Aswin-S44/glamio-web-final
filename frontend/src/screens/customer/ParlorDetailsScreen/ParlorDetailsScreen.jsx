import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import {
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_NO_IMAGE,
} from "../../../constants/urls";
import "./ParlorDetailsScreen.css";

const ParlorDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parlour, setParlour] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  const fetchParlourDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/v1/customer/shop/${id}`
      );
      if (!res.ok) throw new Error("Shop fetch failed");
      const data = await res.json();
      setParlour(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviewsAndImages = useCallback(
    async (placeId, isInitial = false) => {
      if (!placeId || isLoadingReviews || (!hasMoreReviews && !isInitial))
        return;

      setIsLoadingReviews(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/customer/reviews/${placeId}?page=${
            isInitial ? 1 : page
          }`
        );
        if (!res.ok) throw new Error("Reviews fetch failed");
        const data = await res.json();

        if (isInitial) {
          setImages(data?.images?.length > 0 ? data.images : []);
          setReviews(data?.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(data?.reviews || [])]);
        }

        if (!data?.reviews || data.reviews.length < 5) {
          setHasMoreReviews(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingReviews(false);
      }
    },
    [page, isLoadingReviews, hasMoreReviews]
  );

  useEffect(() => {
    fetchParlourDetails();
  }, [fetchParlourDetails]);

  useEffect(() => {
    if (parlour?.shop?.placeId) {
      fetchReviewsAndImages(parlour.shop.placeId, true);
    }
  }, [parlour?.shop?.placeId]);

  const lastReviewElementRef = useCallback(
    (node) => {
      if (isLoadingReviews) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreReviews) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingReviews, hasMoreReviews]
  );

  useEffect(() => {
    if (page > 1 && parlour?.shop?.placeId) {
      fetchReviewsAndImages(parlour.shop.placeId);
    }
  }, [page]);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  const shop = parlour?.shop;
  const services = parlour?.services || [];
  const offers = parlour?.offers || [];
  const displayImages =
    images.length > 0 ? images : [shop?.shopImage || DEFAULT_NO_IMAGE];

  const getServicePrice = (serviceId, regularPrice) => {
    const offer = offers.find((o) => o.serviceId === serviceId);
    return offer ? (
      <div className="price-container">
        <span className="offer-price">₹{offer.offerPrice}</span>
        <span className="regular-price-strike">₹{regularPrice}</span>
      </div>
    ) : (
      <span className="offer-price">₹{regularPrice}</span>
    );
  };

  return (
    <>
      <Header />
      <div className="parlor-details-container">
        <section className="hero-grid">
          <div className="main-gallery">
            <div
              className="featured-image"
              onClick={() => setSelectedImg(displayImages[0])}
            >
              <img src={displayImages[0]} alt={shop?.parlourName} />
            </div>
            <div className="thumbnail-strip">
              {displayImages.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="thumb"
                  onClick={() => setSelectedImg(img)}
                >
                  <img src={img} alt="Parlor view" />
                </div>
              ))}
            </div>
          </div>

          <div className="info-panel">
            <div className="badge-row">
              <span className="category-badge">Premium Studio</span>
              {offers.length > 0 && (
                <span className="offer-badge">Offers Available</span>
              )}
            </div>
            <h1 className="shop-name">{shop?.parlourName}</h1>
            <div className="rating-row">
              <div className="stars">
                {"★".repeat(Math.round(shop?.totalRating || 5))}
              </div>
              <span className="rating-text">{shop?.totalRating || "4.5"}</span>
              <span className="count">({reviews.length}+ Google Reviews)</span>
            </div>
            <p className="address-link">
              <i className="location-icon">📍</i> {shop?.address}
            </p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-label">Experience</span>
                <span className="stat-value">Professional</span>
              </div>
              <div className="stat">
                <span className="stat-label">Opening Hours</span>
                <span className="stat-value">10:00 AM - 08:30 PM</span>
              </div>
            </div>
            <p className="about-short">{shop?.about?.substring(0, 200)}...</p>
            <button
              className="book-now-main"
              onClick={() => setActiveTab("services")}
            >
              View All Services
            </button>
          </div>
        </section>

        <section className="tabs-navigation">
          <div className="tabs-track">
            {["services", "reviews", "about"].map((tab) => (
              <button
                key={tab}
                className={`tab-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <div className="tab-content-area">
          {activeTab === "services" && (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-img-container">
                    <img
                      src={service.imageUrl || DEFAULT_NO_IMAGE}
                      alt={service.name}
                    />
                  </div>
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p className="duration">⏳ {service.duration} mins</p>
                    <p className="description">
                      {service.description?.substring(0, 60)}...
                    </p>
                    <div className="service-footer">
                      {getServicePrice(service.id, service.rate)}
                      <button
                        className="btn-select"
                        onClick={() =>
                          navigate(
                            `/parlor/${service.shopId}/service/${service.id}`
                          )
                        }
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-stack">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="review-item"
                  ref={i === reviews.length - 1 ? lastReviewElementRef : null}
                >
                  <img
                    src={r.profile_photo_url || DEFAULT_AVATAR_IMAGE}
                    alt=""
                    className="user-avatar"
                  />
                  <div className="review-body">
                    <div className="review-header">
                      <h4>{r.author_name}</h4>
                      <span className="review-date">
                        {r.relative_time_description}
                      </span>
                    </div>
                    <div className="review-stars">{"★".repeat(r.rating)}</div>
                    <p>{r.text}</p>
                  </div>
                </div>
              ))}
              {isLoadingReviews && <div className="mini-spinner"></div>}
            </div>
          )}

          {activeTab === "about" && (
            <div className="about-detailed">
              <div className="about-text-content">
                <h3>Our Story</h3>
                <p>{shop?.about}</p>
                <div className="amenities-grid">
                  <div className="amenity">✅ AC Salon</div>
                  <div className="amenity">✅ Parking Available</div>
                  <div className="amenity">✅ Professional Products</div>
                  <div className="amenity">✅ Certified Staff</div>
                </div>
              </div>
              <div className="location-map">
                <h3>Location</h3>
                <iframe
                  title="map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    shop?.address
                  )}&output=embed`}
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {selectedImg && (
          <div className="lightbox" onClick={() => setSelectedImg(null)}>
            <img src={selectedImg} alt="Preview" />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ParlorDetailsScreen;
