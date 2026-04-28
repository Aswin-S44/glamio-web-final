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

const DUMMY_DATA = {
  shop: {
    id: "s1",
    parlourName: "Glamour Studio",
    address: "12, MG Road, Bangalore",
    totalRating: 4.8,
    profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
  },
  services: [
    { id: 1, shopId: "s1", name: "Hair Smoothing", duration: 90, rate: 1200, category: "Hair", description: "Professional keratin treatment for silky, frizz-free hair lasting up to 6 months.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400" },
    { id: 2, shopId: "s1", name: "Bridal Makeup", duration: 120, rate: 3500, category: "Makeup", description: "Stunning bridal look with premium products including airbrush foundation and false lashes.", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400" },
    { id: 3, shopId: "s1", name: "Full Body Waxing", duration: 60, rate: 800, category: "Waxing", description: "Smooth, long-lasting hair removal using premium hot wax suitable for all skin types.", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400" },
    { id: 4, shopId: "s1", name: "Facial (Gold)", duration: 75, rate: 1500, category: "Skin", description: "Rejuvenating gold facial with deep cleansing, massage and glow-boosting mask.", imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400" },
    { id: 5, shopId: "s1", name: "Nail Art & Extension", duration: 45, rate: 600, category: "Nails", description: "Custom nail art, gel polish and acrylic extensions by our skilled nail artists.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400" },
    { id: 6, shopId: "s1", name: "Eyelash Extension", duration: 60, rate: 900, category: "Lashes", description: "Volume and classic lash extensions applied with precision for a natural-to-dramatic look.", imageUrl: "https://images.unsplash.com/photo-1583241800706-a895a67f2428?w=400" },
    { id: 7, shopId: "s1", name: "Hair Colouring", duration: 90, rate: 1800, category: "Hair", description: "Global colour, highlights, ombre and balayage techniques using professional salon-grade colour.", imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400" },
    { id: 8, shopId: "s1", name: "Eyebrow Threading", duration: 15, rate: 80, category: "Brows", description: "Precise eyebrow shaping and threading for perfectly defined brows every time.", imageUrl: "https://images.unsplash.com/photo-1583241800706-a895a67f2428?w=400" },
  ],
  offers: [
    { serviceId: 1, offerPrice: 999 },
    { serviceId: 4, offerPrice: 1199 },
  ],
};

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
  const [usingDummy, setUsingDummy] = useState(false);

  useEffect(() => {
    const fetchParlourAndServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/customer/shop/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const svcList = data.services || [];
        if (svcList.length > 0) {
          setParlour(data.shop);
          setServices(svcList);
          setOffers(data.offers || []);
          const prices = svcList.map((s) => s.rate);
          setPriceRange({ min: Math.min(...prices), max: Math.max(...prices) });
        } else {
          setParlour(DUMMY_DATA.shop);
          setServices(DUMMY_DATA.services);
          setOffers(DUMMY_DATA.offers);
          setUsingDummy(true);
        }
      } catch {
        setParlour(DUMMY_DATA.shop);
        setServices(DUMMY_DATA.services);
        setOffers(DUMMY_DATA.offers);
        setUsingDummy(true);
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
          <div className="sl-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`sl-cat-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Filter panel */}
          {showFilters && (
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
          {filteredServices.length > 0 ? (
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
          ) : (
            <div className="sl-empty">
              <Scissors size={56} />
              <h3>No services found</h3>
              <p>Try adjusting your filters or search term</p>
              <button
                className="btn"
                onClick={() => { setActiveCategory("all"); setSearchTerm(""); }}
              >
                Clear Filters
              </button>
            </div>
          )}
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
