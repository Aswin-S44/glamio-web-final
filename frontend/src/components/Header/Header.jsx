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
  UserCircle,
  LogOut,
  Settings,
  Calendar,
  Home,
  Store,
  MapPin,
  Phone,
} from "lucide-react";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const dropdownRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Booking Confirmed",
      desc: "Your appointment at Glow is set.",
      time: "2m ago",
    },
    {
      id: 2,
      title: "Flash Sale",
      desc: "50% off on all hair services today!",
      time: "1h ago",
    },
    {
      id: 3,
      title: "New Shop",
      desc: "Style Studio just joined near you.",
      time: "5h ago",
    },
    {
      id: 4,
      title: "Reminder",
      desc: "Your spa day is tomorrow.",
      time: "10h ago",
    },
    {
      id: 5,
      title: "System",
      desc: "Welcome to the new GLAMIO experience.",
      time: "1d ago",
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
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

  return (
    <>
      <header className={`glam-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          <div className="header-left" onClick={() => navigate("/")}>
            <div className="logo-icon">G</div>
            <span className="logo-text">
              GLAM<span>IO</span>
            </span>
          </div>

          <div className="header-center">
            <div className="search-pill">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search services or parlors..." />
            </div>
          </div>

          <div className="header-right">
            <nav className="desktop-nav">
              <a href="/" className={location.pathname === "/" ? "active" : ""}>
                Home
              </a>
              <a href="/shops">All Shops</a>
              <a href="/nearby">Nearby</a>
              <a href="/contact">Support</a>
            </nav>

            <div className="v-divider"></div>

            <div className="action-area" ref={dropdownRef}>
              <div className="dd-wrapper">
                <button
                  className={`icon-btn ${
                    activeDropdown === "notif" ? "active" : ""
                  }`}
                  onClick={() => toggleDropdown("notif")}
                >
                  <Bell size={20} />
                  <span className="notif-dot"></span>
                </button>

                {activeDropdown === "notif" && (
                  <div className="dd-menu notif-menu">
                    <div className="dd-header">Notifications</div>
                    <div className="dd-scroll">
                      {notifications.map((n) => (
                        <div key={n.id} className="dd-notif-item">
                          <div className="dot"></div>
                          <div className="content">
                            <h6>{n.title}</h6>
                            <p>{n.desc}</p>
                            <span>{n.time}</span>
                          </div>
                        </div>
                      ))}
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
                    <div className="avatar">{user?.name?.charAt(0)}</div>
                    <ChevronDown
                      size={14}
                      className={`chevron ${
                        activeDropdown === "profile" ? "rotate" : ""
                      }`}
                    />
                  </div>

                  {activeDropdown === "profile" && (
                    <div className="dd-menu profile-menu">
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
                            <LayoutDashboard size={16} /> Dashboard
                          </button>
                        )}

                        <button className="logout" onClick={logout}>
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn-login"
                  onClick={() => navigate("/signup")}
                >
                  Sign In
                </button>
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
          <span className="logo-text">
            GLAM<span>IO</span>
          </span>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={26} />
          </button>
        </div>
        <div className="side-body">
          <div className="side-nav">
            <a href="/">
              <Home size={20} /> Home
            </a>
            <a href="/shops">
              <Store size={20} /> All Shops
            </a>
            <a href="/nearby">
              <MapPin size={20} /> Nearby Shops
            </a>
            <a href="/contact">
              <Phone size={20} /> Contact Us
            </a>
          </div>
        </div>
        <div className="side-footer">
          {isAuthenticated ? (
            <button className="side-btn logout" onClick={logout}>
              Sign Out
            </button>
          ) : (
            <button
              className="side-btn login"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Header;
