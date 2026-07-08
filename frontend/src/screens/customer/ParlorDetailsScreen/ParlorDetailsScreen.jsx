import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import {
  BASE_URL,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_NO_IMAGE,
} from "../../../constants/urls";
import { getShopIdFromSlug } from "../../../utils/shopUrl.util";
import {
  isWishlisted,
  toggleWishlist,
  WISHLIST_EVENT,
} from "../../../utils/wishlist.util";
import "./ParlorDetailsScreen.css";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Award,
  CheckCircle,
  ArrowRight,
  X,
  Loader2,
  Grid,
  Tag,
} from "lucide-react";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%232b2b33'/%3E%3Ccircle cx='44' cy='32' r='8' fill='%234b4b57'/%3E%3Cpath d='M24 66l20-24 16 18 12-14 24 32z' fill='%234b4b57'/%3E%3C/svg%3E";

const ParlorDetailsScreen = () => {
  const { slug } = useParams();
  const id = getShopIdFromSlug(slug);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBookNow = (path) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", path);
      navigate("/signin");
      return;
    }
    navigate(path);
  };
  const [parlour, setParlour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [page, setPage] = useState(1);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [wished, setWished] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [placeId, setPlaceId] = useState(null);
  const [allReviewsFetched, setAllReviewsFetched] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryTabs, setCategoryTabs] = useState([]);

  const fetchParlourDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}/customer/shop/${id}`);

      if (!res.ok) {
        throw new Error("Salon details could not be loaded.");
      }

      const data = await res.json();
      if (!data?.shop) {
        throw new Error("Salon not found.");
      }

      setParlour(data);

      let allImages = [];
      if (data.shop.shopImage) {
        allImages.push(data.shop.shopImage);
      }
      if (data?.shop?.galleryImages?.length) {
        allImages = [...allImages, ...data.shop.galleryImages];
      }
      setImages(allImages);

      if (data.shop.placeId) {
        setPlaceId(data.shop.placeId);
      }

      if (data.services && data.services.length > 0) {
        const categories = [];
        const categoryMap = new Map();
        data.services.forEach((service) => {
          if (service.category && !categoryMap.has(service.category.id)) {
            categoryMap.set(service.category.id, {
              id: service.category.id,
              name: service.category.name,
            });
          }
        });
        const uniqueCategories = Array.from(categoryMap.values());
        setCategoryTabs(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0].id);
        }
      }
    } catch (err) {
      setParlour(null);
      setImages([]);
      setError(err.message || "Unable to load salon details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const shopId = parlour?.shop?.id;
    if (!shopId) return;
    const syncWished = () => setWished(isWishlisted(shopId));
    syncWished();
    window.addEventListener(WISHLIST_EVENT, syncWished);
    window.addEventListener("storage", syncWished);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, syncWished);
      window.removeEventListener("storage", syncWished);
    };
  }, [parlour]);

  const handleToggleWishlist = () => {
    const shop = parlour?.shop;
    if (!shop?.id) return;
    toggleWishlist(shop);
  };

  const fetchPaginatedReviews = useCallback(
    async (pageNum = 1, append = false) => {
      if (!placeId) {
        return;
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoadingReviews(true);
        }

        const url = `${BASE_URL}/shops/reviews/${placeId}/paginated?page=${pageNum}&limit=5&sortBy=${sortBy}&sortOrder=${sortOrder}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to load reviews");
        }

        const data = await res.json();

        if (data.success) {
          const reviewsData = data.data.reviews || [];
          const pagination = data.data.pagination || {};

          if (append) {
            setReviews((prev) => {
              const newReviews = [...prev, ...reviewsData];
              return newReviews;
            });
          } else {
            setReviews(reviewsData);
            setTotalReviews(data.data.totalReviews || 0);
            setAverageRating(data.data.averageRating || 0);
          }

          const hasNext = Boolean(pagination.hasNextPage);
          setHasMoreReviews(hasNext);
          setPage(pagination.page || pageNum);

          if (!hasNext && reviewsData.length > 0) {
            setAllReviewsFetched(true);
          }
        } else {
          console.error("API returned error:", data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        if (!append) {
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
          setHasMoreReviews(false);
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoadingReviews(false);
        }
      }
    },
    [placeId, sortBy, sortOrder]
  );

  const loadMoreReviews = () => {
    if (!hasMoreReviews || isLoadingMore) {
      return;
    }
    const nextPage = page + 1;
    fetchPaginatedReviews(nextPage, true);
  };

  useEffect(() => {
    if (!placeId) return;
    setReviews([]);
    setPage(1);
    setHasMoreReviews(false);
    setAllReviewsFetched(false);
    fetchPaginatedReviews(1, false);
  }, [placeId, sortBy, sortOrder, fetchPaginatedReviews]);

  useEffect(() => {
    if (id) {
      fetchParlourDetails();
    }
  }, [fetchParlourDetails]);

  const getServicePrice = (serviceId, regularPrice) => {
    const offer = parlour?.offers?.find((item) => item.serviceId === serviceId);
    return offer ? (
      <div className="pd-price-wrap">
        <span className="pd-offer-price">Rs {offer.offerPrice}</span>
        <span className="pd-strike">Rs {regularPrice}</span>
      </div>
    ) : (
      <span className="pd-price">Rs {regularPrice}</span>
    );
  };

  const getOfferForService = (serviceId) => {
    return parlour?.offers?.find((item) => item.serviceId === serviceId);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const openGallery = (index) => {
    const displayImages = images.length > 0 ? images : [DEFAULT_NO_IMAGE];
    const safeIndex = Math.min(Math.max(0, index), displayImages.length - 1);
    setSelectedImgIndex(safeIndex);
    setSelectedImg(displayImages[safeIndex]);
    setIsGalleryOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImg(null);
    setSelectedImgIndex(0);
    document.body.style.overflow = "unset";
  };

  const navigateGallery = (direction) => {
    const displayImages = images.length > 0 ? images : [DEFAULT_NO_IMAGE];
    if (displayImages.length === 0) return;
    let newIndex = selectedImgIndex + direction;
    if (newIndex < 0) {
      newIndex = displayImages.length - 1;
    } else if (newIndex >= displayImages.length) {
      newIndex = 0;
    }
    setSelectedImgIndex(newIndex);
    setSelectedImg(displayImages[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") {
        closeGallery();
      } else if (e.key === "ArrowLeft") {
        navigateGallery(-1);
      } else if (e.key === "ArrowRight") {
        navigateGallery(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGalleryOpen, selectedImgIndex]);

  const ServiceCarousel = ({ images, serviceId }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    let intervalRef = useRef(null);

    const hasMultipleImages = images && images.length > 1;

    const goToNext = () => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
      setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
      setCurrentIdx(index);
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

    if (!images || images.length === 0) {
      return <img src={DEFAULT_NO_IMAGE} alt="Service" />;
    }

    return (
      <div
        className="pd-service-carousel-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="pd-service-carousel-slides">
          {images.map((img, index) => (
            <div
              key={index}
              className={`pd-service-carousel-slide ${
                index === currentIdx ? "active" : ""
              }`}
              style={{ transform: `translateX(-${currentIdx * 100}%)` }}
            >
              <img
                src={img}
                alt={`Service ${index + 1}`}
                onError={(e) => {
                  e.target.src = DEFAULT_NO_IMAGE;
                }}
              />
            </div>
          ))}
        </div>

        {hasMultipleImages && (
          <>
            <button
              className="pd-service-carousel-btn pd-service-carousel-prev"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="pd-service-carousel-btn pd-service-carousel-next"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight size={18} />
            </button>

            <div className="pd-service-carousel-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`pd-service-carousel-dot ${
                    index === currentIdx ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                />
              ))}
            </div>

            <div className="pd-service-carousel-counter">
              {currentIdx + 1}/{images.length}
            </div>
          </>
        )}
      </div>
    );
  };

  const getFilteredServices = () => {
    const services = parlour?.services || [];
    if (!selectedCategory) return services;
    return services.filter(
      (service) => service.category && service.category.id === selectedCategory
    );
  };

  if (loading) {
    return (
      <div className="pd-loader">
        <Header />
        <div className="pd-loader-inner">
          <div className="pd-spinner">
            <Loader2 size={36} className="pd-spin" />
          </div>
          <p>Loading salon details...</p>
        </div>
      </div>
    );
  }

  if (!parlour) {
    return (
      <div className="pd-loader">
        <Header />
        <div className="pd-loader-inner">
          <p>{error || "Salon details are unavailable right now."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const shop = parlour.shop;
  const services = parlour.services || [];
  const offers = parlour.offers || [];
  const activeOfferCount = offers.length;
  const displayImages = images.length > 0 ? images : [DEFAULT_NO_IMAGE];
  const filteredServices = getFilteredServices();

  return (
    <div className="pd-page">
      <Header />

      <section className="pd-gallery">
        <div
          className="pd-gallery-main"
          onClick={() => openGallery(currentImgIdx)}
        >
          <img
            src={displayImages[currentImgIdx]}
            alt={shop?.parlourName}
            className="pd-gallery-hero-img"
            onError={(e) => {
              if (e.target.src === PLACEHOLDER_IMG) return;
              e.target.src = PLACEHOLDER_IMG;
            }}
          />
          <div className="pd-gallery-overlay">
            <button className="pd-gallery-zoom">
              <Grid size={18} />
              View Full Gallery ({displayImages.length})
            </button>
          </div>
          {displayImages.length > 1 && (
            <span className="pd-gallery-counter">
              {currentImgIdx + 1} / {displayImages.length}
            </span>
          )}
          {displayImages.length > 1 && (
            <>
              <button
                className="pd-gallery-nav left"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIdx(
                    (index) =>
                      (index - 1 + displayImages.length) % displayImages.length
                  );
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="pd-gallery-nav right"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIdx(
                    (index) => (index + 1) % displayImages.length
                  );
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="pd-thumbs">
            {displayImages.slice(0, 6).map((img, i) => (
              <div
                key={i}
                className={`pd-thumb ${currentImgIdx === i ? "active" : ""}`}
                onClick={() => setCurrentImgIdx(i)}
              >
                <img
                  src={img}
                  alt={`view ${i + 1}`}
                  onError={(e) => {
                    e.target.src = DEFAULT_NO_IMAGE;
                  }}
                />
                {i === 5 && displayImages.length > 6 && (
                  <div className="pd-thumb-more" onClick={() => openGallery(5)}>
                    +{displayImages.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {isGalleryOpen && (
        <div className="pd-lightbox pd-lightbox-gallery" onClick={closeGallery}>
          <button className="pd-lightbox-close" onClick={closeGallery}>
            <X size={28} />
          </button>
          <div
            className="pd-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pd-lightbox-image-wrap">
              <img
                src={selectedImg || DEFAULT_NO_IMAGE}
                alt={`Gallery ${selectedImgIndex + 1}`}
                onError={(e) => {
                  e.target.src = DEFAULT_NO_IMAGE;
                }}
              />
              {displayImages.length > 1 && (
                <>
                  <button
                    className="pd-lightbox-nav left"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateGallery(-1);
                    }}
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    className="pd-lightbox-nav right"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateGallery(1);
                    }}
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
            <div className="pd-lightbox-info">
              <span className="pd-lightbox-counter">
                {selectedImgIndex + 1} / {displayImages.length}
              </span>
              <div className="pd-lightbox-thumbs">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`pd-lightbox-thumb ${
                      selectedImgIndex === idx ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedImgIndex(idx);
                      setSelectedImg(displayImages[idx]);
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = DEFAULT_NO_IMAGE;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="pd-info-section">
        <div className="pd-info-container">
          <div className="pd-info-left">
            <div className="pd-badges-row">
              {services.length > 0 && (
                <span className="pd-badge services">
                  {services.length}+ Services
                </span>
              )}
              {activeOfferCount > 0 && (
                <span className="pd-badge offer">
                  {activeOfferCount} Offer{activeOfferCount > 1 ? "s" : ""}{" "}
                  Available
                </span>
              )}
            </div>

            <h1 className="pd-shop-name">{shop?.parlourName}</h1>

            <div className="pd-rating-row">
              <div className="pd-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(averageRating) ? "#FFD700" : "none"}
                    color={
                      i < Math.round(averageRating) ? "#FFD700" : "#CBD5E1"
                    }
                  />
                ))}
              </div>
              <span className="pd-rating-num">{averageRating}</span>
              <span className="pd-review-count">({totalReviews} reviews)</span>
            </div>

            <div className="pd-meta-pills">
              <div className="pd-meta-pill">
                <MapPin size={15} />
                <span>{shop?.address || "Address not available"}</span>
              </div>
              {shop?.openingHours && (
                <div className="pd-meta-pill">
                  <Clock size={15} />
                  <span>
                    {typeof shop.openingHours === "string"
                      ? shop.openingHours
                      : "Opening hours available on request"}
                  </span>
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
                {shop.about.substring(0, 160)}
                {shop.about.length > 160 ? "..." : ""}
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
                    <span className="pd-qs-val">{averageRating} / 5.0</span>
                  </div>
                </div>
              </div>
              <button
                className="pd-book-btn"
                onClick={() => handleBookNow(`/parlor/${id}/services`)}
              >
                View All Services <ArrowRight size={18} />
              </button>
              <button
                className={`pd-wish-btn ${wished ? "active" : ""}`}
                onClick={handleToggleWishlist}
              >
                <Heart size={16} fill={wished ? "currentColor" : "none"} />
                {wished ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="pd-tabs-bar">
        <div className="pd-tabs-inner">
          {["services", "reviews", "about"].map((tab) => (
            <button
              key={tab}
              className={`pd-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "services" && `Services (${services.length})`}
              {tab === "reviews" && `Reviews (${totalReviews})`}
              {tab === "about" && "About"}
            </button>
          ))}
        </div>
      </div>

      <div className="pd-tab-content">
        {activeTab === "services" && (
          <>
            {categoryTabs.length > 1 && (
              <div className="pd-category-tabs">
                <button
                  className={`pd-category-tab ${
                    !selectedCategory ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Services
                </button>
                {categoryTabs.map((category) => (
                  <button
                    key={category.id}
                    className={`pd-category-tab ${
                      selectedCategory === category.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            <div className="pd-services-grid">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => {
                  const offer = getOfferForService(service.id);
                  return (
                    <div key={service.id} className="pd-service-card">
                      <div className="pd-service-img-wrap">
                        <ServiceCarousel
                          images={service.images || [DEFAULT_NO_IMAGE]}
                          serviceId={service.id}
                        />
                        {offer && (
                          <span className="pd-service-offer-badge">
                            <Tag size={12} />
                            Offer
                          </span>
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
                            {service.description.substring(0, 90)}
                            {service.description.length > 90 ? "..." : ""}
                          </p>
                        )}

                        {offer && offer.description && (
                          <div className="pd-offer-description">
                            <Tag size={14} />
                            <span>{offer.description}</span>
                          </div>
                        )}

                        <div className="pd-service-foot">
                          {getServicePrice(service.id, service.rate)}
                          <button
                            className="pd-book-service-btn"
                            onClick={() =>
                              handleBookNow(
                                `/parlor/${service.shopId}/service/${service.id}`
                              )
                            }
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pd-empty">
                  <Sparkles size={40} />
                  <p>No services available in this category.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "reviews" && (
          <div className="pd-reviews-wrap">
            <div className="pd-reviews-sort">
              <span>Sort by:</span>
              <button
                className={`pd-sort-btn ${sortBy === "time" ? "active" : ""}`}
                onClick={() => handleSortChange("time")}
              >
                Date {sortBy === "time" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                className={`pd-sort-btn ${sortBy === "rating" ? "active" : ""}`}
                onClick={() => handleSortChange("rating")}
              >
                Rating{" "}
                {sortBy === "rating" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                className={`pd-sort-btn ${
                  sortBy === "author_name" ? "active" : ""
                }`}
                onClick={() => handleSortChange("author_name")}
              >
                Name{" "}
                {sortBy === "author_name" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
            </div>

            {isLoadingReviews && reviews.length === 0 ? (
              <div className="pd-review-loading">
                <Loader2 size={36} className="pd-spin" />
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="pd-reviews-list">
                {reviews.map((review, index) => (
                  <div
                    key={`${review.time}-${index}`}
                    className="pd-review-card"
                  >
                    <div className="pd-review-avatar">
                      <img
                        src={review.profile_photo_url || DEFAULT_AVATAR_IMAGE}
                        alt={review.author_name}
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR_IMAGE;
                        }}
                      />
                    </div>
                    <div className="pd-review-body">
                      <div className="pd-review-top">
                        <div>
                          <h4>{review.author_name}</h4>
                          <div className="pd-review-stars">
                            {Array.from({ length: 5 }, (_, si) => (
                              <Star
                                key={si}
                                size={13}
                                fill={si < review.rating ? "#FFD700" : "none"}
                                color={
                                  si < review.rating ? "#FFD700" : "#CBD5E1"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <span className="pd-review-time">
                          {review.relative_time_description}
                        </span>
                      </div>
                      <p className="pd-review-text">{review.text}</p>
                      {review.response && (
                        <div className="pd-owner-response">
                          <strong>Owner Response:</strong>
                          <p>{review.response.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoadingMore && (
                  <div className="pd-review-loading">
                    <Loader2 size={24} className="pd-spin" />
                    <span>Loading more reviews...</span>
                  </div>
                )}

                {hasMoreReviews ? (
                  <button
                    className="pd-load-more-btn"
                    onClick={loadMoreReviews}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={18} className="pd-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Reviews ({reviews.length} of {totalReviews})
                      </>
                    )}
                  </button>
                ) : (
                  reviews.length > 0 && (
                    <div className="pd-all-loaded">
                      <p>✓ All {reviews.length} reviews loaded</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="pd-empty">
                <Star size={40} />
                <p>No reviews available yet for this salon.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="pd-about-wrap">
            <div className="pd-about-text">
              <h3>About {shop?.parlourName}</h3>
              <p>{shop?.about || "No description available for this salon."}</p>

              <div className="pd-amenities">
                {[
                  "AC Salon",
                  "Parking Available",
                  "Professional Products",
                  "Certified Staff",
                  "Online Booking",
                  "Home Service",
                ].map((amenity) => (
                  <div key={amenity} className="pd-amenity">
                    <CheckCircle size={16} />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-about-map">
              <h3>Location</h3>
              {parlour?.shop?.googleReviewUrl ? (
                <iframe
                  title="Shop Location"
                  src={`https://www.google.com/maps/embed/v1/place?key=${
                    process.env.REACT_APP_GOOGLE_MAPS_API_KEY
                  }&q=${encodeURIComponent(parlour.shop.googleReviewUrl)}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: "400px", border: 0 }}
                  allowFullScreen
                />
              ) : (
                <p>Address not available.</p>
              )}

              {shop?.googleReviewUrl && (
                <a
                  href={shop?.googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pd-directions-link"
                >
                  <MapPin size={15} /> Get Directions
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ParlorDetailsScreen;
