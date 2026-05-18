import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Mail,
  Eye,
  AlertCircle,
  Users,
  ChevronRight,
  Image as ImageIcon,
  X,
  Check,
  Tag,
  Megaphone,
  Pencil,
  Trash2,
  Plus,
  CalendarDays,
} from "lucide-react";
import "./AdminDashboard.css";
import { BASE_URL } from "../../../constants/urls";
import logoImg from "../../../components/Media/Images/Logo.png";

const ADMIN_KEY = btoa("admin@glamio.com:Admin@123");
const AUTH_HEADER = `admin ${ADMIN_KEY}`;

const TABS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "all", label: "All Shops", icon: Store },
  { key: "banners", label: "Banners", icon: Megaphone },
  { key: "offers", label: "Offers", icon: Tag },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("isAdminLoggedIn")) navigate("/admin/login");
  }, [navigate]);

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

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const filtered = shops.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.parlourName || "").toLowerCase().includes(q) ||
      (s.ownerEmail || "").toLowerCase().includes(q) ||
      (s.address || "").toLowerCase().includes(q) ||
      (s.ownerName || "").toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (tab === "pending") return s.isProfileCompleted && !s.isOnboarded;
    if (tab === "approved") return s.isOnboarded;
    return true;
  });

  const pendingCount = shops.filter(
    (s) => s.isProfileCompleted && !s.isOnboarded
  ).length;
  const approvedCount = shops.filter((s) => s.isOnboarded).length;

  const handleApprove = async (shopId) => {
    setActioning(shopId + "_approve");
    try {
      const res = await fetch(`${BASE_URL}/admin/shops/${shopId}/approve`, {
        method: "PATCH",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setShops((prev) =>
          prev.map((s) => (s.id === shopId ? { ...s, isOnboarded: true } : s))
        );
        if (selected?.id === shopId)
          setSelected((s) => ({ ...s, isOnboarded: true }));
      }
    } catch {}
    setActioning(null);
  };

  const handleReject = async (shopId) => {
    setActioning(shopId + "_reject");
    try {
      const res = await fetch(`${BASE_URL}/admin/shops/${shopId}/reject`, {
        method: "PATCH",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setShops((prev) =>
          prev.map((s) =>
            s.id === shopId
              ? { ...s, isOnboarded: false, isProfileCompleted: false }
              : s
          )
        );
        if (selected?.id === shopId) setSelected(null);
      }
    } catch {}
    setActioning(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login");
  };

  const isShopTab = ["pending", "approved", "all"].includes(tab);

  return (
    <div className="ad-root">
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
          {TABS.slice(0, 3).map(({ key, label, icon: Icon }) => (
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
          <p className="ad-nav-section" style={{ marginTop: 16 }}>
            Content
          </p>
          {TABS.slice(3).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`ad-nav-btn ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="ad-logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </aside>

      <main className="ad-main">
        {isShopTab && (
          <>
            <div className="ad-topbar">
              <div>
                <h1 className="ad-page-title">
                  {tab === "pending"
                    ? "Pending Approvals"
                    : tab === "approved"
                    ? "Approved Shops"
                    : "All Shops"}
                </h1>
                <p className="ad-page-sub">
                  {tab === "pending"
                    ? `${pendingCount} shop${
                        pendingCount !== 1 ? "s" : ""
                      } waiting for review`
                    : tab === "approved"
                    ? `${approvedCount} shop${
                        approvedCount !== 1 ? "s" : ""
                      } live on platform`
                    : `${shops.length} total registered shop${
                        shops.length !== 1 ? "s" : ""
                      }`}
                </p>
              </div>
              <button
                className="ad-refresh-btn"
                onClick={fetchShops}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "ad-spin" : ""} />
                Refresh
              </button>
            </div>
            <div className="ad-stats-row">
              <StatCard
                color="#f59e0b"
                bg="#fffbeb"
                icon={Clock}
                label="Pending"
                value={pendingCount}
              />
              <StatCard
                color="#10b981"
                bg="#ecfdf5"
                icon={CheckCircle}
                label="Approved"
                value={approvedCount}
              />
              <StatCard
                color="#6366f1"
                bg="#eef2ff"
                icon={Store}
                label="Total Shops"
                value={shops.length}
              />
              <StatCard
                color="#c2185b"
                bg="#fff0f6"
                icon={Users}
                label="Incomplete"
                value={shops.filter((s) => !s.isProfileCompleted).length}
              />
            </div>
            <div className="ad-search-bar">
              <Search size={15} className="ad-search-ico" />
              <input
                placeholder="Search by name, email, address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="ad-search-clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {loading ? (
              <div className="ad-state-box">
                <RefreshCw
                  size={28}
                  className="ad-spin"
                  style={{ color: "#c2185b" }}
                />
                <p>Loading shops…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ad-state-box">
                <AlertCircle
                  size={36}
                  strokeWidth={1.4}
                  style={{ color: "#ddd" }}
                />
                <p>
                  {search
                    ? "No shops match your search."
                    : tab === "pending"
                    ? "No pending approvals."
                    : "No shops found."}
                </p>
              </div>
            ) : (
              <div className="ad-grid">
                {filtered.map((shop) => (
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
          </>
        )}
        {tab === "banners" && <BannersSection />}
        {tab === "offers" && <OffersSection />}
      </main>

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

function ShopCard({ shop, actioning, onView, onApprove, onReject }) {
  const isPending = shop.isProfileCompleted && !shop.isOnboarded;
  const isApproved = shop.isOnboarded;
  const statusLabel = isApproved
    ? "Approved"
    : isPending
    ? "Pending"
    : "Incomplete";
  const statusClass = isApproved
    ? "approved"
    : isPending
    ? "pending"
    : "incomplete";

  return (
    <div className="ad-shop-card">
      <div className="ad-shop-cover">
        {shop.shopImage ? (
          <img src={shop.shopImage} alt={shop.parlourName} />
        ) : (
          <div className="ad-shop-cover-ph">
            <ImageIcon size={24} />
          </div>
        )}
        <span className={`ad-pill ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="ad-shop-body">
        <h3 className="ad-shop-name">{shop.parlourName || "Unnamed Shop"}</h3>
        {shop.ownerName && (
          <p className="ad-shop-meta">
            <Users size={11} /> {shop.ownerName}
          </p>
        )}
        {shop.ownerEmail && (
          <p className="ad-shop-meta">
            <Mail size={11} /> {shop.ownerEmail}
          </p>
        )}
        {shop.address && (
          <p className="ad-shop-meta">
            <MapPin size={11} /> {shop.address}
          </p>
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
                {actioning === shop.id + "_approve" ? (
                  <RefreshCw size={12} className="ad-spin" />
                ) : (
                  <Check size={13} />
                )}
                Approve
              </button>
              <button
                className="ad-btn-reject"
                onClick={onReject}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_reject" ? (
                  <RefreshCw size={12} className="ad-spin" />
                ) : (
                  <X size={13} />
                )}
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopDrawer({ shop, actioning, onClose, onApprove, onReject }) {
  const isPending = shop.isProfileCompleted && !shop.isOnboarded;
  const isApproved = shop.isOnboarded;
  const statusLabel = isApproved
    ? "Approved"
    : isPending
    ? "Pending Approval"
    : "Incomplete";
  const statusClass = isApproved
    ? "approved"
    : isPending
    ? "pending"
    : "incomplete";

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ad-drawer-hd">
          <h2>Shop Details</h2>
          <button className="ad-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="ad-drawer-scroll">
          <div className="ad-drawer-cover">
            {shop.shopImage ? (
              <img src={shop.shopImage} alt={shop.parlourName} />
            ) : (
              <div className="ad-drawer-cover-ph">
                <Store size={32} />
              </div>
            )}
          </div>
          <div className="ad-drawer-section">
            <span className={`ad-pill ${statusClass}`}>{statusLabel}</span>
            <h3 className="ad-drawer-name">
              {shop.parlourName || "Unnamed Shop"}
            </h3>
          </div>
          {shop.about && (
            <div className="ad-drawer-section">
              <p className="ad-drawer-label">About</p>
              <p className="ad-drawer-text">{shop.about}</p>
            </div>
          )}
          <div className="ad-drawer-section">
            <p className="ad-drawer-label">Owner Info</p>
            {shop.ownerName && (
              <p className="ad-drawer-row">
                <Users size={13} /> {shop.ownerName}
              </p>
            )}
            {shop.ownerEmail && (
              <p className="ad-drawer-row">
                <Mail size={13} /> {shop.ownerEmail}
              </p>
            )}
            {shop.phone && (
              <p className="ad-drawer-row">
                <Phone size={13} /> {shop.phone}
              </p>
            )}
            {shop.address && (
              <p className="ad-drawer-row">
                <MapPin size={13} /> {shop.address}
              </p>
            )}
          </div>
          {Array.isArray(shop.galleryImages) &&
            shop.galleryImages.length > 0 && (
              <div className="ad-drawer-section">
                <p className="ad-drawer-label">
                  Gallery ({shop.galleryImages.length} photos)
                </p>
                <div className="ad-drawer-gallery">
                  {shop.galleryImages.map((img, i) => (
                    <img key={i} src={img} alt={`Gallery ${i + 1}`} />
                  ))}
                </div>
              </div>
            )}
          {isPending && (
            <div className="ad-drawer-actions">
              <button
                className="ad-btn-approve full"
                onClick={onApprove}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_approve" ? (
                  <>
                    <RefreshCw size={15} className="ad-spin" /> Approving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} /> Approve Shop
                  </>
                )}
              </button>
              <button
                className="ad-btn-reject full"
                onClick={onReject}
                disabled={!!actioning}
              >
                {actioning === shop.id + "_reject" ? (
                  <>
                    <RefreshCw size={15} className="ad-spin" /> Rejecting…
                  </>
                ) : (
                  <>
                    <XCircle size={15} /> Reject
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EMPTY_BANNER = {
  title: "",
  offerDescription: "",
  image: "",
  imageFile: null,
};

function BannersSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_BANNER);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/banners`, {
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data.banners) ? data.banners : []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openAdd = () => {
    setForm(EMPTY_BANNER);
    setShowAdd(true);
  };
  const openEdit = (b) => {
    setForm({
      title: b.title,
      offerDescription: b.offerDescription,
      image: b.image,
      imageFile: null,
    });
    setEditItem(b);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm((f) => ({ ...f, image: base64, imageFile: base64 }));
  };

  const handleSave = async (isEdit) => {
    setSaving(true);
    try {
      const data = {
        title: form.title,
        offerDescription: form.offerDescription,
        image: form.imageFile,
      };
      const url = isEdit
        ? `${BASE_URL}/admin/banners/${editItem.id}`
        : `${BASE_URL}/admin/banners`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchBanners();
        setShowAdd(false);
        setEditItem(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/banners/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== deleteId));
        setDeleteId(null);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="ad-topbar">
        <div>
          <h1 className="ad-page-title">Banners</h1>
          <p className="ad-page-sub">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button className="ad-add-btn" onClick={openAdd}>
          <Plus size={14} /> Add Banner
        </button>
      </div>
      {loading ? (
        <div className="ad-state-box">
          <RefreshCw
            size={28}
            className="ad-spin"
            style={{ color: "#c2185b" }}
          />
          <p>Loading…</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="ad-state-box">
          <Megaphone size={36} strokeWidth={1.4} style={{ color: "#ddd" }} />
          <p>No banners yet. Add your first one.</p>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title}
                        className="ad-table-thumb"
                      />
                    ) : (
                      <div className="ad-table-thumb-ph">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="ad-table-title">{b.title}</td>
                  <td className="ad-table-desc">{b.offerDescription}</td>
                  <td>
                    <div className="ad-table-actions">
                      <button
                        className="ad-tbl-btn view"
                        onClick={() => setViewItem(b)}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        className="ad-tbl-btn edit"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="ad-tbl-btn del"
                        onClick={() => setDeleteId(b.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewItem && (
        <Modal title="View Banner" onClose={() => setViewItem(null)}>
          {viewItem.image && (
            <img
              src={viewItem.image}
              alt={viewItem.title}
              className="ad-modal-img"
            />
          )}
          <p className="ad-modal-label">Title</p>
          <p className="ad-modal-val">{viewItem.title}</p>
          <p className="ad-modal-label">Description</p>
          <p className="ad-modal-val">{viewItem.offerDescription}</p>
        </Modal>
      )}
      {(showAdd || editItem) && (
        <Modal
          title={editItem ? "Edit Banner" : "Add Banner"}
          onClose={() => {
            setShowAdd(false);
            setEditItem(null);
          }}
        >
          <BannerForm
            form={form}
            setForm={setForm}
            onImageChange={handleImageChange}
          />
          <div className="ad-modal-footer">
            <button
              className="ad-modal-cancel"
              onClick={() => {
                setShowAdd(false);
                setEditItem(null);
              }}
            >
              Cancel
            </button>
            <button
              className="ad-modal-save"
              onClick={() => handleSave(!!editItem)}
              disabled={saving}
            >
              {saving ? (
                <RefreshCw size={13} className="ad-spin" />
              ) : (
                <Check size={13} />
              )}
              {editItem ? "Save Changes" : "Add Banner"}
            </button>
          </div>
        </Modal>
      )}
      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this banner?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

function BannerForm({ form, setForm, onImageChange }) {
  return (
    <div className="ad-form">
      <label className="ad-form-label">Title</label>
      <input
        className="ad-form-input"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Banner title"
      />
      <label className="ad-form-label">Offer Description</label>
      <textarea
        className="ad-form-input ad-form-textarea"
        value={form.offerDescription}
        onChange={(e) =>
          setForm((f) => ({ ...f, offerDescription: e.target.value }))
        }
        placeholder="Describe the offer…"
      />
      <label className="ad-form-label">Image</label>
      {form.image && (
        <img src={form.image} alt="preview" className="ad-form-preview" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="ad-form-file"
      />
    </div>
  );
}

const EMPTY_OFFER = {
  title: "",
  offer: "",
  fromDate: "",
  toDate: "",
  buttonText: "",
  image: "",
  imageFile: null,
  shopOwnerId: "",
};

function OffersSection() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_OFFER);
  const [allShops, setAllShops] = useState([]);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/offers`, {
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data.offers) ? data.offers : []);
      }
    } catch {}
    setLoading(false);
  }, []);

  const fetchAllShops = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/customer/shops`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllShops(data?.shops ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchOffers();
    fetchAllShops();
  }, [fetchOffers, fetchAllShops]);

  const openAdd = () => {
    setForm(EMPTY_OFFER);
    setShowAdd(true);
  };
  const openEdit = (o) => {
    setForm({
      title: o.title,
      offer: o.offer,
      fromDate: o.fromDate ? o.fromDate.split("T")[0] : "",
      toDate: o.toDate ? o.toDate.split("T")[0] : "",
      buttonText: o.buttonText,
      image: o.image,
      imageFile: null,
      shopOwnerId: o.shopOwnerId ? String(o.shopOwnerId) : "",
    });
    setEditItem(o);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm((f) => ({ ...f, image: base64, imageFile: base64 }));
  };

  const handleSave = async (isEdit) => {
    setSaving(true);
    try {
      const data = {
        title: form.title,
        offer: form.offer,
        fromDate: form.fromDate,
        toDate: form.toDate,
        buttonText: form.buttonText,
        image: form.imageFile,
        shopOwnerId: form.shopOwnerId,
      };
      console.log("data-------------", data);
      const url = isEdit
        ? `${BASE_URL}/admin/offers/${editItem.id}`
        : `${BASE_URL}/admin/offers`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchOffers();
        setShowAdd(false);
        setEditItem(null);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/offers/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: AUTH_HEADER },
      });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== deleteId));
        setDeleteId(null);
      }
    } catch {}
    setSaving(false);
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  const getShopName = (shopOwnerId) => {
    const shop = allShops.find((s) => String(s.id) === String(shopOwnerId));
    return shop ? shop.parlourName : "—";
  };

  return (
    <div>
      <div className="ad-topbar">
        <div>
          <h1 className="ad-page-title">Offers</h1>
          <p className="ad-page-sub">
            {offers.length} offer{offers.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button className="ad-add-btn" onClick={openAdd}>
          <Plus size={14} /> Add Offer
        </button>
      </div>
      {loading ? (
        <div className="ad-state-box">
          <RefreshCw
            size={28}
            className="ad-spin"
            style={{ color: "#c2185b" }}
          />
          <p>Loading…</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="ad-state-box">
          <Tag size={36} strokeWidth={1.4} style={{ color: "#ddd" }} />
          <p>No offers yet. Add your first one.</p>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Offer</th>
                <th>Shop</th>
                <th>From</th>
                <th>To</th>
                <th>Button</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>
                    {o.image ? (
                      <img
                        src={o.image}
                        alt={o.title}
                        className="ad-table-thumb"
                      />
                    ) : (
                      <div className="ad-table-thumb-ph">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="ad-table-title">{o.title}</td>
                  <td className="ad-table-desc">{o.offer}</td>
                  <td className="ad-table-desc">
                    {getShopName(o.shopOwnerId)}
                  </td>
                  <td>{fmt(o.fromDate)}</td>
                  <td>{fmt(o.toDate)}</td>
                  <td>
                    <span className="ad-offer-btn-preview">{o.buttonText}</span>
                  </td>
                  <td>
                    <div className="ad-table-actions">
                      <button
                        className="ad-tbl-btn view"
                        onClick={() => setViewItem(o)}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        className="ad-tbl-btn edit"
                        onClick={() => openEdit(o)}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="ad-tbl-btn del"
                        onClick={() => setDeleteId(o.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewItem && (
        <Modal title="View Offer" onClose={() => setViewItem(null)}>
          {viewItem.image && (
            <img
              src={viewItem.image}
              alt={viewItem.title}
              className="ad-modal-img"
            />
          )}
          <p className="ad-modal-label">Title</p>
          <p className="ad-modal-val">{viewItem.title}</p>
          <p className="ad-modal-label">Offer</p>
          <p className="ad-modal-val">{viewItem.offer}</p>
          <p className="ad-modal-label">Shop</p>
          <p className="ad-modal-val">{getShopName(viewItem.shopOwnerId)}</p>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <p className="ad-modal-label">From Date</p>
              <p className="ad-modal-val">{fmt(viewItem.fromDate)}</p>
            </div>
            <div>
              <p className="ad-modal-label">To Date</p>
              <p className="ad-modal-val">{fmt(viewItem.toDate)}</p>
            </div>
          </div>
          <p className="ad-modal-label">Button Text</p>
          <span className="ad-offer-btn-preview large">
            {viewItem.buttonText}
          </span>
        </Modal>
      )}
      {(showAdd || editItem) && (
        <Modal
          title={editItem ? "Edit Offer" : "Add Offer"}
          onClose={() => {
            setShowAdd(false);
            setEditItem(null);
          }}
        >
          <OfferForm
            form={form}
            setForm={setForm}
            onImageChange={handleImageChange}
            allShops={allShops}
          />
          <div className="ad-modal-footer">
            <button
              className="ad-modal-cancel"
              onClick={() => {
                setShowAdd(false);
                setEditItem(null);
              }}
            >
              Cancel
            </button>
            <button
              className="ad-modal-save"
              onClick={() => handleSave(!!editItem)}
              disabled={saving}
            >
              {saving ? (
                <RefreshCw size={13} className="ad-spin" />
              ) : (
                <Check size={13} />
              )}
              {editItem ? "Save Changes" : "Add Offer"}
            </button>
          </div>
        </Modal>
      )}
      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this offer?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

function OfferForm({ form, setForm, onImageChange, allShops }) {
  return (
    <div className="ad-form">
      <label className="ad-form-label">Shop</label>
      <select
        className="ad-form-input"
        value={form.shopOwnerId}
        onChange={(e) =>
          setForm((f) => ({ ...f, shopOwnerId: e.target.value }))
        }
      >
        {console.log("allShops---------", allShops)}
        <option value="">— Select a shop —</option>
        {allShops.map((s) => (
          <option key={s?.shop?.id} value={s?.shop?.id}>
            {s?.shop?.parlourName}
          </option>
        ))}
      </select>
      <label className="ad-form-label">Title</label>
      <input
        className="ad-form-input"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Offer title"
      />
      <label className="ad-form-label">Offer</label>
      <textarea
        className="ad-form-input ad-form-textarea"
        value={form.offer}
        onChange={(e) => setForm((f) => ({ ...f, offer: e.target.value }))}
        placeholder="Describe the offer…"
      />
      <div className="ad-form-row">
        <div style={{ flex: 1 }}>
          <label className="ad-form-label">
            <CalendarDays size={12} style={{ marginRight: 4 }} />
            From Date
          </label>
          <input
            type="date"
            className="ad-form-input"
            value={form.fromDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, fromDate: e.target.value }))
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="ad-form-label">
            <CalendarDays size={12} style={{ marginRight: 4 }} />
            To Date
          </label>
          <input
            type="date"
            className="ad-form-input"
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
          />
        </div>
      </div>
      <label className="ad-form-label">Button Text</label>
      <input
        className="ad-form-input"
        value={form.buttonText}
        onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
        placeholder="e.g. Claim Offer"
      />
      {form.buttonText && (
        <span className="ad-offer-btn-preview" style={{ marginBottom: 12 }}>
          {form.buttonText}
        </span>
      )}
      <label className="ad-form-label">Image</label>
      {form.image && (
        <img src={form.image} alt="preview" className="ad-form-preview" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="ad-form-file"
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-drawer-hd">
          <h2>{title}</h2>
          <button className="ad-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="ad-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel, saving }) {
  return (
    <div className="ad-overlay" onClick={onCancel}>
      <div className="ad-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-confirm-icon">
          <Trash2 size={22} />
        </div>
        <p className="ad-confirm-msg">{message}</p>
        <div className="ad-modal-footer">
          <button className="ad-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="ad-modal-save red"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? (
              <RefreshCw size={13} className="ad-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
