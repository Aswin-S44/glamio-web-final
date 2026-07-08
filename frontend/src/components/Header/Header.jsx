import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/urls";
import { buildShopUrl } from "../../utils/shopUrl.util";
import logoImage from "../Media/Images/Orucom wide.png";
import {
  Search,
  Menu,
  X,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Home,
  Store,
  MapPin,
  Phone,
  Sparkles,
  Heart,
  Clock,
  Tag,
  Star,
  User,
  HelpCircle,
  Calendar,
  Settings,
  Info,
} from "lucide-react";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.name || user?.username || "User";
  const displayImage = user?.picture || user?.profileImage || "";
  const shopProfile = user?.shop || user?.shopProfile;
  const userBadge = shopProfile ? "Business" : "Customer";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    shops: [],
    services: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const unreadCount = notifications.filter(
    (n) => !n.notification?.isRead
  ).length;

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setNotifications(data?.data ?? []);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    await Promise.all(
      notifications
        .filter((n) => !n.notification?.isRead)
        .map((n) =>
          fetch(`${BASE_URL}/notifications/${n.notification.id}/read`, {
            method: "PATCH",
            headers: { Authorization: token },
          })
        )
    );
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        notification: { ...n.notification, isRead: true },
      }))
    );
  };

  const getNotificationTitle = (typeName) => {
    switch (typeName) {
      case "accepted":
        return "Booking Accepted";
      case "rejected":
        return "Booking Rejected";
      case "completed":
        return "Appointment Completed";
      case "requested":
        return "Appointment Request";
      case "rescheduled":
        return "Booking Rescheduled";
      default:
        return "Notification";
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
        setSearchQuery("");
        setSearchResults({ shops: [], services: [] });
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ shops: [], services: [] });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/customer/shops/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ shops: [], services: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleResultClick = (result, type) => {
    setSearchFocused(false);
    setSearchQuery("");
    setSearchResults({ shops: [], services: [] });

    if (type === "shop" && result && result.id) {
      navigate(buildShopUrl(result));
    } else if (type === "service") {
      const shopId = result.shopId || result.shop?.id;
      const serviceId = result.id;

      if (shopId && serviceId) {
        navigate(`/parlor/${shopId}/service/${serviceId}`);
      } else {
        console.error("Missing shopId or serviceId", result);
      }
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "calendar":
        return <Calendar size={14} />;
      case "tag":
        return <Tag size={14} />;
      case "sparkles":
        return <Sparkles size={14} />;
      case "star":
        return <Star size={14} />;
      case "heart":
        return <Heart size={14} />;
      default:
        return <Bell size={14} />;
    }
  };

  return (
    <>
      <header className={`glam-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          <div className="header-left" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <img src={logoImage} alt="logo" />
            </div>
          </div>

          <div className="header-center" ref={searchRef}>
            <div className={`search-pill ${searchFocused ? "focused" : ""}`}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search for salons, spas, services..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setSearchFocused(true)}
              />
              {searchFocused &&
                (searchQuery ||
                  searchResults.shops.length > 0 ||
                  searchResults.services.length > 0) && (
                  <div className="search-suggestions">
                    {isSearching && (
                      <div className="suggestion-item loading">
                        <span>Searching...</span>
                      </div>
                    )}

                    {!isSearching &&
                      searchResults.shops.length === 0 &&
                      searchResults.services.length === 0 &&
                      searchQuery && (
                        <div className="suggestion-item no-results">
                          <span>No results found for "{searchQuery}"</span>
                        </div>
                      )}

                    {searchResults.shops.length > 0 && (
                      <>
                        <div className="suggestion-category">Shops</div>
                        {searchResults.shops.map((shop) => (
                          <div
                            key={shop.id}
                            className="suggestion-item"
                            onClick={() => handleResultClick(shop, "shop")}
                          >
                            {shop.shopImage ? (
                              <img
                                src={shop.shopImage}
                                alt={shop.parlourName}
                                className="suggestion-image"
                              />
                            ) : (
                              <Store size={16} />
                            )}
                            <div className="suggestion-content">
                              <span className="suggestion-title">
                                {shop.parlourName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {searchResults.services.length > 0 && (
                      <>
                        <div className="suggestion-category">Services</div>
                        {searchResults.services.map((service) => (
                          <div
                            key={service.id}
                            className="suggestion-item"
                            onClick={() =>
                              handleResultClick(service, "service")
                            }
                          >
                            {service.imageUrl ? (
                              <img
                                src={service.imageUrl}
                                alt={service.name}
                                className="suggestion-image"
                              />
                            ) : (
                              <Sparkles size={16} />
                            )}
                            <div className="suggestion-content">
                              <span className="suggestion-title">
                                {service.name || "Service"}
                              </span>
                              <span className="suggestion-subtitle">
                                {service.shop?.parlourName || "Loading..."}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="header-right">
            <nav className="desktop-nav">
              <a href="/" className={location.pathname === "/" ? "active" : ""}>
                <Home size={16} />
                <span>Home</span>
              </a>
              <a
                href="/about-us"
                className={location.pathname === "/about-us" ? "active" : ""}
              >
                <Info size={20} /> About-Us
              </a>
              <a
                href="/shops"
                className={location.pathname === "/shops" ? "active" : ""}
              >
                <Store size={16} />
                <span>Shops</span>
              </a>
              <a
                href="/nearby"
                className={location.pathname === "/nearby" ? "active" : ""}
              >
                <MapPin size={16} />
                <span>Nearby</span>
              </a>
              <a
                href="/contact"
                className={location.pathname === "/contact" ? "active" : ""}
              >
                <Phone size={16} />
                <span>Support</span>
              </a>
            </nav>

            <div className="action-area" ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <div className="dd-wrapper">
                    <button
                      className={`icon-btn ${
                        activeDropdown === "notif" ? "active" : ""
                      }`}
                      onClick={() => toggleDropdown("notif")}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="notif-dot">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {activeDropdown === "notif" && (
                      <div className="dd-menu notif-menu">
                        <div className="dd-header">
                          <span>Notifications</span>
                          <button className="mark-read" onClick={markAllRead}>
                            Mark all as read
                          </button>
                        </div>
                        <div className="dd-scroll">
                          {notifications.length === 0 ? (
                            <div className="dd-notif-empty">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.notification?.id}
                                className={`dd-notif-item ${
                                  !n.notification?.isRead ? "unread" : ""
                                }`}
                              >
                                <div className="notif-icon">
                                  {getIcon("sparkles")}
                                </div>
                                <div className="content">
                                  <div className="notif-header">
                                    <h6>
                                      {getNotificationTitle(
                                        n.notificationType?.name
                                      )}
                                    </h6>
                                    <span className="time">
                                      {formatTime(n.notification?.createdAt)}
                                    </span>
                                  </div>
                                  <p>{n.notification?.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="dd-footer">
                          <button>View all notifications</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="dd-wrapper">
                    <div
                      className={`profile-pill ${
                        activeDropdown === "profile" ? "active" : ""
                      }`}
                      onClick={() => toggleDropdown("profile")}
                    >
                      <div className="avatar">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={displayName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          displayName.charAt(0) || <User size={16} />
                        )}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {displayName.split(" ")[0] || "User"}
                        </span>
                        <span className="user-badge">{userBadge}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`chevron ${
                          activeDropdown === "profile" ? "rotate" : ""
                        }`}
                      />
                    </div>

                    {activeDropdown === "profile" && (
                      <div className="dd-menu profile-menu">
                        <div className="pm-header">
                          <div className="pm-avatar">
                            {displayImage ? (
                              <img src={displayImage} alt={displayName} />
                            ) : (
                              displayName.charAt(0) || "U"
                            )}
                          </div>
                          <div className="pm-info">
                            <h4>{displayName}</h4>
                            <p>{user?.email || ""}</p>
                            <span className="pm-role">{userBadge}</span>
                          </div>
                        </div>

                        <div className="pm-links">
                          <button
                            onClick={() => {
                              navigate("/my-bookings");
                              setActiveDropdown(null);
                            }}
                          >
                            <Calendar size={15} /> My Bookings
                          </button>

                          {shopProfile && (
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                const shop = shopProfile;
                                if (shop.isOnboarded)
                                  navigate("/shop/dashboard");
                                else if (shop.isProfileCompleted)
                                  navigate("/shop/onboard");
                                else navigate("/shop/edit-profile");
                              }}
                            >
                              <LayoutDashboard size={15} /> Business Dashboard
                            </button>
                          )}

                          <button
                            onClick={() => {
                              navigate("/help");
                              setActiveDropdown(null);
                            }}
                          >
                            <HelpCircle size={15} /> Help & Support
                          </button>
                        </div>

                        <div className="pm-divider" />

                        <div className="pm-footer">
                          <button className="pm-logout" onClick={logout}>
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <button
                    className="btn-signup"
                    onClick={() => navigate("/signup")}
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>

            <button
              className="mobile-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`side-mask ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`side-panel ${isSidebarOpen ? "open" : ""}`}>
        <div className="side-header">
          <div className="side-logo">
            <img src={logoImage} alt="logo" style={{ width: "60%" }} />
          </div>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="side-profile">
            <div className="side-avatar">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                displayName.charAt(0) || "U"
              )}
            </div>
            <div className="side-user-info">
              <h4>{displayName}</h4>
              <p>{user?.email || "user@example.com"}</p>
            </div>
          </div>
        )}

        <div className="side-body">
          <div className="side-nav">
            <a href="/" className={location.pathname === "/" ? "active" : ""}>
              <Home size={20} /> Home
            </a>

            <a
              href="/about-us"
              className={location.pathname === "/about-us" ? "active" : ""}
            >
              <Info size={20} /> About-Us
            </a>

            <a
              href="/shops"
              className={location.pathname === "/shops" ? "active" : ""}
            >
              <Store size={20} /> All Shops
            </a>
            <a
              href="/nearby"
              className={location.pathname === "/nearby" ? "active" : ""}
            >
              <MapPin size={20} /> Nearby
            </a>
            <a
              href="/contact"
              className={location.pathname === "/contact" ? "active" : ""}
            >
              <Phone size={20} /> Contact
            </a>
          </div>

          {isAuthenticated && (
            <>
              <div className="side-divider"></div>
              <div className="side-nav secondary">
                <a href="/my-bookings">
                  <Calendar size={20} /> My Bookings
                </a>
                <a href="/wishlist">
                  <Heart size={20} /> Wishlist
                </a>
                <a href="/history">
                  <Clock size={20} /> History
                </a>
                <a href="/settings">
                  <Settings size={20} /> Settings
                </a>
              </div>
            </>
          )}
        </div>

        <div className="side-footer">
          {isAuthenticated ? (
            <>
              {shopProfile && (
                <button
                  className="side-btn business"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    const shop = shopProfile;

                    if (shop?.isOnboarded) {
                      navigate("/shop/dashboard");
                    } else if (shop?.isProfileCompleted) {
                      navigate("/shop/onboard");
                    } else {
                      navigate("/shop/edit-profile");
                    }
                  }}
                >
                  <LayoutDashboard size={18} />
                  Business Dashboard
                </button>
              )}
              <button className="side-btn logout" onClick={logout}>
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="side-auth">
              <button
                className="side-btn login"
                onClick={() => {
                  setIsSidebarOpen(false);
                  navigate("/signin");
                }}
              >
                Sign In
              </button>
              <button
                className="side-btn signup"
                onClick={() => {
                  setIsSidebarOpen(false);
                  navigate("/signup");
                }}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Header;
