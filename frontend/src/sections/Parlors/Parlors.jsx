import React, { useEffect, useState } from "react";
import "./Parlors.css";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { buildShopUrl } from "../../utils/shopUrl.util";
import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Store,
  Scissors,
  Sparkles as ServiceIcon,
} from "lucide-react";

function SalonCard({ item, index }) {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div
      className="fp-card"
      style={{ "--card-delay": `${index * 0.15}s` }}
      onClick={() => (window.location.href = buildShopUrl(item))}
    >
      <div className="fp-card__img-wrap">
        <img
          src={item?.shopImage || DEFAULT_NO_IMAGE}
          alt={item?.parlourName ?? "Salon"}
          className="fp-card__img"
        />
        <div className="fp-card__overlay" />
        <div className="fp-card__open-badge">
          <span className="fp-card__pulse" />
          Open Now
        </div>
        <div className="fp-card__rating">
          <Star size={13} fill="#FFD700" color="#FFD700" />
          <span>{item?.totalRating || "5.0"}</span>
        </div>
        <div className="fp-card__idx">0{index + 1}</div>
      </div>

      <div className="fp-card__body">
        <div className="fp-card__loc">
          <MapPin size={12} />
          <span>{item?.address || "Kerala, India"}</span>
        </div>
        <h3 className="fp-card__name">{item?.parlourName || "Orucom Salon"}</h3>

        {item?.services && item.services.length > 0 && (
          <div className="fp-card__services">
            <div className="fp-services-header">
              <Scissors size={12} />
              <span>Popular Services</span>
            </div>
            <div className="fp-services-list">
              {item.services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="fp-service-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/parlor/${item.id}/service/${service.id}`;
                  }}
                >
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="fp-service-img"
                    />
                  ) : (
                    <ServiceIcon size={14} />
                  )}
                  <span className="fp-service-name">{service.name}</span>
                  <span className="fp-service-price">₹{service.rate}</span>
                </div>
              ))}
              {item.services.length > 3 && (
                <div className="fp-service-more">
                  +{item.services.length - 3} more services
                </div>
              )}
            </div>
          </div>
        )}

        <p className="fp-card__about">
          {item?.about?.length > 100
            ? item.about.slice(0, 100) + "…"
            : item?.about || "Premium beauty services crafted for you."}
        </p>

        <div className="fp-card__footer">
          {/* <div className="fp-card__sub">
            <div className="fp-card__wait">
              <Clock size={12} />
              <span>~15 min wait</span>
            </div>
            <span className="fp-card__hours">Mon–Sat: 9am–8pm</span>
          </div> */}
          <button
            className="fp-card__book"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = buildShopUrl(item);
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
        <div
          className="fp-skel-line"
          style={{ width: "50%", marginBottom: 10 }}
        />
        <div
          className="fp-skel-line"
          style={{ width: "80%", marginBottom: 8 }}
        />
        <div
          className="fp-skel-line"
          style={{ width: "100%", marginBottom: 6 }}
        />
        <div
          className="fp-skel-line"
          style={{ width: "90%", marginBottom: 20 }}
        />
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
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/customer/shops`);
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
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="fp-grid">
            {shops.map((item, i) => (
              <SalonCard key={item?.id ?? i} item={item} index={i} />
            ))}
          </div>
        )}

        <div className="fp-strip">
          <div className="fp-trust">
            {[
              "Verified Salons",
              "Instant Booking",
              "Free Cancellation",
              "Expert Stylists",
            ].map((t) => (
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
