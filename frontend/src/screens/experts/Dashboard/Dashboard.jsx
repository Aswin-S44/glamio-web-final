import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  CalendarCheck,
  Clock,
  Menu,
  Bell,
  Search,
  Scissors,
  Sparkles,
  Tag,
  UserPlus2,
  LogOut,
  User,
  Settings,
  CreditCard,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

import AddService from "../AddService/AddService";
import SlotScreen from "../../SlotScreen/SlotScreen";
import ServicesScreen from "../../ServicesScreen/ServicesScreen";
import ExpertsScreen from "../../ExpertsScreen/ExpertsScreen";
import AddExpert from "../../AddExpert/AddExpert";
import UserRequests from "../../UserRequests/UserRequests";
import AppointmentScreen from "../../AppointmentScreen/AppointmentScreen";
import OfferScreen from "../../OfferScreen/OfferScreen";
import NotificationScreen from "../../Notifications/NotificationScreen";
import { BASE_URL } from "../../../constants/urls";

function Dashboard() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/shops/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "home") fetchStats();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { id: "home", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "requests", label: "Requests", icon: <UserPlus size={20} /> },
    {
      id: "appointments",
      label: "Appointments",
      icon: <CalendarCheck size={20} />,
    },
    { id: "slots", label: "Slots", icon: <Clock size={20} /> },
    { id: "services", label: "Services", icon: <Sparkles size={20} /> },
    { id: "offers", label: "Offers", icon: <Tag size={20} /> },
    { id: "experts", label: "Experts", icon: <UserPlus2 size={20} /> },
  ];

  const renderContent = () => {
    if (activeTab !== "home") {
      switch (activeTab) {
        case "requests":
          return <UserRequests />;
        case "slots":
          return <SlotScreen />;
        case "appointments":
          return <AppointmentScreen />;
        case "offers":
          return <OfferScreen />;
        case "notifications":
          return <NotificationScreen />;
        case "services":
          return <ServicesScreen />;
        case "experts":
          return <ExpertsScreen expertsData={[]} />;
        default:
          return null;
      }
    }

    if (loading)
      return (
        <div className="glam-loader-wrap">
          <div className="glam-spinner"></div>
        </div>
      );

    return (
      <div className="glam-view-animate">
        <div className="glam-stats-row">
          <div className="glam-stat-card primary-accent">
            <div className="glam-stat-content">
              <span className="glam-label">Gross Revenue</span>
              <h2 className="glam-value">
                ₹{stats?.totalRevenue?.toLocaleString() || "24,850"}
              </h2>
              <div className="glam-trend-pill positive">
                <TrendingUp size={14} /> <span>12% growth</span>
              </div>
            </div>
            <div className="glam-stat-icon-blob">
              <CreditCard size={32} />
            </div>
          </div>

          <div className="glam-stat-card dark-accent">
            <div className="glam-stat-content">
              <span className="glam-label">Total Bookings</span>
              <h2 className="glam-value">{stats?.appointments || "156"}</h2>
              <div className="glam-trend-pill">
                <span>+8 new today</span>
              </div>
            </div>
            <div className="glam-stat-icon-blob">
              <CalendarCheck size={32} />
            </div>
          </div>

          <div className="glam-stat-card beige-accent">
            <div className="glam-stat-content">
              <span className="glam-label">Client Retention</span>
              <h2 className="glam-value">{stats?.activeClients || "89%"}</h2>
              <div className="glam-trend-pill positive">
                <span>Excellent</span>
              </div>
            </div>
            <div className="glam-stat-icon-blob">
              <User size={32} />
            </div>
          </div>
        </div>

        <div className="glam-grid-main">
          <div className="glam-card-flat chart-box-wrap">
            <div className="glam-card-header">
              <div>
                <h3>Revenue Analytics</h3>
                <p>Performance tracking for current period</p>
              </div>
              <div className="glam-header-actions">
                <button className="glam-btn-mini active">Weekly</button>
                <button className="glam-btn-mini">Monthly</button>
              </div>
            </div>
            <div className="glam-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    stats?.chartData || [
                      { day: "Mon", r: 400 },
                      { day: "Tue", r: 900 },
                      { day: "Wed", r: 600 },
                      { day: "Thu", r: 1200 },
                      { day: "Fri", r: 800 },
                      { day: "Sat", r: 1600 },
                      { day: "Sun", r: 1400 },
                    ]
                  }
                >
                  <defs>
                    <linearGradient
                      id="glamGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#D41172" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D41172" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#b0b0b0", fontSize: 12 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#b0b0b0", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="r"
                    stroke="#D41172"
                    strokeWidth={4}
                    fill="url(#glamGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glam-card-flat list-box-wrap">
            <div className="glam-card-header">
              <h3>Upcoming Bookings</h3>
              <button className="glam-link-btn">View All</button>
            </div>
            <div className="glam-list-container">
              {[1, 2, 3].map((_, i) => (
                <div className="glam-list-item" key={i}>
                  <div className="glam-user-info">
                    <div className="glam-avatar-ring">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                    </div>
                    <div>
                      <h4 className="glam-name">Sarah Jenkins</h4>
                      <p className="glam-subtext">Hair Coloring • 2:00 PM</p>
                    </div>
                  </div>
                  <div className="glam-status-dot confirmed">Confirmed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glam-root">
      {isMobileOpen && (
        <div
          className="glam-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`glam-sidebar ${isMobileOpen ? "is-open" : ""}`}>
        <div className="glam-logo-section">
          <div className="glam-logo-box">
            <Scissors size={22} />
          </div>
          <span className="glam-logo-text">GLAMIO</span>
        </div>

        <nav className="glam-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`glam-nav-btn ${
                activeTab === item.id ? "is-active" : ""
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
            >
              <div className="glam-nav-icon-box">{item.icon}</div>
              <span className="glam-nav-label">{item.label}</span>
              {activeTab === item.id && <div className="glam-nav-glow" />}
            </button>
          ))}
        </nav>

        <div className="glam-sidebar-footer">
          <button className="glam-logout-trigger" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="glam-main">
        <header className="glam-header">
          <div className="glam-header-left">
            <button
              className="glam-menu-toggle"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu />
            </button>
            <div className="glam-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search appointments or services..."
              />
            </div>
          </div>

          <div className="glam-header-right">
            <button className="glam-icon-btn">
              <Bell size={20} />
              <span className="glam-dot-notify" />
            </button>
            <div
              className="glam-profile-pill"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              ref={dropdownRef}
            >
              <div className="glam-avatar-admin">AD</div>
              <div className="glam-admin-meta">
                <span className="glam-admin-name">Shop Admin</span>
                <ChevronDown
                  size={14}
                  className={isProfileOpen ? "rotate" : ""}
                />
              </div>

              {isProfileOpen && (
                <div className="glam-dropdown">
                  <div className="glam-drop-header">Account Settings</div>
                  <button
                    className="glam-drop-item"
                    onClick={() => {
                      navigate("/shop/edit-profile");
                    }}
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button className="glam-drop-item">
                    <Settings size={16} /> Preferences
                  </button>
                  <hr />
                  <button
                    className="glam-drop-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="glam-content">
          {activeTab === "home" && (
            <div className="glam-welcome">
              <h1 className="glam-title">Glamio Dashboard</h1>
              <p className="glam-subtitle">
                Curating your shop's performance and growth today.
              </p>
            </div>
          )}
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
