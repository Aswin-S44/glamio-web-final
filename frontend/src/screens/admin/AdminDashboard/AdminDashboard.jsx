import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Clock, CheckCircle, XCircle, LogOut, RefreshCw,
  Search, MapPin, Phone, Mail, Eye, AlertCircle, Users,
  ChevronRight, Image as ImageIcon, X, Check,
} from "lucide-react";
import "./AdminDashboard.css";
import { BASE_URL } from "../../../constants/urls";
import logoImg from "../../../components/Media/Images/Logo.png";

const ADMIN_KEY = btoa("admin@glamio.com:Admin@123");
const AUTH_HEADER = `admin ${ADMIN_KEY}`;

const TABS = [
  { key: "pending",  label: "Pending",  icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "all",      label: "All Shops", icon: Store },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("pending");
  const [shops, setShops]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [actioning, setActioning] = useState(null);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!localStorage.getItem("isAdminLoggedIn")) navigate("/admin/login");
  }, [navigate]);

  /* ── Fetch all shops ── */
  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/shops`, {
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        const data = await res.json();
        setShops(Array.isArray(data.shops) ? data.shops : []);
      } else {
        setShops([]);
      }
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  /* ── Filtered list ── */
  const filtered = shops.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.parlourName || "").toLowerCase().includes(q) ||
      (s.ownerEmail  || "").toLowerCase().includes(q) ||
      (s.address     || "").toLowerCase().includes(q) ||
      (s.ownerName   || "").toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (tab === "pending")  return s.isProfileCompleted && !s.isOnboarded;
    if (tab === "approved") return s.isOnboarded;
    return true;
  });

  const pendingCount  = shops.filter(s => s.isProfileCompleted && !s.isOnboarded).length;
  const approvedCount = shops.filter(s => s.isOnboarded).length;

  /* ── Approve ── */
  const handleApprove = async (shopId) => {
    setActioning(shopId + "_approve");
    try {
      const res = await fetch(`${BASE_URL}/admin/shops/${shopId}/approve`, {
        method: "PATCH",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setShops(prev => prev.map(s =>
          s.id === shopId ? { ...s, isOnboarded: true } : s
        ));
        if (selected?.id === shopId) setSelected(s => ({ ...s, isOnboarded: true }));
      }
    } catch { /* silent */ }
    setActioning(null);
  };

  /* ── Reject ── */
  const handleReject = async (shopId) => {
    setActioning(shopId + "_reject");
    try {
      const res = await fetch(`${BASE_URL}/admin/shops/${shopId}/reject`, {
        method: "PATCH",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setShops(prev => prev.map(s =>
          s.id === shopId ? { ...s, isOnboarded: false, isProfileCompleted: false } : s
        ));
        if (selected?.id === shopId) setSelected(null);
      }
    } catch { /* silent */ }
    setActioning(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login");
  };

  return (
    <div className="ad-root">
      {/* ── Sidebar ── */}
      <aside className="ad-sidebar">
        <div className="ad-logo-wrap" onClick={() => navigate("/")}>
          <img src={logoImg} alt="Orucom" className="ad-logo-img" />
        </div>

        <div className="ad-admin-card">
          <div className="ad-admin-avatar">A</div>
          <div>
            <p className="ad-admin-name">Orucom Admin</p>
            <p className="ad-admin-email">admin@glamio.com</p>
          </div>
        </div>

        <nav className="ad-nav">
          <p className="ad-nav-section">Shop Management</p>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`ad-nav-btn ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {key === "pending" && pendingCount > 0 && (
                <span className="ad-count-pill">{pendingCount}</span>
              )}
              {key === "approved" && (
                <span className="ad-count-pill green">{approvedCount}</span>
              )}
            </button>
          ))}
        </nav>

        <button className="ad-logout-btn" onClick={handleLogout} >
          <LogOut size={15} /> Sign Out
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="ad-main">
        {/* Top bar */}
        <div className="ad-topbar">
          <div>
            <h1 className="ad-page-title">
              {tab === "pending"  ? "Pending Approvals" :
               tab === "approved" ? "Approved Shops"    : "All Shops"}
            </h1>
            <p className="ad-page-sub">
              {tab === "pending"  ? `${pendingCount} shop${pendingCount !== 1 ? "s" : ""} waiting for review` :
               tab === "approved" ? `${approvedCount} shop${approvedCount !== 1 ? "s" : ""} live on platform` :
               `${shops.length} total registered shop${shops.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="ad-refresh-btn" onClick={fetchShops} disabled={loading}>
            <RefreshCw size={14} className={loading ? "ad-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="ad-stats-row">
          <StatCard color="#f59e0b" bg="#fffbeb" icon={Clock}        label="Pending"       value={pendingCount} />
          <StatCard color="#10b981" bg="#ecfdf5" icon={CheckCircle}  label="Approved"      value={approvedCount} />
          <StatCard color="#6366f1" bg="#eef2ff" icon={Store}        label="Total Shops"   value={shops.length} />
          <StatCard color="#c2185b" bg="#fff0f6" icon={Users}        label="Incomplete"    value={shops.filter(s => !s.isProfileCompleted).length} />
        </div>

        {/* Search */}
        <div className="ad-search-bar">
          <Search size={15} className="ad-search-ico" />
          <input
            placeholder="Search by name, email, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="ad-search-clear">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="ad-state-box">
            <RefreshCw size={28} className="ad-spin" style={{ color: "#c2185b" }} />
            <p>Loading shops…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ad-state-box">
            <AlertCircle size={36} strokeWidth={1.4} style={{ color: "#ddd" }} />
            <p>{search ? "No shops match your search." : tab === "pending" ? "No pending approvals." : "No shops found."}</p>
          </div>
        ) : (
          <div className="ad-grid">
            {filtered.map(shop => (
              <ShopCard
                key={shop.id}
                shop={shop}
                actioning={actioning}
                onView={() => setSelected(shop)}
                onApprove={() => handleApprove(shop.id)}
                onReject={() => handleReject(shop.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Detail drawer ── */}
      {selected && (
        <ShopDrawer
          shop={selected}
          actioning={actioning}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected.id)}
          onReject={() => handleReject(selected.id)}
        />
      )}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="ad-stat">
      <div className="ad-stat-icon" style={{ background: bg, color }}>
        <Icon size={18} />
      </div>
      <div>
        <p className="ad-stat-value">{value}</p>
        <p className="ad-stat-label">{label}</p>
      </div>
    </div>
  );
}

/* ── Shop card ── */
function ShopCard({ shop, actioning, onView, onApprove, onReject }) {
  const isPending  = shop.isProfileCompleted && !shop.isOnboarded;
  const isApproved = shop.isOnboarded;
  const statusLabel = isApproved ? "Approved" : isPending ? "Pending" : "Incomplete";
  const statusClass = isApproved ? "approved" : isPending ? "pending" : "incomplete";

  return (
    <div className="ad-shop-card">
      <div className="ad-shop-cover">
        {shop.shopImage
          ? <img src={shop.shopImage} alt={shop.parlourName} />
          : <div className="ad-shop-cover-ph"><ImageIcon size={24} /></div>}
        <span className={`ad-pill ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="ad-shop-body">
        <h3 className="ad-shop-name">{shop.parlourName || "Unnamed Shop"}</h3>
        {shop.ownerName && (
          <p className="ad-shop-meta"><Users size={11} /> {shop.ownerName}</p>
        )}
        {shop.ownerEmail && (
          <p className="ad-shop-meta"><Mail size={11} /> {shop.ownerEmail}</p>
        )}
        {shop.address && (
          <p className="ad-shop-meta"><MapPin size={11} /> {shop.address}</p>
        )}

        <div className="ad-shop-actions">
          <button className="ad-btn-view" onClick={onView}>
            <Eye size={13} /> View Details <ChevronRight size={12} />
          </button>

          {isPending && (
            <div className="ad-action-row">
              <button
                className="ad-btn-approve"
                onClick={onApprove}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_approve"
                  ? <RefreshCw size={12} className="ad-spin" />
                  : <Check size={13} />}
                Approve
              </button>
              <button
                className="ad-btn-reject"
                onClick={onReject}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_reject"
                  ? <RefreshCw size={12} className="ad-spin" />
                  : <X size={13} />}
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shop drawer ── */
function ShopDrawer({ shop, actioning, onClose, onApprove, onReject }) {
  const isPending  = shop.isProfileCompleted && !shop.isOnboarded;
  const isApproved = shop.isOnboarded;
  const statusLabel = isApproved ? "Approved" : isPending ? "Pending Approval" : "Incomplete";
  const statusClass = isApproved ? "approved" : isPending ? "pending" : "incomplete";

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ad-drawer-hd">
          <h2>Shop Details</h2>
          <button className="ad-drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ad-drawer-scroll">
          {/* Cover */}
          <div className="ad-drawer-cover">
            {shop.shopImage
              ? <img src={shop.shopImage} alt={shop.parlourName} />
              : <div className="ad-drawer-cover-ph"><Store size={32} /></div>}
          </div>

          {/* Status + name */}
          <div className="ad-drawer-section">
            <span className={`ad-pill ${statusClass}`}>{statusLabel}</span>
            <h3 className="ad-drawer-name">{shop.parlourName || "Unnamed Shop"}</h3>
          </div>

          {/* About */}
          {shop.about && (
            <div className="ad-drawer-section">
              <p className="ad-drawer-label">About</p>
              <p className="ad-drawer-text">{shop.about}</p>
            </div>
          )}

          {/* Contact */}
          <div className="ad-drawer-section">
            <p className="ad-drawer-label">Owner Info</p>
            {shop.ownerName  && <p className="ad-drawer-row"><Users size={13} /> {shop.ownerName}</p>}
            {shop.ownerEmail && <p className="ad-drawer-row"><Mail  size={13} /> {shop.ownerEmail}</p>}
            {shop.phone      && <p className="ad-drawer-row"><Phone size={13} /> {shop.phone}</p>}
            {shop.address    && <p className="ad-drawer-row"><MapPin size={13} /> {shop.address}</p>}
          </div>

          {/* Gallery */}
          {Array.isArray(shop.galleryImages) && shop.galleryImages.length > 0 && (
            <div className="ad-drawer-section">
              <p className="ad-drawer-label">Gallery ({shop.galleryImages.length} photos)</p>
              <div className="ad-drawer-gallery">
                {shop.galleryImages.map((img, i) => (
                  <img key={i} src={img} alt={`Gallery ${i + 1}`} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="ad-drawer-actions">
              <button
                className="ad-btn-approve full"
                onClick={onApprove}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_approve"
                  ? <><RefreshCw size={15} className="ad-spin" /> Approving…</>
                  : <><CheckCircle size={15} /> Approve Shop</>}
              </button>
              <button
                className="ad-btn-reject full"
                onClick={onReject}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_reject"
                  ? <><RefreshCw size={15} className="ad-spin" /> Rejecting…</>
                  : <><XCircle size={15} /> Reject</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
