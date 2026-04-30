import React, { useState, useEffect, useRef } from "react";
import {
  Camera, MapPin, Store, Info, Link2, Trash2,
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Save,
  Phone, User, ShieldCheck, ImageIcon, Plus, X, Images,
} from "lucide-react";
import "./EditProfileScreen.css";
import { convertToBase642 } from "../../utils/utils";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../constants/urls";

const MAX_ABOUT = 400;
const MAX_GALLERY = 10;

const CHECKLIST = [
  { key: "parlourName", label: "Business name" },
  { key: "address",     label: "Address"        },
  { key: "about",       label: "Description"    },
  { key: "shopImage",   label: "Cover photo"    },
];

export default function EditProfileScreen() {
  const navigate    = useNavigate();
  const fileRef     = useRef(null);
  const galleryRef  = useRef(null);

  const [form, setForm] = useState({
    parlourName: "", about: "", address: "",
    googleReviewUrl: "", shopImage: null,
    galleryImages: [],
  });
  const [phone,    setPhone]    = useState("");
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);
  const token = localStorage.getItem("token");

  /* ── Pre-load ── */
  useEffect(() => {
    if (!token) { setFetching(false); return; }
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/shops`, { headers: { Authorization: token } });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.shop) {
          const s = data.shop;
          setForm({
            parlourName:     s.parlourName     || "",
            about:           s.about           || "",
            address:         s.address         || "",
            googleReviewUrl: s.googleReviewUrl || "",
            shopImage:       s.shopImage       || null,
            galleryImages:   Array.isArray(s.galleryImages) ? s.galleryImages : [],
          });
        }
        if (data?.user?.phone) setPhone(data.user.phone);
      } catch { /* silent */ } finally { setFetching(false); }
    })();
  }, [token]);

  /* ── Helpers ── */
  const field = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: null }));
    setSaved(false);
  };

  const validate = () => {
    const e = {};
    if (!form.parlourName.trim()) e.parlourName = "Business name is required";
    if (!form.about.trim())       e.about       = "Description is required";
    else if (form.about.length > MAX_ABOUT) e.about = `Max ${MAX_ABOUT} chars`;
    if (!form.address.trim())     e.address     = "Address is required";
    if (form.googleReviewUrl && !form.googleReviewUrl.startsWith("http"))
      e.googleReviewUrl = "Must start with http";
    setErrors(e);
    return !Object.keys(e).length;
  };

  /* ── Cover photo ── */
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null; // allow re-selecting same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Please select an image file.", confirmButtonColor: "#c2185b" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "Too large", text: "Max 5 MB", confirmButtonColor: "#c2185b" });
      return;
    }
    try {
      const b64 = await convertToBase642(file);
      setForm(p => ({ ...p, shopImage: b64 }));
      setSaved(false);
    } catch {
      Swal.fire({ icon: "error", title: "Upload failed", text: "Could not read the image. Please try again.", confirmButtonColor: "#c2185b" });
    }
  };

  /* ── Gallery images ── */
  const handleGalleryImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = null;
    if (!files.length) return;

    const remaining = MAX_GALLERY - form.galleryImages.length;
    if (remaining <= 0) {
      Swal.fire({ icon: "warning", title: "Limit reached", text: `You can upload up to ${MAX_GALLERY} gallery photos.`, confirmButtonColor: "#c2185b" });
      return;
    }

    const toProcess = files.slice(0, remaining);
    const oversized = toProcess.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      Swal.fire({ icon: "error", title: "File too large", text: `${oversized.length} file(s) exceed 5 MB and were skipped.`, confirmButtonColor: "#c2185b" });
    }

    const valid = toProcess.filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"));
    try {
      const b64s = await Promise.all(valid.map(f => convertToBase642(f)));
      setForm(p => ({ ...p, galleryImages: [...p.galleryImages, ...b64s] }));
      setSaved(false);
    } catch {
      Swal.fire({ icon: "error", title: "Upload failed", text: "Some images could not be read.", confirmButtonColor: "#c2185b" });
    }
  };

  const removeGalleryImage = (index) => {
    setForm(p => ({ ...p, galleryImages: p.galleryImages.filter((_, i) => i !== index) }));
    setSaved(false);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const body = {
        shop: { ...form, isProfileCompleted: true },
        ...(phone ? { user: { phone } } : {}),
      };
      const res = await fetch(`${BASE_URL}/shops`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body:    JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        await Swal.fire({
          title: "Profile Saved!",
          text:  "Your profile has been submitted for admin review.",
          icon:  "success",
          confirmButtonColor: "#c2185b",
          confirmButtonText: "OK",
        });
        navigate("/shop/onboard");
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save Failed", text: err.message, confirmButtonColor: "#c2185b" });
    } finally { setLoading(false); }
  };

  /* ── Completion ── */
  const completed = CHECKLIST.filter(c => !!form[c.key]).length;
  const pct       = Math.round((completed / CHECKLIST.length) * 100);

  /* ── Skeleton ── */
  if (fetching) return (
    <div className="ep-root">
      <TopBar loading={false} saved={false} onBack={() => navigate("/shop/dashboard")} onSave={() => {}} />
      <div className="ep-body">
        <div className="ep-main ep-shimmer-wrap">
          {[220, 80, 80, 120, 80].map((h, i) => (
            <div key={i} className="ep-shimmer" style={{ height: h }} />
          ))}
        </div>
        <div className="ep-sidebar ep-shimmer-wrap" style={{ gap: 12 }}>
          {[160, 100, 60].map((h, i) => (
            <div key={i} className="ep-shimmer" style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="ep-root">
      <TopBar
        loading={loading} saved={saved}
        onBack={() => navigate("/shop/dashboard")}
        onSave={handleSubmit}
      />

      <form className="ep-body" onSubmit={handleSubmit} noValidate>
        {/* ─── LEFT: main form ─── */}
        <div className="ep-main">

          {/* Cover photo */}
          <div className="ep-cover-wrap">
            <div
              className={`ep-cover ${form.shopImage ? "has-img" : ""}`}
              style={form.shopImage ? { backgroundImage: `url(${form.shopImage})` } : {}}
              onClick={() => fileRef.current?.click()}
            >
              {!form.shopImage ? (
                <div className="ep-cover-empty">
                  <ImageIcon size={28} strokeWidth={1.5} />
                  <span>Upload cover photo</span>
                  <small>JPG / PNG · max 5 MB</small>
                </div>
              ) : (
                <div className="ep-cover-overlay" onClick={() => fileRef.current?.click()}>
                  <Camera size={18} /> Change photo
                </div>
              )}
            </div>
            {form.shopImage && (
              <button type="button" className="ep-remove-btn"
                onClick={() => { setForm(p => ({ ...p, shopImage: null })); setSaved(false); }}>
                <Trash2 size={13} /> Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleImage} />
          </div>

          {/* Business info */}
          <div className="ep-card">
            <div className="ep-card-title">
              <Store size={16} /> Business Information
            </div>
            <div className="ep-grid">
              <Field label="Parlour Name" icon={<Store size={13}/>} required error={errors.parlourName}>
                <input
                  type="text" placeholder="e.g. Royal Glow Beauty Lounge"
                  value={form.parlourName}
                  onChange={e => field("parlourName", e.target.value)}
                  className={errors.parlourName ? "err" : ""}
                />
              </Field>

              <Field label="Address" icon={<MapPin size={13}/>} required error={errors.address}>
                <input
                  type="text" placeholder="Street, City, State, PIN"
                  value={form.address}
                  onChange={e => field("address", e.target.value)}
                  className={errors.address ? "err" : ""}
                />
              </Field>

              <Field label="About" icon={<Info size={13}/>} required error={errors.about} full>
                <textarea
                  rows={4}
                  placeholder="Describe your expertise, atmosphere and signature services…"
                  value={form.about}
                  onChange={e => field("about", e.target.value)}
                  className={errors.about ? "err" : ""}
                  maxLength={MAX_ABOUT + 1}
                />
                <span className={`ep-char ${form.about.length > MAX_ABOUT ? "over" : ""}`}>
                  {form.about.length}/{MAX_ABOUT}
                </span>
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div className="ep-card">
            <div className="ep-card-title">
              <Link2 size={16} /> Contact &amp; Online Presence
            </div>
            <div className="ep-grid">
              <Field label="Phone Number" icon={<Phone size={13}/>}>
                <input
                  type="tel" placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setSaved(false); }}
                />
              </Field>

              <Field label="Google Review Link" icon={<Link2 size={13}/>}
                     optional error={errors.googleReviewUrl}>
                <input
                  type="url" placeholder="https://g.page/r/…"
                  value={form.googleReviewUrl}
                  onChange={e => field("googleReviewUrl", e.target.value)}
                  className={errors.googleReviewUrl ? "err" : ""}
                />
              </Field>
            </div>
          </div>

          {/* Gallery images */}
          <div className="ep-card">
            <div className="ep-card-title">
              <Images size={16} /> Shop Gallery
              <span className="ep-gallery-count">{form.galleryImages.length}/{MAX_GALLERY}</span>
            </div>
            <p className="ep-gallery-hint">Add photos of your shop, interior, and work to attract more customers.</p>

            <div className="ep-gallery-grid">
              {form.galleryImages.map((img, i) => (
                <div key={i} className="ep-gallery-item">
                  <img src={img} alt={`Gallery ${i + 1}`} />
                  <button
                    type="button"
                    className="ep-gallery-remove"
                    onClick={() => removeGalleryImage(i)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {form.galleryImages.length < MAX_GALLERY && (
                <button
                  type="button"
                  className="ep-gallery-add"
                  onClick={() => galleryRef.current?.click()}
                >
                  <Plus size={22} strokeWidth={1.8} />
                  <span>Add Photos</span>
                </button>
              )}
            </div>

            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleGalleryImages}
            />
          </div>

          {/* Actions */}
          <div className="ep-actions">
            <button type="button" className="ep-btn-ghost"
              onClick={() => navigate("/shop/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="ep-btn-primary" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="ep-spin"/> Saving…</>
                : <><Save size={16}/> Save Profile</>}
            </button>
          </div>
        </div>

        {/* ─── RIGHT: sidebar ─── */}
        <aside className="ep-sidebar">

          {/* Profile completion */}
          <div className="ep-side-card">
            <div className="ep-side-title">
              <ShieldCheck size={15}/> Profile Completion
            </div>
            <div className="ep-progress-track">
              <div className="ep-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="ep-pct">{pct}% complete</span>
            <ul className="ep-checklist">
              {CHECKLIST.map(({ key, label }) => (
                <li key={key} className={form[key] ? "done" : ""}>
                  <CheckCircle size={14}/> {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Live preview */}
          <div className="ep-side-card ep-preview-card">
            <div className="ep-side-title">
              <User size={15}/> Preview
            </div>
            <div className="ep-preview-cover"
              style={form.shopImage
                ? { backgroundImage: `url(${form.shopImage})` }
                : {}}>
              {!form.shopImage && <Camera size={20} />}
            </div>
            <div className="ep-preview-body">
              <p className="ep-preview-name">{form.parlourName || "Your Parlour Name"}</p>
              {form.address && (
                <p className="ep-preview-addr"><MapPin size={11}/> {form.address}</p>
              )}
              {form.about && (
                <p className="ep-preview-about">
                  {form.about.length > 80 ? form.about.slice(0, 80) + "…" : form.about}
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="ep-side-card ep-tips">
            <div className="ep-side-title">💡 Tips</div>
            <ul>
              <li>A good cover photo increases bookings by up to 3×</li>
              <li>Add gallery photos to showcase your work and attract clients</li>
              <li>Keep your description under 300 chars for best display</li>
              <li>Add a Google Review link to build trust with new customers</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}

/* ── Reusable sub-components ── */
function TopBar({ loading, saved, onBack, onSave }) {
  return (
    <header className="ep-topbar">
      <button type="button" className="ep-back" onClick={onBack}>
        <ArrowLeft size={16}/> Dashboard
      </button>
      <span className="ep-topbar-title">Edit Business Profile</span>
      <button type="button" className={`ep-save-top ${saved ? "saved" : ""}`}
        onClick={onSave} disabled={loading}>
        {loading ? <><Loader2 size={15} className="ep-spin"/> Saving…</>
         : saved  ? <><CheckCircle size={15}/> Saved</>
                  : <><Save size={15}/> Save Changes</>}
      </button>
    </header>
  );
}

function Field({ label, icon, required, optional, error, full, children }) {
  return (
    <div className={`ep-field${full ? " full" : ""}${error ? " has-err" : ""}`}>
      <label>
        {icon} {label}
        {required && <span className="req">*</span>}
        {optional && <span className="opt">(optional)</span>}
      </label>
      {children}
      {error && <span className="ep-err"><AlertCircle size={11}/> {error}</span>}
    </div>
  );
}
