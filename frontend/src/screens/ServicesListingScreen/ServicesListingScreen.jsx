import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, Tag, CheckCircle2, ShoppingBag, Sparkles, Scissors,
  Star, ArrowRight, Filter, Search, X, SlidersHorizontal,
} from "lucide-react";
import "./ServicesListingScreen.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "duration", label: "Duration: Short First" },
];

const ServicesListingScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [parlour, setParlour] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("popular");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParlourAndServices = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${BASE_URL}/customer/shop/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const svcList = Array.isArray(data.services)
          ? data.services.map((service) => ({
              ...service,
              category:
                typeof service.category === "object"
                  ? service.category?.name || ""
                  : service.category || "",
            }))
          : [];

        const offersList = Array.isArray(data.offers)
          ? Array.from(
              new Map(data.offers.map((offer) => [offer.id, offer])).values()
            )
          : [];

        setParlour(data.shop || null);
        setServices(svcList);
        setOffers(offersList);
        if (svcList.length > 0) {
          const prices = svcList.map((s) => s.rate);
          setPriceRange({ min: Math.min(...prices), max: Math.max(...prices) });
        } else {
          setPriceRange({ min: 0, max: 10000 });
        }
      } catch {
        setParlour(null);
        setServices([]);
        setOffers([]);
        setError("We couldn't load services for this salon right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchParlourAndServices();
  }, [id]);

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      return exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
    });
  };

  const categories = ["all", ...new Set(services.map((s) => s.category).filter(Boolean))];

  const getFilteredServices = () => {
    let list = [...services];
    if (activeCategory !== "all") list = list.filter((s) => s.category === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    }
    list = list.filter((s) => s.rate >= priceRange.min && s.rate <= priceRange.max);
    if (sortBy === "price_low") list.sort((a, b) => a.rate - b.rate);
    else if (sortBy === "price_high") list.sort((a, b) => b.rate - a.rate);
    else if (sortBy === "duration") list.sort((a, b) => a.duration - b.duration);
    return list;
  };

  const getServiceOffer = (serviceId) => offers.find((o) => o.serviceId === serviceId);

  const calculateTotal = () => selectedServices.reduce((s, sv) => s + sv.rate, 0);
  const calculateTotalDuration = () => selectedServices.reduce((s, sv) => s + sv.duration, 0);

  const handleProceedToBooking = () => {
    if (selectedServices.length === 0) return;
    sessionStorage.setItem("selectedServices", JSON.stringify(selectedServices));
    sessionStorage.setItem("shopId", id);
    navigate(`/parlor/${id}/slot-selection`, {
      state: { selectedServices, shopId: id, isMultipleServices: true },
    });
  };

  const filteredServices = getFilteredServices();

  if (loading) {
    return (
      <>
        <Header />
        <div className="sl-loader">
          <div className="sl-loader-icon"><Sparkles size={36} className="sl-spin" /></div>
          <p>Loading services...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="sl-page">
        {/* Hero */}
        <div className="sl-hero">
          <div className="sl-hero-inner">
            <div className="sl-hero-tag">
              <Sparkles size={13} /> Services
            </div>
            <h1>Choose Your Services</h1>
            <p>Select one or more services and book in one go</p>
            {parlour && (
              <div className="sl-shop-pill">
                <Star size={14} fill="#FFD700" color="#FFD700" />
                <span>{parlour.parlourName}</span>
                <span className="sl-rating">{parlour.totalRating || "4.8"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sl-main">
          {error && (
            <div className="sl-empty">
              <Scissors size={56} />
              <h3>Unable to load services</h3>
              <p>{error}</p>
              <button className="btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="sl-toolbar">
            <div className="sl-toolbar-left">
              <h2 className="sl-count">
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
                {selectedServices.length > 0 && (
                  <span className="sl-selected-badge">{selectedServices.length} selected</span>
                )}
              </h2>
            </div>
            <div className="sl-toolbar-right">
              <div className="sl-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}><X size={14} /></button>
                )}
              </div>
              <button
                className={`sl-filter-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>

          {/* Category chips */}
          {!error && <div className="sl-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`sl-cat-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>}

          {/* Filter panel */}
          {!error && showFilters && (
            <div className="sl-filter-panel">
              <div className="sl-filter-group">
                <label>Price Range</label>
                <div className="sl-price-inputs">
                  <div className="sl-price-field">
                    <span>₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: +e.target.value })}
                    />
                  </div>
                  <span className="sl-price-sep">—</span>
                  <div className="sl-price-field">
                    <span>₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: +e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="sl-filter-group">
                <label>Sort By</label>
                <div className="sl-sort-chips">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`sl-sort-chip ${sortBy === opt.value ? "active" : ""}`}
                      onClick={() => setSortBy(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services Grid */}
          {!error && filteredServices.length > 0 ? (
            <div className="sl-grid">
              {filteredServices.map((service) => {
                const isSelected = !!selectedServices.find((s) => s.id === service.id);
                const offer = getServiceOffer(service.id);
                return (
                  <div
                    key={service.id}
                    className={`sl-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <div className="sl-card-img-wrap">
                      <img
                        src={service.imageUrl || DEFAULT_NO_IMAGE}
                        alt={service.name}
                        onError={(e) => { e.target.src = DEFAULT_NO_IMAGE; }}
                      />
                      {isSelected && (
                        <div className="sl-selected-overlay">
                          <CheckCircle2 size={36} />
                          <span>Selected</span>
                        </div>
                      )}
                      {offer && !isSelected && (
                        <span className="sl-offer-badge">
                          Save ₹{service.rate - offer.offerPrice}
                        </span>
                      )}
                      {service.category && (
                        <span className="sl-cat-badge">{service.category}</span>
                      )}
                    </div>

                    <div className="sl-card-body">
                      <div className="sl-card-header">
                        <h3>{service.name}</h3>
                        <div className="sl-duration-chip">
                          <Clock size={12} />
                          <span>{service.duration} min</span>
                        </div>
                      </div>

                      {service.description && (
                        <p className="sl-card-desc">
                          {service.description.substring(0, 85)}
                          {service.description.length > 85 ? "..." : ""}
                        </p>
                      )}

                      <div className="sl-card-foot">
                        <div className="sl-price-display">
                          {offer ? (
                            <>
                              <span className="sl-offer-price">₹{offer.offerPrice}</span>
                              <span className="sl-original-price">₹{service.rate}</span>
                            </>
                          ) : (
                            <span className="sl-regular-price">₹{service.rate}</span>
                          )}
                        </div>

                        <button
                          className={`sl-select-btn ${isSelected ? "selected" : ""}`}
                          onClick={(e) => { e.stopPropagation(); handleServiceToggle(service); }}
                        >
                          {isSelected ? (
                            <><CheckCircle2 size={14} /> Selected</>
                          ) : (
                            <><ShoppingBag size={14} /> Select</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !error ? (
            <div className="sl-empty">
              <Scissors size={56} />
              <h3>No services found</h3>
              <p>
                {services.length === 0
                  ? "This salon has not published any services yet."
                  : "Try adjusting your filters or search term"}
              </p>
              <button
                className="btn"
                onClick={() => { setActiveCategory("all"); setSearchTerm(""); }}
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </div>

        {/* Sticky Bottom Bar */}
        {selectedServices.length > 0 && (
          <div className="sl-sticky-bar">
            <div className="sl-sticky-inner">
              <div className="sl-sticky-info">
                <div className="sl-sticky-title">
                  <ShoppingBag size={18} />
                  <span>{selectedServices.length} Service{selectedServices.length > 1 ? "s" : ""} Selected</span>
                </div>
                <div className="sl-sticky-chips">
                  {selectedServices.slice(0, 3).map((s) => (
                    <span key={s.id} className="sl-sticky-chip">{s.name}</span>
                  ))}
                  {selectedServices.length > 3 && (
                    <span className="sl-sticky-chip more">+{selectedServices.length - 3} more</span>
                  )}
                </div>
                <div className="sl-sticky-totals">
                  <span><Clock size={14} /> {calculateTotalDuration()} mins</span>
                  <span><Tag size={14} /> ₹{calculateTotal()}</span>
                </div>
              </div>
              <button className="sl-proceed-btn" onClick={handleProceedToBooking}>
                Proceed to Booking <ArrowRight size={18} />
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
