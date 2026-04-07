import React, { useState, useEffect } from "react";
import "./Banner.css";
import {
  Search,
  MapPin,
  Star,
  Heart,
  Clock,
  Award,
  Users,
  Shield,
  ChevronRight,
  Scissors,
  SprayCan as Spray,
  Droplets,
  Gem,
  Brush,
  Eye,
  Coffee,
  Wifi,
  Car,
  CreditCard,
  Filter,
  TrendingUp,
  X,
  SlidersHorizontal,
  DollarSign,
  ThumbsUp,
  Clock as ClockIcon,
} from "lucide-react";
import ParlorListings from "../ParlorListings/ParlorListings";
import { BASE_URL } from "../../constants/urls";

function Banner() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("New York");
  const [activeTab, setActiveTab] = useState("nearby");
  const [trendingParlors, setTrendingParlors] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    priceRange: [],
    rating: null,
    openNow: false,
    amenities: [],
    sortBy: "relevance",
  });

  const locations = ["New York", "Los Angeles", "Chicago", "Miami", "Houston"];

  const popularSearches = [
    "Hair Salon",
    "Nail Studio",
    "Spa",
    "Makeup Artist",
    "Barber Shop",
    "Waxing Center",
  ];

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/shops`);
      const data = await response.json();
      setShops(data.shops || []);
      setTrendingParlors(
        (data.shops || []).slice(0, 3).map((shop) => ({
          id: shop.shop.id,
          name: shop.shop.parlourName,
          rating: shop.shop.totalRating || 4.5,
          location: shop.shop.address,
          image:
            shop.user.profileImage ||
            "https://images.unsplash.com/photo-1522338242992-e1a54906a5da?w=400&auto=format",
          price: "$$",
          tags: ["Hair", "Nails", "Makeup"],
          open: true,
          waitTime: "15 min",
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shops:", error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [],
      rating: null,
      openNow: false,
      amenities: [],
      sortBy: "relevance",
    });
  };

  const FilterModal = () => (
    <div className={`filter-modal ${showFilterModal ? "active" : ""}`}>
      <div
        className="filter-modal-overlay"
        onClick={() => setShowFilterModal(false)}
      ></div>
      <div className="filter-modal-content">
        <div className="filter-modal-header">
          <h3>Filter & Sort</h3>
          <button
            className="close-modal"
            onClick={() => setShowFilterModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="filter-modal-body">
          <div className="filter-section">
            <h4>Sort By</h4>
            <div className="sort-options">
              {[
                "relevance",
                "rating",
                "popularity",
                "price_low",
                "price_high",
              ].map((option) => (
                <button
                  key={option}
                  className={`sort-option ${
                    filters.sortBy === option ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("sortBy", option)}
                >
                  {option === "relevance" && "Relevance"}
                  {option === "rating" && "Top Rated"}
                  {option === "popularity" && "Most Popular"}
                  {option === "price_low" && "Price: Low to High"}
                  {option === "price_high" && "Price: High to Low"}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-options">
              {["$", "$$", "$$$", "$$$$"].map((price) => (
                <button
                  key={price}
                  className={`price-option ${
                    filters.priceRange.includes(price) ? "active" : ""
                  }`}
                  onClick={() => {
                    const newRange = filters.priceRange.includes(price)
                      ? filters.priceRange.filter((p) => p !== price)
                      : [...filters.priceRange, price];
                    handleFilterChange("priceRange", newRange);
                  }}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Rating</h4>
            <div className="rating-options">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <button
                  key={rating}
                  className={`rating-option ${
                    filters.rating === rating ? "active" : ""
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      "rating",
                      filters.rating === rating ? null : rating
                    )
                  }
                >
                  <Star size={16} fill="#FFD700" color="#FFD700" />
                  <span>{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Amenities</h4>
            <div className="amenities-options">
              {[
                { icon: Wifi, label: "Free WiFi" },
                { icon: Coffee, label: "Coffee" },
                { icon: Car, label: "Parking" },
                { icon: CreditCard, label: "Card Payment" },
              ].map((amenity) => (
                <button
                  key={amenity.label}
                  className={`amenity-option ${
                    filters.amenities.includes(amenity.label) ? "active" : ""
                  }`}
                  onClick={() => {
                    const newAmenities = filters.amenities.includes(
                      amenity.label
                    )
                      ? filters.amenities.filter((a) => a !== amenity.label)
                      : [...filters.amenities, amenity.label];
                    handleFilterChange("amenities", newAmenities);
                  }}
                >
                  <amenity.icon size={16} />
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="open-now-toggle">
              <input
                type="checkbox"
                checked={filters.openNow}
                onChange={(e) =>
                  handleFilterChange("openNow", e.target.checked)
                }
              />
              <span>Open Now</span>
            </label>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
          <button className="apply-filters-btn" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="marketplace-banner">
      <div className="marketplace-bg">
        <div className="pattern-grid"></div>
        <div className="gradient-spot spot-1"></div>
        <div className="gradient-spot spot-2"></div>
      </div>

      <div className="marketplace-container">
        <div className="hero-section">
          <div className="hero-badge">
            <span>Find Your Perfect Salon • {shops.length}+ Parlors</span>
          </div>

          <h1 className="hero-title">
            Discover & Book
            <span className="title-highlight"> Top-Rated Beauty Parlors </span>
            Near You
          </h1>

          <p className="hero-subtitle">
            Compare prices, read reviews, and book appointments instantly at the
            best salons in your area
          </p>

          <div className="hero-search">
            <div className="search-wrapper">
              <div className="search-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search for services, parlors, or treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-location">
                <MapPin size={18} />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button className="search-btn">Search</button>
            </div>

            <div className="popular-searches">
              <span>Popular:</span>
              {popularSearches.map((term, index) => (
                <button key={index} className="search-tag">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>50K+</h3>
              <p>Happy Customers</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>{shops.length}+</h3>
              <p>Verified Parlors</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>4.8</h3>
              <p>Average Rating</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>24/7</h3>
              <p>Booking Available</p>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="content-left">
            <div className="quick-filters">
              <h3>Quick Filters</h3>
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${
                    activeTab === "nearby" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("nearby")}
                >
                  <MapPin size={16} />
                  Nearby
                </button>
                <button
                  className={`filter-tab ${
                    activeTab === "trending" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("trending")}
                >
                  <TrendingUp size={16} />
                  Trending
                </button>
                <button
                  className={`filter-tab ${
                    activeTab === "topRated" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("topRated")}
                >
                  <Star size={16} />
                  Top Rated
                </button>
              </div>
            </div>

            <div className="trending-section">
              <div className="section-header">
                <h3>Trending Now 🔥</h3>
                <button className="view-all">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="trending-list">
                {trendingParlors.map((parlor, index) => (
                  <div key={parlor.id} className="trending-item">
                    <div className="trending-rank">#{index + 1}</div>
                    <div className="trending-info">
                      <h4>{parlor.name}</h4>
                      <div className="trending-meta">
                        <span>{parlor.location}</span>
                        <span className="trending-rating">
                          <Star size={12} fill="#FFD700" color="#FFD700" />
                          {parlor.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="amenities-filter">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                <div className="amenity-item">
                  <Wifi size={16} />
                  <span>Free WiFi</span>
                </div>
                <div className="amenity-item">
                  <Coffee size={16} />
                  <span>Coffee</span>
                </div>
                <div className="amenity-item">
                  <Car size={16} />
                  <span>Parking</span>
                </div>
                <div className="amenity-item">
                  <CreditCard size={16} />
                  <span>Card Payment</span>
                </div>
              </div>
            </div>
          </div>

          <ParlorListings
            featuredParlors={shops.map((shop) => ({
              id: shop.shop.id,
              name: shop.shop.parlourName,
              rating: shop.shop.totalRating || 4.5,
              reviews: Math.floor(Math.random() * 1000) + 100,
              image:
                shop.user.profileImage ||
                "https://images.unsplash.com/photo-1522338242992-e1a54906a5da?w=400&auto=format",
              location: shop.shop.address,
              price: "$$",
              tags: ["Hair", "Nails", "Makeup"],
              open: true,
              waitTime: "15 min",
              about: shop.shop.about,
            }))}
            loading={loading}
            onFilterClick={() => setShowFilterModal(true)}
          />
        </div>

        <div className="category-strip">
          <div className="category-item">
            <Scissors size={24} />
            <span>Hair</span>
          </div>
          <div className="category-item">
            <Spray size={24} />
            <span>Makeup</span>
          </div>
          <div className="category-item">
            <Droplets size={24} />
            <span>Skin</span>
          </div>
          <div className="category-item">
            <Gem size={24} />
            <span>Nails</span>
          </div>
          <div className="category-item">
            <Brush size={24} />
            <span>Bridal</span>
          </div>
          <div className="category-item">
            <Eye size={24} />
            <span>Lashes</span>
          </div>
        </div>

        <div className="trust-badge">
          <Shield size={20} />
          <span>
            All parlors are verified • 100% secure booking • Free cancellation
          </span>
        </div>
      </div>

      <FilterModal />
    </section>
  );
}

export default Banner;
