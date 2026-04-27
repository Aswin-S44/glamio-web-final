import React, { useEffect, useState } from "react";
import "./Parlors.css";
import { BASE_URL } from "../../constants/urls";
import { MapPin, Star, Clock, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

const DUMMY_SALONS = [
  {
    shop: {
      id: "s1",
      parlourName: "Elite Beauty Lounge",
      address: "Court Road, Manjeri, Kerala",
      totalRating: 4.9,
      about:
        "Premium beauty services with expert stylists. Specializing in bridal makeovers, luxury hair treatments and advanced skincare. Step in — let us transform you.",
      shopImage:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=85",
    },
    user: { profileImage: null },
  },
  {
    shop: {
      id: "s2",
      parlourName: "Royal Touch Salon",
      address: "Airport Road, Kondotty, Kerala",
      totalRating: 4.8,
      about:
        "Where luxury meets style. World-class hair, makeup and skin treatments in a serene, elegant setting. Your transformation begins the moment you walk in.",
      shopImage:
        "https://images.unsplash.com/photo-1522338242992-e1a54906a5da?w=800&auto=format&fit=crop&q=85",
    },
    user: { profileImage: null },
  },
];

const SERVICE_TAGS = ["Hair", "Makeup", "Nails", "Bridal", "Skin", "Lashes"];

function SalonCard({ item, index }) {
  const shop = item?.shop;
  const user = item?.user;
  const image =
    shop?.shopImage ??
    user?.profileImage ??
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop";

  return (
    <div
      className="fp-card"
      style={{ "--card-delay": `${index * 0.18}s` }}
      onClick={() =>
        (window.location.href = `/parlour/${shop?.id}`)
      }
    >
      {/* Image */}
      <div className="fp-card__img-wrap">
        <img src={image} alt={shop?.parlourName ?? "Salon"} className="fp-card__img" />
        <div className="fp-card__overlay" />

        <div className="fp-card__open-badge">
          <span className="fp-card__pulse" />
          Open Now
        </div>

        <div className="fp-card__rating">
          <Star size={13} fill="#FFD700" color="#FFD700" />
          <span>{shop?.totalRating ?? "4.9"}</span>
        </div>

        <div className="fp-card__idx">0{index + 1}</div>
      </div>

      {/* Body */}
      <div className="fp-card__body">
        <div className="fp-card__loc">
          <MapPin size={12} />
          <span>{shop?.address ?? "Kerala, India"}</span>
        </div>

        <h3 className="fp-card__name">{shop?.parlourName ?? "Glamio Salon"}</h3>

        <p className="fp-card__about">
          {shop?.about ??
            "Premium beauty services crafted for your unique style and beauty journey."}
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

function Parlors() {
  const [shops, setShops] = useState(DUMMY_SALONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch(`${BASE_URL}/customer/shops`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const list = data?.shops ?? [];
        setShops(list.length > 0 ? list : DUMMY_SALONS);
      } catch {
        setShops(DUMMY_SALONS);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const displayShops = loading ? DUMMY_SALONS : shops;

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

        <div className="fp-grid">
          {displayShops.map((item, i) => (
            <SalonCard key={item?.shop?.id ?? i} item={item} index={i} />
          ))}
        </div>

        <div className="fp-strip">
          <div className="fp-trust">
            {["Verified Salons", "Instant Booking", "Free Cancellation", "Expert Stylists"].map((t) => (
              <span key={t} className="fp-trust-item">
                <CheckCircle size={13} />
                {t}
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
