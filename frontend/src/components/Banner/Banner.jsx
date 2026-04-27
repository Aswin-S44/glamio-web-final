import React, { useEffect, useRef } from "react";
import "./Banner.css";
import { ArrowRight, Star, Sparkles, MapPin, CheckCircle } from "lucide-react";

function Banner() {
  const headlineRef = useRef(null);

  useEffect(() => {
    const lines = headlineRef.current?.querySelectorAll(".h-word");
    lines?.forEach((el, i) => {
      el.style.animationDelay = `${0.15 + i * 0.14}s`;
    });
  }, []);

  return (
    <section className="h-hero">
      {/* ── Warm background shapes ─────────────────── */}
      <div className="h-bg-blob h-bg-blob-1" />
      <div className="h-bg-blob h-bg-blob-2" />
      <div className="h-bg-blob h-bg-blob-3" />
      <div className="h-grid-overlay" />

      {/* ── Floating sparkle decoratives ──────────── */}
      <span className="h-deco h-deco-1" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-2" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-3" aria-hidden="true">+</span>
      <span className="h-deco h-deco-4" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-5" aria-hidden="true">✦</span>

      <div className="h-grid">
        {/* ════ LEFT COLUMN ════ */}
        <div className="h-left">
          <div className="h-eyebrow">
            <Sparkles size={12} />
            <span>Premium Beauty Platform · Est. 2024</span>
          </div>

          <h1 className="h-headline" ref={headlineRef}>
            <span className="h-word h-word-1">YOUR</span>
            <span className="h-word h-word-2 h-word--row">
              BEAUTY
              <span className="h-toggle-pill">
                <ArrowRight size={14} />
                <span className="h-toggle-dot" />
              </span>
            </span>
            <span className="h-word h-word-3">
              AWAITS<em className="h-em">.</em>
            </span>
          </h1>

          <div className="h-desc-row">
            <div className="h-avatar-stack">
              <img
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&auto=format&fit=crop&q=80"
                alt="happy client"
                className="h-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&auto=format&fit=crop&q=80"
                alt="happy client"
                className="h-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&auto=format&fit=crop&q=80"
                alt="happy client"
                className="h-avatar"
              />
            </div>
            <p className="h-desc">
              Discover curated salons for your unique beauty journey.
              Book instantly, <em>glow always.</em>
            </p>
          </div>

          <div className="h-actions">
            <a href="/shops" className="h-btn h-btn--dark">
              Book Now
              <ArrowRight size={16} />
            </a>
            <a href="#featured-salons" className="h-btn h-btn--outline">
              Explore Salons
            </a>
          </div>

          <div className="h-stats">
            <div className="h-stat">
              <strong>50K+</strong>
              <span>Happy Clients</span>
            </div>
            <div className="h-stat-sep" />
            <div className="h-stat">
              <strong>4.9★</strong>
              <span>Avg Rating</span>
            </div>
            <div className="h-stat-sep" />
            <div className="h-stat">
              <strong>2</strong>
              <span>Locations</span>
            </div>
          </div>

          {/* Badges row */}
          <div className="h-trust-row">
            <div className="h-trust-item">
              <CheckCircle size={14} />
              <span>Verified Salons</span>
            </div>
            <div className="h-trust-item">
              <CheckCircle size={14} />
              <span>Free Cancellation</span>
            </div>
            <div className="h-trust-item">
              <CheckCircle size={14} />
              <span>Instant Booking</span>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div className="h-right">
          <div className="h-img-area">
            {/* Main large oval image */}
            <div className="h-oval">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&auto=format&fit=crop&q=85"
                alt="Glamio Salon interior"
              />
              <div className="h-oval-overlay" />
            </div>

            {/* Rotating circular text badge */}
            <a href="/shops" className="h-spin-badge" aria-label="Book now">
              <svg viewBox="0 0 130 130" className="h-spin-svg">
                <defs>
                  <path
                    id="hSpinPath"
                    d="M 65,65 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
                    fill="none"
                  />
                </defs>
                <text>
                  <textPath href="#hSpinPath" startOffset="0%">
                    GLAMIO BEAUTY · BOOK NOW · GLAMIO BEAUTY · BOOK NOW ·
                  </textPath>
                </text>
              </svg>
              <div className="h-spin-center">
                <ArrowRight size={18} />
              </div>
            </a>

            {/* Floating rating card */}
            <div className="h-float-card h-float-card--top">
              <div className="h-float-icon">
                <Star size={14} fill="#FFD700" color="#FFD700" />
              </div>
              <div className="h-float-body">
                <strong>4.9</strong>
                <span>Top Rated</span>
              </div>
            </div>

            {/* Floating open card */}
            <div className="h-float-card h-float-card--mid">
              <span className="h-pulse-dot" />
              <span>Open Now</span>
            </div>

            {/* Mini category tags on image */}
            <div className="h-img-tag h-img-tag--1">💇 Hair</div>
            <div className="h-img-tag h-img-tag--2">💅 Nails</div>
          </div>

          {/* Below image info */}
          <div className="h-open-strip">
            <span className="h-open-line" />
            <span className="h-open-label">OFFICIALLY OPEN NOW!</span>
            <span className="h-open-line" />
          </div>
          <div className="h-location">
            <MapPin size={13} />
            <span>MANJERI &amp; KONDOTTY, KERALA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
