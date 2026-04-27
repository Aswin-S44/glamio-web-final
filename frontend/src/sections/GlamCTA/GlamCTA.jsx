import React, { useEffect, useRef } from "react";
import "./GlamCTA.css";
import { ArrowRight, Sparkles, MapPin, Phone } from "lucide-react";

const SQUARES = [
  { cls: "sq sq-1" }, { cls: "sq sq-2" }, { cls: "sq sq-3" },
  { cls: "sq sq-4" }, { cls: "sq sq-5" }, { cls: "sq sq-6" },
];

function GlamCTA() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("gcta--visible");
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="gcta" ref={sectionRef}>
      {/* Split background */}
      <div className="gcta__split-left" />
      <div className="gcta__split-right" />

      {/* Decorative geometric squares */}
      {SQUARES.map((s, i) => (
        <span key={i} className={s.cls} aria-hidden="true" />
      ))}

      {/* The HUGE background text (behind image) */}
      <div className="gcta__bg-text" aria-hidden="true">
        <span>YOUR</span>
        <span>GLOW</span>
      </div>

      <div className="gcta__grid">
        {/* ─── LEFT content ─── */}
        <div className="gcta__left">
          <div className="gcta__eyebrow">
            <Sparkles size={12} />
            <span>Experience Glamio</span>
          </div>

          <h2 className="gcta__heading">
            Book<br />
            <em>Your</em><br />
            Glow.
          </h2>

          <p className="gcta__desc">
            Step into a world where every detail is crafted for you.
            Expert stylists, premium products, and a space that feels
            like luxury — all waiting for your booking.
          </p>

          <div className="gcta__info">
            <div className="gcta__info-item">
              <MapPin size={14} />
              <span>Manjeri &amp; Kondotty, Kerala</span>
            </div>
            <div className="gcta__info-item">
              <Phone size={14} />
              <span>+91 94470 12345</span>
            </div>
          </div>

          <div className="gcta__actions">
            <a href="/shops" className="gcta__btn gcta__btn--dark">
              Book Now <ArrowRight size={16} />
            </a>
            <a href="#featured-salons" className="gcta__btn gcta__btn--ghost">
              Explore Salons
            </a>
          </div>
        </div>

        {/* ─── CENTER image ─── */}
        <div className="gcta__center">
          <div className="gcta__img-frame">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=85"
              alt="Glamio Salon Experience"
              className="gcta__img"
            />
            <div className="gcta__img-grad" />
          </div>

          {/* Rotating circular text badge */}
          <a href="/shops" className="gcta__spin" aria-label="Book now">
            <svg viewBox="0 0 130 130" className="gcta__spin-svg">
              <defs>
                <path
                  id="gctaPath"
                  d="M 65,65 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
                  fill="none"
                />
              </defs>
              <text>
                <textPath href="#gctaPath">
                  GLAMIO · YOUR GLOW · BOOK NOW · GLAMIO · YOUR GLOW ·
                </textPath>
              </text>
            </svg>
            <div className="gcta__spin-center">
              <ArrowRight size={18} />
            </div>
          </a>

          {/* Floating product circle (like reference) */}
          <div className="gcta__product-circle">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&auto=format&fit=crop&q=80"
              alt="treatment preview"
            />
            <div className="gcta__product-ring" />
            <span className="gcta__product-label">
              <Sparkles size={10} />
              Learn More
            </span>
          </div>
        </div>

        {/* ─── RIGHT details ─── */}
        <div className="gcta__right">
          <div className="gcta__stat-block">
            <strong>50K+</strong>
            <span>Satisfied Clients</span>
          </div>
          <div className="gcta__stat-block">
            <strong>4.9★</strong>
            <span>Average Rating</span>
          </div>
          <div className="gcta__stat-block">
            <strong>12</strong>
            <span>Years Experience</span>
          </div>
          <div className="gcta__open-strip">
            <span className="gcta__open-dot" />
            <div>
              <p className="gcta__open-label">Open Today</p>
              <p className="gcta__open-time">9:00 AM – 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GlamCTA;
