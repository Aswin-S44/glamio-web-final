import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Star, MapPin, Clock, Filter, X, ChevronDown,
  Heart, Sparkles, ArrowRight, SlidersHorizontal, Tag
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import "./ShopsScreen.css";


const SERVICE_FILTERS = ["All", "Hair", "Makeup", "Nails", "Skin", "Bridal", "Lashes", "Massage", "Waxing"];
const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "name", label: "Name A–Z" },
];

export default function ShopsScreen() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/customer/shops`);
        const data = await res.json();
        setShops(data.shops || []);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let list = [...shops];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.shop.parlourName.toLowerCase().includes(q) ||
          item.shop.address.toLowerCase().includes(q) ||
          (item.services || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedService !== "All") {
      list = list.filter((item) =>
        (item.services || []).some((s) =>
          s.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    if (minRating > 0) {
      list = list.filter((item) => (item.shop.totalRating || 0) >= minRating);
    }

    if (sortBy === "rating") {
      list.sort((a, b) => (b.shop.totalRating || 0) - (a.shop.totalRating || 0));
    } else if (sortBy === "reviews") {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.shop.parlourName.localeCompare(b.shop.parlourName));
    }

    return list;
  }, [shops, searchQuery, selectedService, sortBy, minRating]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedService("All");
    setMinRating(0);
    setSortBy("rating");
  };

  const hasActiveFilters =
    searchQuery || selectedService !== "All" || minRating > 0 || sortBy !== "rating";

  return (
    <div className="shops-page">
      <Header />

      <div className="shops-hero">
        <div className="shops-hero-content">
          <span className="shops-hero-tag">
            <Sparkles size={14} /> Discover
          </span>
          <h1>Find Your Perfect Salon</h1>
          <p>Explore top-rated beauty salons and spas near you</p>

          <div className="shops-search-bar">
            <Search size={20} className="shops-search-icon" />
            <input
              type="text"
              placeholder="Search salons, services, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="shops-clear-search" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="shops-body">
        <div className="shops-toolbar">
          <div className="service-chips">
            {SERVICE_FILTERS.map((s) => (
              <button
                key={s}
                className={`service-chip ${selectedService === s ? "active" : ""}`}
                onClick={() => setSelectedService(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="toolbar-actions">
            <button
              className={`filter-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && <span className="filter-dot" />}
            </button>

            <div className="sort-wrapper">
              <button className="sort-btn" onClick={() => setSortOpen(!sortOpen)}>
                <Tag size={16} />
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown size={14} className={sortOpen ? "rotate" : ""} />
              </button>
              {sortOpen && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={sortBy === opt.value ? "active" : ""}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Minimum Rating</label>
              <div className="rating-buttons">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    className={minRating === r ? "active" : ""}
                    onClick={() => setMinRating(r)}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                    {r > 0 && <Star size={12} fill="currentColor" />}
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button className="clear-all-btn" onClick={clearFilters}>
                <X size={14} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        <div className="shops-results-info">
          <span>
            {loading ? "Loading..." : `${filtered.length} salon${filtered.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {loading ? (
          <div className="shops-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shop-card-skeleton">
                <div className="skel-img" />
                <div className="skel-body">
                  <div className="skel-line" />
                  <div className="skel-line short" />
                  <div className="skel-line tiny" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="shops-empty">
            <Sparkles size={48} />
            <h3>No salons found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button className="btn" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className="shops-grid">
            {filtered.map((item) => (
              <ShopCard
                key={item.shop.id}
                item={item}
                wishlisted={wishlist.includes(item.shop.id)}
                onWishlist={(e) => toggleWishlist(e, item.shop.id)}
                onClick={() => navigate(`/parlour/${item.shop.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function ShopCard({ item, wishlisted, onWishlist, onClick }) {
  const { shop, user, services, reviewCount } = item;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={13}
        fill={i < Math.floor(rating) ? "#FFD700" : "none"}
        color={i < Math.floor(rating) ? "#FFD700" : "#CBD5E1"}
      />
    ));
  };

  return (
    <div className="shop-card" onClick={onClick}>
      <div className="shop-card-img-wrap">
        <img
          src={shop?.shopImage || user?.profileImage || DEFAULT_NO_IMAGE}
          alt={shop.parlourName}
          className="shop-card-img"
          onError={(e) => { e.target.src = DEFAULT_NO_IMAGE; }}
        />
        <button className={`shop-wish-btn ${wishlisted ? "active" : ""}`} onClick={onWishlist}>
          <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        {shop.category && (
          <span className="shop-category-badge">{shop.category}</span>
        )}
      </div>

      <div className="shop-card-body">
        <div className="shop-card-top">
          <h3 className="shop-card-name">{shop.parlourName}</h3>
          <div className="shop-card-rating">
            <div className="stars-row">{renderStars(shop.totalRating || 4.5)}</div>
            <span className="rating-num">{(shop.totalRating || 4.5).toFixed(1)}</span>
            {reviewCount && <span className="review-count">({reviewCount})</span>}
          </div>
        </div>

        <div className="shop-card-address">
          <MapPin size={13} />
          <span>{shop.address}</span>
        </div>

        {services && services.length > 0 && (
          <div className="shop-card-services">
            {services.slice(0, 3).map((s) => (
              <span key={s} className="service-tag">{s}</span>
            ))}
            {services.length > 3 && (
              <span className="service-tag more">+{services.length - 3}</span>
            )}
          </div>
        )}

        <div className="shop-card-footer">
          <div className="shop-open-time">
            <Clock size={13} />
            <span>Open until {shop.closeTime?.substring(0, 5) || "9:00 PM"}</span>
          </div>
          <button className="shop-book-btn" onClick={(e) => { e.stopPropagation(); }}>
            Book Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
