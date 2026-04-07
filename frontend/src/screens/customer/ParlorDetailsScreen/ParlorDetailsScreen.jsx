import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import {
  BASE_URL,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_NO_IMAGE,
} from "../../../constants/urls";
import "./ParlorDetailsScreen.css";
import Breadcrumb from "../../../components/Breadcrumb/Breadcrumb";

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
      const res = await fetch(`${BASE_URL}/customer/shop/${id}`);
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
          `${BASE_URL}/customer/reviews/${placeId}?page=${isInitial ? 1 : page}`
        );
        if (!res.ok) throw new Error("Reviews fetch failed");
        const data = await res.json();

        if (isInitial) {
          setImages(data?.images?.length > 0 ? data.images : []);
          setReviews(data?.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(data?.reviews || [])]);
        }

        setHasMoreReviews(data?.reviews && data.reviews.length === 10);
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

  const formatOpeningHours = (hours) => {
    if (!hours || Object.keys(hours).length === 0) {
      return "10:00 AM - 08:30 PM";
    }
    return hours;
  };

  const getServicePrice = (serviceId, regularPrice) => {
    const offer = parlour?.offers?.find((o) => o.serviceId === serviceId);
    return offer ? (
      <div className="price-container">
        <span className="offer-price">₹{offer.offerPrice}</span>
        <span className="regular-price-strike">₹{regularPrice}</span>
      </div>
    ) : (
      <span className="offer-price">₹{regularPrice}</span>
    );
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) {
      return parlour?.shop?.totalRating || "4.5";
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getTotalReviews = () => {
    return reviews?.length || 0;
  };

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

  const averageRating = calculateAverageRating();
  const totalReviews = getTotalReviews();

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
            {displayImages.length > 1 && (
              <div className="thumbnail-strip">
                {displayImages.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="thumb"
                    onClick={() => setSelectedImg(img)}
                  >
                    <img src={img} alt={`${shop?.parlourName} view ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-panel">
            <div className="badge-row">
              <span className="category-badge">
                {services.length > 0
                  ? `${services.length}+ Services`
                  : "Beauty Parlor"}
              </span>
              {offers.length > 0 && (
                <span className="offer-badge">
                  {offers.length} Offer{offers.length > 1 ? "s" : ""} Available
                </span>
              )}
            </div>
            <h1 className="shop-name">{shop?.parlourName}</h1>
            <div className="rating-row">
              <div className="stars">
                {"★".repeat(Math.round(parseFloat(averageRating) || 0))}
                {"☆".repeat(5 - Math.round(parseFloat(averageRating) || 0))}
              </div>
              <span className="rating-text">{averageRating}</span>
              <span className="count">
                ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
              </span>
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
                <span className="stat-value">
                  {formatOpeningHours(shop?.openingHours)}
                </span>
              </div>
            </div>
            <p className="about-short">
              {shop?.about?.substring(0, 150)}
              {shop?.about?.length > 150 ? "..." : ""}
            </p>
            <button
              className="book-now-main"
              onClick={() => {
                // setActiveTab("services");
                // document.getElementById("services-section")?.scrollIntoView({
                //   behavior: "smooth",
                // });
                navigate(`/parlor/${id}/services`);
              }}
            >
              View All Services
            </button>
          </div>
        </section>

        <section className="tabs-navigation" id="services-section">
          <div className="tabs-track">
            {["services", "reviews", "about"].map((tab) => (
              <button
                key={tab}
                className={`tab-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "services" && `${services.length} Services`}
                {tab === "reviews" && `${totalReviews} Reviews`}
                {tab === "about" && "About"}
              </button>
            ))}
          </div>
        </section>

        <div className="tab-content-area">
          {activeTab === "services" && (
            <div className="services-grid">
              {services.length > 0 ? (
                services.map((service) => (
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
                        {service.description?.substring(0, 80)}
                        {service.description?.length > 80 ? "..." : ""}
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
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services">
                  <p>No services available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-stack">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div
                    key={`${review.author_name}-${index}`}
                    className="review-item"
                    ref={
                      index === reviews.length - 1 ? lastReviewElementRef : null
                    }
                  >
                    <img
                      src={review.profile_photo_url || DEFAULT_AVATAR_IMAGE}
                      alt={review.author_name}
                      className="user-avatar"
                    />
                    <div className="review-body">
                      <div className="review-header">
                        <h4>{review.author_name}</h4>
                        <span className="review-date">
                          {review.relative_time_description}
                        </span>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      <p>{review.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
              {isLoadingReviews && (
                <div className="mini-spinner-container">
                  <div className="mini-spinner"></div>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="about-detailed">
              <div className="about-text-content">
                <h3>About Us</h3>
                <p>{shop?.about || "No description available."}</p>
                {/* <div className="amenities-grid">
                  <div className="amenity">
                    <span className="amenity-icon">✅</span>
                    AC Salon
                  </div>
                  <div className="amenity">
                    <span className="amenity-icon">✅</span>
                    Parking Available
                  </div>
                  <div className="amenity">
                    <span className="amenity-icon">✅</span>
                    Professional Products
                  </div>
                  <div className="amenity">
                    <span className="amenity-icon">✅</span>
                    Certified Staff
                  </div>
                </div> */}
              </div>
              <div className="location-map">
                <h3>Location</h3>
                {shop?.address && (
                  <iframe
                    title="Shop Location"
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                      shop.address
                    )}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {selectedImg && (
          <div className="lightbox" onClick={() => setSelectedImg(null)}>
            <img src={selectedImg} alt="Enlarged view" />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ParlorDetailsScreen;
