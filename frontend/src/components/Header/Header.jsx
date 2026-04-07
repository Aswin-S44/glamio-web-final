import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  Settings,
  HelpCircle,
  Calendar,
} from "lucide-react";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Booking Confirmed",
      desc: "Your appointment at Glow Salon is confirmed for tomorrow at 3 PM",
      time: "2m ago",
      icon: "calendar",
      read: false,
    },
    {
      id: 2,
      title: "Flash Sale Alert!",
      desc: "50% off on all hair services at Style Studio - Today only",
      time: "1h ago",
      icon: "tag",
      read: false,
    },
    {
      id: 3,
      title: "New in Your Area",
      desc: "Luxury Spa just opened near you - 20% off for first visit",
      time: "3h ago",
      icon: "sparkles",
      read: true,
    },
    {
      id: 4,
      title: "Review Reminder",
      desc: "How was your experience at Glam Nails? Share your feedback",
      time: "1d ago",
      icon: "star",
      read: true,
    },
    {
      id: 5,
      title: "Special Offer",
      desc: "Birthday month special - Double rewards on all services",
      time: "2d ago",
      icon: "heart",
      read: true,
    },
  ];

  const quickActions = [
    { icon: <Calendar size={16} />, label: "Bookings", path: "/bookings" },
    { icon: <Heart size={16} />, label: "Wishlist", path: "/wishlist" },
    { icon: <Clock size={16} />, label: "History", path: "/history" },
    { icon: <Settings size={16} />, label: "Settings", path: "/settings" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
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
              <Sparkles size={20} />
            </div>
            <span className="logo-text">
              GLAM<span>IO</span>
            </span>
          </div>

          <div className="header-center" ref={searchRef}>
            <div className={`search-pill ${searchFocused ? "focused" : ""}`}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search for salons, spas, services..."
                onFocus={() => setSearchFocused(true)}
              />
              {searchFocused && (
                <div className="search-suggestions">
                  <div className="suggestion-item">
                    <Sparkles size={16} />
                    <span>Hair Salon</span>
                  </div>
                  <div className="suggestion-item">
                    <Star size={16} />
                    <span>Spa & Massage</span>
                  </div>
                  <div className="suggestion-item">
                    <Heart size={16} />
                    <span>Nail Art</span>
                  </div>
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
                      <button className="mark-read">Mark all as read</button>
                    </div>
                    <div className="dd-scroll">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`dd-notif-item ${!n.read ? "unread" : ""}`}
                        >
                          <div className="notif-icon">{getIcon(n.icon)}</div>
                          <div className="content">
                            <div className="notif-header">
                              <h6>{n.title}</h6>
                              <span className="time">{n.time}</span>
                            </div>
                            <p>{n.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="dd-footer">
                      <button>View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="dd-wrapper">
                  <div
                    className={`profile-pill ${
                      activeDropdown === "profile" ? "active" : ""
                    }`}
                    onClick={() => toggleDropdown("profile")}
                  >
                    <div className="avatar">
                      {user?.name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                      <span className="user-badge">
                        {user?.shop ? "Business" : "Customer"}
                      </span>
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
                      <div className="dd-user-info">
                        <div className="user-details">
                          <div className="user-avatar-large">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                          <div className="user-meta">
                            <h4>{user?.name || "User"}</h4>
                            <p>{user?.email || "user@example.com"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="quick-actions">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                          >
                            {action.icon}
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="dd-divider"></div>

                      <div className="dd-links">
                        {user?.shop && (
                          <button
                            onClick={() => {
                              if (user?.shop?.isOnboarded) {
                                navigate("/shop/dashboard");
                              } else {
                                navigate("/shop/onboard");
                              }
                            }}
                          >
                            <LayoutDashboard size={16} />
                            <span>Business Dashboard</span>
                          </button>
                        )}

                        <button onClick={() => navigate("/help")}>
                          <HelpCircle size={16} />
                          <span>Help & Support</span>
                        </button>

                        <button className="logout" onClick={logout}>
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    className="btn-login"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
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
            <Sparkles size={24} />
            <span className="logo-text">
              GLAM<span>IO</span>
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="side-profile">
            <div className="side-avatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="side-user-info">
              <h4>{user?.name || "User"}</h4>
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
                <a href="/bookings">
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
              {user?.shop && (
                <button
                  className="side-btn business"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (user?.shop?.isOnboarded) {
                      navigate("/shop/dashboard");
                    } else {
                      navigate("/shop/onboard");
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
                  navigate("/login");
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
