import React, { useEffect, useRef } from "react";
import "./GlamCTA.css";
import { ArrowRight, Sparkles, Phone } from "lucide-react";
import img from '../../components/Media/Images/model-with-smokey-eyes-golden-circle-earrings (1).webp'

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
            <span>Experience Orucom</span>
          </div>

          <h2 className="gcta__heading">
            Book
            <em>Your</em><br />
            Glow.
          </h2>

          <p className="gcta__desc" style={{color:"black"}}>
            Discover top-rated salons and independent stylists near you.
            Choose your service, pick your slot, and book instantly —
            all in one place.
          </p>

          {/* <div className="gcta__info">
            <div className="gcta__info-item">
              <Phone size={14} />
              <span>+91 94470 12345</span>
            </div>
          </div> */}

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
              src={img}
              alt="Orucom Salon Experience"
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
                  ORUCOM · BOOK 24/7 · BOOK NOW · ORUCOM · BOOK 24/7 ·
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
              src={img}
              alt="treatment preview"
            />
            <div className="gcta__product-ring" />
            <span className="gcta__product-label">
              <Sparkles size={10} />
              
            </span>
          </div>
        </div>

        {/* ─── RIGHT details ─── */}
        <div className="gcta__right">
          <div className="gcta__open-strip">
            <span className="gcta__open-dot" />
            <p className="gcta__open-time">Book 24/7</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GlamCTA;
