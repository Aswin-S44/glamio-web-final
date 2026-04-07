import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Tag,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Scissors,
  Heart,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";

import "./ServicesListingScreen.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";

const ServicesListingScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [parlour, setParlour] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    fetchParlourAndServices();
  }, [id]);

  const fetchParlourAndServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/customer/shop/${id}`);
      if (!res.ok) throw new Error("Failed to fetch shop details");
      const data = await res.json();
      setParlour(data.shop);
      setServices(data.services || []);

      // Set initial price range
      if (data.services?.length) {
        const prices = data.services.map((s) => s.rate);
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const getCategories = () => {
    const categories = services.map((s) => s.category).filter(Boolean);
    return ["all", ...new Set(categories)];
  };

  const getFilteredServices = () => {
    let filtered = [...services];

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((s) => s.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (s) => s.rate >= priceRange.min && s.rate <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.rate - b.rate);
        break;
      case "price_high":
        filtered.sort((a, b) => b.rate - a.rate);
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.rate, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  };

  const handleProceedToBooking = () => {
    if (selectedServices.length === 0) return;

    // Store selected services in session storage
    sessionStorage.setItem(
      "selectedServices",
      JSON.stringify(selectedServices)
    );
    sessionStorage.setItem("shopId", id);

    // Navigate to slot selection with multiple services
    navigate(`/parlor/${id}/slot-selection`, {
      state: {
        selectedServices: selectedServices,
        shopId: id,
        isMultipleServices: true,
      },
    });
  };

  const getServicePrice = (service) => {
    const offer = parlour?.offers?.find((o) => o.serviceId === service.id);
    return offer ? (
      <div className="price-wrapper">
        <span className="offer-price">₹{offer.offerPrice}</span>
        <span className="original-price">₹{service.rate}</span>
      </div>
    ) : (
      <span className="regular-price">₹{service.rate}</span>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="services-loader">
          <div className="loader-spinner">
            <Sparkles size={48} className="spinning" />
          </div>
          <p>Loading our services...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <Footer />
      </>
    );
  }

  const categories = getCategories();
  const filteredServices = getFilteredServices();

  return (
    <>
      <Header />

      <div className="services-listing-container">
        <div className="services-hero">
          <div className="hero-content">
            <h1>Our Services</h1>
            <p>Choose the perfect services for your beauty needs</p>
            {parlour && (
              <div className="shop-badge">
                <Star size={16} fill="#FFD700" />
                <span>{parlour.parlourName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="listing-main">
          <div className="listing-header">
            <div className="header-left">
              <h2>
                {filteredServices.length} Services Available
                {selectedServices.length > 0 && (
                  <span className="selected-count">
                    {selectedServices.length} selected
                  </span>
                )}
              </h2>
            </div>
            <div className="header-right">
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                Filters
              </button>
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`filters-panel ${showFilters ? "open" : ""}`}>
            <div className="filters-content">
              <div className="filter-group">
                <h4>Categories</h4>
                <div className="category-chips">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`chip ${
                        activeCategory === cat ? "active" : ""
                      }`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat === "all" ? "All Services" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        min: Number(e.target.value),
                      })
                    }
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="filter-group">
                <h4>Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="duration">Duration: Short to Long</option>
                </select>
              </div>
            </div>
          </div>

          <div className="services-grid-listing">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`service-card-listing ${
                    selectedServices.find((s) => s.id === service.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="service-image">
                    <img
                      src={service.imageUrl || DEFAULT_NO_IMAGE}
                      alt={service.name}
                    />
                    {selectedServices.find((s) => s.id === service.id) && (
                      <div className="selected-overlay">
                        <CheckCircle2 size={32} />
                      </div>
                    )}
                  </div>

                  <div className="service-details">
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <div className="service-duration">
                        <Clock size={14} />
                        <span>{service.duration} min</span>
                      </div>
                    </div>

                    {service.description && (
                      <p className="service-description">
                        {service.description.substring(0, 100)}
                        {service.description.length > 100 ? "..." : ""}
                      </p>
                    )}

                    <div className="service-footer">
                      {getServicePrice(service)}
                      <button
                        className={`select-btn ${
                          selectedServices.find((s) => s.id === service.id)
                            ? "selected"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceToggle(service);
                        }}
                      >
                        {selectedServices.find((s) => s.id === service.id) ? (
                          <>
                            <CheckCircle2 size={16} />
                            Selected
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={16} />
                            Select
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-services-found">
                <Scissors size={64} />
                <h3>No services found</h3>
                <p>Try adjusting your filters or search term</p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchTerm("");
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedServices.length > 0 && (
          <div className="selection-summary-fixed">
            <div className="summary-content">
              <div className="selected-info">
                <div className="selected-header">
                  <ShoppingBag size={20} />
                  <h3>
                    {selectedServices.length} Service
                    {selectedServices.length > 1 ? "s" : ""} Selected
                  </h3>
                </div>
                <div className="selected-items-preview">
                  {selectedServices.slice(0, 3).map((s) => (
                    <span key={s.id} className="preview-tag">
                      {s.name}
                    </span>
                  ))}
                  {selectedServices.length > 3 && (
                    <span className="preview-more">
                      +{selectedServices.length - 3} more
                    </span>
                  )}
                </div>
                <div className="summary-totals">
                  <div className="total-duration">
                    <Clock size={16} />
                    <span>Total: {calculateTotalDuration()} mins</span>
                  </div>
                  <div className="total-price">
                    <Tag size={16} />
                    <span>Total: ₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
              <button className="proceed-btn" onClick={handleProceedToBooking}>
                Proceed to Booking
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ServicesListingScreen;
