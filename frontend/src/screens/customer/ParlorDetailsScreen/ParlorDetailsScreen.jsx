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
import {
  MapPin, Star, Clock, Phone, ChevronLeft, ChevronRight,
  Sparkles, Heart, Award, CheckCircle, ArrowRight, X, Loader2
} from "lucide-react";

const DUMMY_PARLOUR = {
  shop: {
    id: "s1",
    parlourName: "Glamour Studio",
    address: "12, MG Road, Bangalore, Karnataka 560001",
    about:
      "Glamour Studio is a premium beauty destination offering a luxurious range of hair, skin, and bridal services. Our certified professionals use top-tier products to ensure you leave feeling your absolute best. With over 10 years of experience, we're dedicated to transforming your beauty vision into reality.",
    totalRating: 4.8,
    openingHours: "9:00 AM – 9:00 PM",
    phone: "+91 98765 43210",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    placeId: null,
  },
  services: [
    { id: 1, shopId: "s1", name: "Hair Smoothing", duration: 90, rate: 1200, category: "Hair", description: "Professional keratin treatment for silky, frizz-free hair lasting up to 6 months.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400" },
    { id: 2, shopId: "s1", name: "Bridal Makeup", duration: 120, rate: 3500, category: "Makeup", description: "Stunning bridal look with premium products including airbrush foundation and false lashes.", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400" },
    { id: 3, shopId: "s1", name: "Full Body Waxing", duration: 60, rate: 800, category: "Waxing", description: "Smooth, long-lasting hair removal using premium hot wax suitable for all skin types.", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400" },
    { id: 4, shopId: "s1", name: "Facial (Gold)", duration: 75, rate: 1500, category: "Skin", description: "Rejuvenating gold facial with deep cleansing, massage and glow-boosting mask.", imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400" },
    { id: 5, shopId: "s1", name: "Nail Art & Extension", duration: 45, rate: 600, category: "Nails", description: "Custom nail art, gel polish and acrylic extensions by our skilled nail artists.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400" },
    { id: 6, shopId: "s1", name: "Eyelash Extension", duration: 60, rate: 900, category: "Lashes", description: "Volume and classic lash extensions applied with precision for a natural-to-dramatic look.", imageUrl: "https://images.unsplash.com/photo-1583241800706-a895a67f2428?w=400" },
  ],
  offers: [
    { serviceId: 1, offerPrice: 999 },
    { serviceId: 4, offerPrice: 1199 },
  ],
};

const DUMMY_REVIEWS = [
  { author_name: "Priya Sharma", rating: 5, text: "Absolutely loved my experience at Glamour Studio! The staff is so professional and friendly. My hair smoothing turned out perfect.", profile_photo_url: null, relative_time_description: "2 weeks ago" },
  { author_name: "Anjali Rao", rating: 5, text: "Got my bridal makeup done here and I was blown away. They understood exactly what I wanted and executed it flawlessly. Highly recommend!", profile_photo_url: null, relative_time_description: "1 month ago" },
  { author_name: "Meera Patel", rating: 4, text: "Great salon overall. The facial left my skin glowing for days. Would have given 5 stars but the wait time was a bit long.", profile_photo_url: null, relative_time_description: "3 weeks ago" },
  { author_name: "Sunita Verma", rating: 5, text: "Best nail art in Bangalore! The nail artist is so creative and skilled. My gel manicure lasted over 3 weeks without chipping.", profile_photo_url: null, relative_time_description: "5 days ago" },
];

const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
];

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
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [usingDummy, setUsingDummy] = useState(false);
  const observer = useRef();

  const fetchParlourDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/customer/shop/${id}`);
      if (!res.ok) throw new Error("Shop fetch failed");
      const data = await res.json();
      if (data && data.shop) {
        setParlour(data);
      } else {
        setParlour(DUMMY_PARLOUR);
        setImages(DUMMY_IMAGES);
        setReviews(DUMMY_REVIEWS);
        setUsingDummy(true);
      }
    } catch {
      setParlour(DUMMY_PARLOUR);
      setImages(DUMMY_IMAGES);
      setReviews(DUMMY_REVIEWS);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviewsAndImages = useCallback(
    async (placeId, isInitial = false) => {
      if (!placeId || isLoadingReviews || (!hasMoreReviews && !isInitial)) return;
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
      } catch {
        // keep existing reviews
      } finally {
        setIsLoadingReviews(false);
      }
    },
    [page, isLoadingReviews, hasMoreReviews]
  );

  useEffect(() => { fetchParlourDetails(); }, [fetchParlourDetails]);

  useEffect(() => {
    if (parlour?.shop?.placeId) {
      fetchReviewsAndImages(parlour.shop.placeId, true);
    }
  }, [parlour?.shop?.placeId]);

  const lastReviewRef = useCallback(
    (node) => {
      if (isLoadingReviews) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreReviews) setPage((p) => p + 1);
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingReviews, hasMoreReviews]
  );

  useEffect(() => {
    if (page > 1 && parlour?.shop?.placeId) fetchReviewsAndImages(parlour.shop.placeId);
  }, [page]);

  const getServicePrice = (serviceId, regularPrice) => {
    const offer = parlour?.offers?.find((o) => o.serviceId === serviceId);
    return offer ? (
      <div className="pd-price-wrap">
        <span className="pd-offer-price">₹{offer.offerPrice}</span>
        <span className="pd-strike">₹{regularPrice}</span>
      </div>
    ) : (
      <span className="pd-price">₹{regularPrice}</span>
    );
  };

  const avgRating = (() => {
    if (!reviews || reviews.length === 0) return parlour?.shop?.totalRating || "4.5";
    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  })();

  const displayImages = images.length > 0 ? images : [parlour?.shop?.shopImage || DEFAULT_NO_IMAGE];

  if (loading) {
    return (
      <div className="pd-loader">
        <Header />
        <div className="pd-loader-inner">
          <div className="pd-spinner"><Loader2 size={36} className="pd-spin" /></div>
          <p>Loading salon details...</p>
        </div>
      </div>
    );
  }

  const shop = parlour?.shop;
  const services = parlour?.services || [];
  const offers = parlour?.offers || [];

  return (
    <div className="pd-page">
      <Header />

      {/* Image Gallery Hero */}
      <section className="pd-gallery">
        <div className="pd-gallery-main" onClick={() => setSelectedImg(displayImages[currentImgIdx])}>
          <img
            src={displayImages[currentImgIdx]}
            alt={shop?.parlourName}
            className="pd-gallery-hero-img"
            onError={(e) => { e.target.src = DEFAULT_NO_IMAGE; }}
          />
          <div className="pd-gallery-overlay">
            <button className="pd-gallery-zoom">View Full Gallery</button>
          </div>
          {displayImages.length > 1 && (
            <>
              <button className="pd-gallery-nav left" onClick={(e) => { e.stopPropagation(); setCurrentImgIdx((i) => (i - 1 + displayImages.length) % displayImages.length); }}>
                <ChevronLeft size={22} />
              </button>
              <button className="pd-gallery-nav right" onClick={(e) => { e.stopPropagation(); setCurrentImgIdx((i) => (i + 1) % displayImages.length); }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="pd-thumbs">
            {displayImages.slice(0, 5).map((img, i) => (
              <div
                key={i}
                className={`pd-thumb ${currentImgIdx === i ? "active" : ""}`}
                onClick={() => setCurrentImgIdx(i)}
              >
                <img src={img} alt={`view ${i + 1}`} onError={(e) => { e.target.src = DEFAULT_NO_IMAGE; }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Panel */}
      <section className="pd-info-section">
        <div className="pd-info-container">
          <div className="pd-info-left">
            <div className="pd-badges-row">
              {services.length > 0 && (
                <span className="pd-badge services">{services.length}+ Services</span>
              )}
              {offers.length > 0 && (
                <span className="pd-badge offer">{offers.length} Offer{offers.length > 1 ? "s" : ""} Available</span>
              )}
              {usingDummy && (
                <span className="pd-badge demo">Demo</span>
              )}
            </div>

            <h1 className="pd-shop-name">{shop?.parlourName}</h1>

            <div className="pd-rating-row">
              <div className="pd-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(+avgRating) ? "#FFD700" : "none"} color={i < Math.round(+avgRating) ? "#FFD700" : "#CBD5E1"} />
                ))}
              </div>
              <span className="pd-rating-num">{avgRating}</span>
              <span className="pd-review-count">({reviews.length} reviews)</span>
            </div>

            <div className="pd-meta-pills">
              <div className="pd-meta-pill">
                <MapPin size={15} />
                <span>{shop?.address}</span>
              </div>
              {shop?.openingHours && (
                <div className="pd-meta-pill">
                  <Clock size={15} />
                  <span>{typeof shop.openingHours === "string" ? shop.openingHours : "10:00 AM – 8:30 PM"}</span>
                </div>
              )}
              {shop?.phone && (
                <div className="pd-meta-pill">
                  <Phone size={15} />
                  <span>{shop.phone}</span>
                </div>
              )}
            </div>

            {shop?.about && (
              <p className="pd-about-short">
                {shop.about.substring(0, 160)}{shop.about.length > 160 ? "..." : ""}
              </p>
            )}
          </div>

          <div className="pd-info-right">
            <div className="pd-booking-card">
              <div className="pd-booking-card-header">
                <Sparkles size={20} />
                <span>Ready to book?</span>
              </div>
              <div className="pd-quick-stats">
                <div className="pd-qs">
                  <Award size={18} />
                  <div>
                    <span className="pd-qs-label">Experience</span>
                    <span className="pd-qs-val">Professional</span>
                  </div>
                </div>
                <div className="pd-qs">
                  <CheckCircle size={18} />
                  <div>
                    <span className="pd-qs-label">Status</span>
                    <span className="pd-qs-val">Open Now</span>
                  </div>
                </div>
                <div className="pd-qs">
                  <Star size={18} fill="#FFD700" color="#FFD700" />
                  <div>
                    <span className="pd-qs-label">Rating</span>
                    <span className="pd-qs-val">{avgRating} / 5.0</span>
                  </div>
                </div>
              </div>
              <button
                className="pd-book-btn"
                onClick={() => navigate(`/parlor/${id}/services`)}
              >
                View All Services <ArrowRight size={18} />
              </button>
              <button className="pd-wish-btn">
                <Heart size={16} /> Save to Wishlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="pd-tabs-bar">
        <div className="pd-tabs-inner">
          {["services", "reviews", "about"].map((tab) => (
            <button
              key={tab}
              className={`pd-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "services" && `Services (${services.length})`}
              {tab === "reviews" && `Reviews (${reviews.length})`}
              {tab === "about" && "About"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pd-tab-content">

        {/* Services */}
        {activeTab === "services" && (
          <div className="pd-services-grid">
            {services.length > 0 ? services.map((service) => (
              <div key={service.id} className="pd-service-card">
                <div className="pd-service-img-wrap">
                  <img
                    src={service.imageUrl || DEFAULT_NO_IMAGE}
                    alt={service.name}
                    onError={(e) => { e.target.src = DEFAULT_NO_IMAGE; }}
                  />
                  {offers.find((o) => o.serviceId === service.id) && (
                    <span className="pd-service-offer-badge">Offer</span>
                  )}
                </div>
                <div className="pd-service-body">
                  <h3>{service.name}</h3>
                  <div className="pd-service-duration">
                    <Clock size={13} />
                    <span>{service.duration} mins</span>
                  </div>
                  {service.description && (
                    <p className="pd-service-desc">
                      {service.description.substring(0, 90)}{service.description.length > 90 ? "..." : ""}
                    </p>
                  )}
                  <div className="pd-service-foot">
                    {getServicePrice(service.id, service.rate)}
                    <button
                      className="pd-book-service-btn"
                      onClick={() => navigate(`/parlor/${service.shopId}/service/${service.id}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="pd-empty">
                <Sparkles size={40} />
                <p>No services available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="pd-reviews-wrap">
            {reviews.length > 0 ? (
              <div className="pd-reviews-list">
                {reviews.map((review, i) => (
                  <div
                    key={i}
                    className="pd-review-card"
                    ref={i === reviews.length - 1 ? lastReviewRef : null}
                  >
                    <div className="pd-review-avatar">
                      <img
                        src={review.profile_photo_url || DEFAULT_AVATAR_IMAGE}
                        alt={review.author_name}
                        onError={(e) => { e.target.src = DEFAULT_AVATAR_IMAGE; }}
                      />
                    </div>
                    <div className="pd-review-body">
                      <div className="pd-review-top">
                        <div>
                          <h4>{review.author_name}</h4>
                          <div className="pd-review-stars">
                            {Array.from({ length: 5 }, (_, si) => (
                              <Star key={si} size={13} fill={si < review.rating ? "#FFD700" : "none"} color={si < review.rating ? "#FFD700" : "#CBD5E1"} />
                            ))}
                          </div>
                        </div>
                        <span className="pd-review-time">{review.relative_time_description}</span>
                      </div>
                      <p>{review.text}</p>
                    </div>
                  </div>
                ))}
                {isLoadingReviews && (
                  <div className="pd-review-loading">
                    <Loader2 size={24} className="pd-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="pd-empty">
                <Star size={40} />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        )}

        {/* About */}
        {activeTab === "about" && (
          <div className="pd-about-wrap">
            <div className="pd-about-text">
              <h3>About {shop?.parlourName}</h3>
              <p>{shop?.about || "No description available for this salon."}</p>

              <div className="pd-amenities">
                {["AC Salon", "Parking Available", "Professional Products", "Certified Staff", "Online Booking", "Home Service"].map((a) => (
                  <div key={a} className="pd-amenity">
                    <CheckCircle size={16} />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-about-map">
              <h3>Location</h3>
              {shop?.address && (
                <iframe
                  title="Shop Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.address)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(shop?.address || "")}`}
                target="_blank"
                rel="noreferrer"
                className="pd-directions-link"
              >
                <MapPin size={15} /> Get Directions
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div className="pd-lightbox" onClick={() => setSelectedImg(null)}>
          <button className="pd-lightbox-close"><X size={24} /></button>
          <img src={selectedImg} alt="Enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ParlorDetailsScreen;
