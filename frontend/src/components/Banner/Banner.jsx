import React, { useEffect, useRef } from "react";
import "./Banner.css";
import { ArrowRight, Star, Sparkles, MapPin, CheckCircle } from "lucide-react";
import img from '../../components/Media/Images/modern-beauty-salon-interior.webp'

function Banner() {
  const rightRef  = useRef(null);
  const sectionRef = useRef(null);

  /* 3-D tilt on mouse-move */
  useEffect(() => {
    const card = rightRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 10}deg) translateZ(0)`;
    };
    const handleLeave = () => {
      card.style.transform = `perspective(900px) rotateY(-8deg) rotateX(3deg) translateZ(0)`;
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  /* Scroll-triggered entrance (GSAP-style via CSS classes) */
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll("[data-anim]");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="h-hero" ref={sectionRef}>
      {/* ── Background ── */}
      <div className="h-bg-blob h-bg-blob-1" />
      <div className="h-bg-blob h-bg-blob-2" />
      <div className="h-bg-blob h-bg-blob-3" />
      <div className="h-grid-overlay" />

      <span className="h-deco h-deco-1" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-2" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-3" aria-hidden="true">+</span>
      <span className="h-deco h-deco-4" aria-hidden="true">✦</span>
      <span className="h-deco h-deco-5" aria-hidden="true">✦</span>

      <div className="h-grid">
        {/* ════ LEFT ════ */}
        <div className="h-left">
          <div className="h-eyebrow" data-anim="fade-up" style={{ "--d": "0s" }}>
            <Sparkles size={12} />
            <span>Premium Beauty Platform · Est. 2024</span>
          </div>

          <h1 className="h-headline">
            {/* <span className="h-word h-word-1" data-anim="fade-up" style={{ "--d": ".12s" }}>YOUR</span> */}
            <span className="h-word h-word-2 h-word--row" data-anim="fade-up" style={{ "--d": ".22s" }}>
              BEAUTY
              <span className="h-toggle-pill">
                <ArrowRight size={14} />
                <span className="h-toggle-dot" />
              </span>
            </span>
            <span className="h-word h-word-3" data-anim="fade-up" style={{ "--d": ".32s" }}>
              AWAITS<em className="h-em">.</em>
            </span>
          </h1>

          <div className="h-desc-row" data-anim="fade-up" style={{ "--d": ".44s" }}>
            <div className="h-avatar-stack">
              <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&auto=format&fit=crop&q=80" alt="client" className="h-avatar" />
              <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&auto=format&fit=crop&q=80" alt="client" className="h-avatar" />
              <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&auto=format&fit=crop&q=80" alt="client" className="h-avatar" />
            </div>
            <p className="h-desc">
              Discover curated salons for your unique beauty journey.
              Book instantly, <em>glow always.</em>
            </p>
          </div>

          <div className="h-actions" data-anim="fade-up" style={{ "--d": ".54s" }}>
            <a href="/shops" className="h-btn h-btn--dark">
              Book Now <ArrowRight size={16} />
            </a>
            <a href="#featured-salons" className="h-btn h-btn--outline">
              Explore Salons
            </a>
          </div>

          <div className="h-stats" data-anim="fade-up" style={{ "--d": ".64s" }}>
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

          <div className="h-trust-row" data-anim="fade-up" style={{ "--d": ".74s" }}>
            <div className="h-trust-item"><CheckCircle size={13} /><span>Verified Salons</span></div>
            <div className="h-trust-item"><CheckCircle size={13} /><span>Free Cancellation</span></div>
            <div className="h-trust-item"><CheckCircle size={13} /><span>Instant Booking</span></div>
          </div>
        </div>

        {/* ════ RIGHT — 3-D image card ════ */}
        <div className="h-right" data-anim="fade-right" style={{ "--d": ".18s" }}>
          {/* 3-D card wrapper (tilt target) */}
          <div className="h-img-3d-wrap" ref={rightRef}>
            {/* Depth layers behind the oval */}
            <div className="h-depth-layer h-depth-layer-1" />
            <div className="h-depth-layer h-depth-layer-2" />

            <div className="h-img-area">
              <div className="h-oval">
                <img
                  src={img}
                  alt="Glamio Salon"
                />
                <div className="h-oval-overlay" />
              </div>

              {/* Rotating badge */}
              <a href="/shops" className="h-spin-badge" aria-label="Book now">
                <svg viewBox="0 0 130 130" className="h-spin-svg">
                  <defs>
                    <path id="hSpinPath" d="M 65,65 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" fill="none" />
                  </defs>
                  <text><textPath href="#hSpinPath">GLAMIO BEAUTY · BOOK NOW · GLAMIO BEAUTY · BOOK NOW ·</textPath></text>
                </svg>
                <div className="h-spin-center"><ArrowRight size={18} /></div>
              </a>

              {/* Floating rating card */}
              <div className="h-float-card h-float-card--top">
                <div className="h-float-icon"><Star size={14} fill="#FFD700" color="#FFD700" /></div>
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

              <div className="h-img-tag h-img-tag--1">💇 Hair</div>
              <div className="h-img-tag h-img-tag--2">💅 Nails</div>
            </div>
          </div>

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
