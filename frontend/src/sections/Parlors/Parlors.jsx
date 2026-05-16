import React, { useEffect, useState } from "react";
import "./Parlors.css";
import { BASE_URL } from "../../constants/urls";
import { MapPin, Star, Clock, ArrowRight, Sparkles, CheckCircle, Store } from "lucide-react";

const SERVICE_TAGS = ["Hair", "Makeup", "Nails", "Bridal", "Skin", "Lashes"];

function SalonCard({ item, index }) {
  const shop = item?.shop;
  const user = item?.user;
  const image =
    shop?.shopImage ||
    user?.profileImage ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=85";

  return (
    <div
      className="fp-card"
      style={{ "--card-delay": `${index * 0.15}s` }}
      onClick={() => (window.location.href = `/parlour/${shop?.id}`)}
    >
      <div className="fp-card__img-wrap">
        <img src={image} alt={shop?.parlourName ?? "Salon"} className="fp-card__img" />
        <div className="fp-card__overlay" />
        <div className="fp-card__open-badge">
          <span className="fp-card__pulse" />
          Open Now
        </div>
        <div className="fp-card__rating">
          <Star size={13} fill="#FFD700" color="#FFD700" />
          <span>{shop?.totalRating ?? "5.0"}</span>
        </div>
        <div className="fp-card__idx">0{index + 1}</div>
      </div>

      <div className="fp-card__body">
        <div className="fp-card__loc">
          <MapPin size={12} />
          <span>{shop?.address ?? "Kerala, India"}</span>
        </div>
        <h3 className="fp-card__name">{shop?.parlourName ?? "Orucom Salon"}</h3>
        <p className="fp-card__about">
          {shop?.about?.length > 120
            ? shop.about.slice(0, 120) + "…"
            : shop?.about || "Premium beauty services crafted for you."}
        </p>
        <div className="fp-card__tags">
          {SERVICE_TAGS.slice(0, 4).map((s) => (
            <span key={s} className="fp-card__tag">{s}</span>
          ))}
          <span className="fp-card__tag fp-card__tag--more">+2 more</span>
        </div>
        <div className="fp-card__footer">
          <div className="fp-card__sub">
            <div className="fp-card__wait">
              <Clock size={12} />
              <span>~15 min wait</span>
            </div>
            <span className="fp-card__hours">Mon–Sat: 9am–8pm</span>
          </div>
          <button
            className="fp-card__book"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/parlour/${shop?.id}`;
            }}
          >
            Book Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="fp-card fp-skeleton">
      <div className="fp-skel-img" />
      <div className="fp-card__body">
        <div className="fp-skel-line" style={{ width: "50%", marginBottom: 10 }} />
        <div className="fp-skel-line" style={{ width: "80%", marginBottom: 8 }} />
        <div className="fp-skel-line" style={{ width: "100%", marginBottom: 6 }} />
        <div className="fp-skel-line" style={{ width: "90%", marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="fp-skel-tag" />)}
        </div>
        <div className="fp-skel-line" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="fp-empty">
      <div className="fp-empty-icon">
        <Store size={40} strokeWidth={1.5} />
      </div>
      <h3>No salons available yet</h3>
      <p>We're onboarding premium salons near you. Check back soon!</p>
    </div>
  );
}

function Parlors() {
  const [shops, setShops]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/customer/shops`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setShops(data?.shops ?? []);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="fp-section" id="featured-salons">
      <div className="fp-bg-glow" />

      <div className="fp-container">
        <div className="fp-header">
          <div className="fp-eyebrow">
            <Sparkles size={12} />
            <span>Handpicked Locations</span>
          </div>
          <h2 className="fp-title">Featured Salons</h2>
          <p className="fp-sub">
            Exceptional spaces, expert hands — your beauty journey starts here.
          </p>
        </div>

        {loading ? (
          <div className="fp-grid">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : shops.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="fp-grid">
            {shops.map((item, i) => (
              <SalonCard key={item?.shop?.id ?? i} item={item} index={i} />
            ))}
          </div>
        )}

        <div className="fp-strip">
          <div className="fp-trust">
            {["Verified Salons", "Instant Booking", "Free Cancellation", "Expert Stylists"].map((t) => (
              <span key={t} className="fp-trust-item">
                <CheckCircle size={13} /> {t}
              </span>
            ))}
          </div>
          <a href="/shops" className="fp-explore">
            View All Salons <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Parlors;
