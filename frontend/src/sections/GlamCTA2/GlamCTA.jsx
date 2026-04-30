import React, { useEffect, useRef } from "react";
import "./GlamCTA.css";
import { ArrowRight, Sparkles, CheckCircle, Star, Award } from "lucide-react";
import salonImg from '../../components/Media/Images/review.jpg';

const FEATURES = [
  "Premium organic & dermatologist-approved products",
  "Certified expert stylists with 10+ years experience",
  "Instant online booking — zero wait time",
  "Free cancellation & flexible rescheduling",
  "Bridal, event & group packages available",
  "Hygienic luxury ambience at both locations",
];

function GlamCTA() {
  const cardRef    = useRef(null);
  const sectionRef = useRef(null);

  /* GSAP-style scroll reveal */
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll("[data-anim]");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("anim-in"); obs.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* 3D mouse-tilt on image card stack */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
    };
    const onLeave = () => {
      card.style.transform = `perspective(800px) rotateY(8deg) rotateX(-4deg)`;
    };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="gcta" ref={sectionRef}>
      {/* Ambient glows */}
      <div className="gcta__glow gcta__glow-1" />
      <div className="gcta__glow gcta__glow-2" />
      <div className="gcta__lines" />

      {/* Decorative sparkles */}
      <span className="gcta__deco gcta__deco-1" aria-hidden="true">✦</span>
      <span className="gcta__deco gcta__deco-2" aria-hidden="true">✦</span>

      <div className="gcta__inner">

        {/* ─── LEFT: text ─── */}
        <div className="gcta__left" data-anim="fade-left" style={{ "--d": "0s" }}>
          <div className="gcta__eyebrow">
            <Sparkles size={12} />
            <span>The Orucom Experience</span>
          </div>

          <h2 className="gcta__title">
            Why Thousands<br />
            <em>Choose Orucom</em>
          </h2>

          <p className="gcta__desc">
            Every visit is a bespoke journey. We blend cutting-edge techniques
            with time-honoured care to deliver results that speak for themselves.
          </p>

          <ul className="gcta__features">
            {FEATURES.map((text) => (
              <li key={text} className="gcta__feature">
                <CheckCircle size={14} />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="gcta__rating">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={15} fill="#FFD700" color="#FFD700" />
            ))}
            <span><strong>4.9 / 5</strong> · 2,400+ reviews</span>
          </div>

          <a href="/shops" className="gcta__btn">
            Book Your Session <ArrowRight size={16} />
          </a>
        </div>

        {/* ─── RIGHT: 3D stacked cards ─── */}
        <div className="gcta__right" data-anim="fade-right" style={{ "--d": ".22s" }}>
          <div className="gcta__card-3d" ref={cardRef}>
            {/* Depth planes */}
            <div className="gcta__plane gcta__plane-1" />
            <div className="gcta__plane gcta__plane-2" />

            {/* Primary image card */}
            <div className="gcta__img-card gcta__img-card--main">
              <img
                src={salonImg}
                alt="Elite Beauty Lounge"
                className="gcta__img"
              />
              <div className="gcta__img-overlay" />
              <div className="gcta__chip gcta__chip--tl">
                <Star size={11} fill="#FFD700" color="#FFD700" />
                <span>4.9 Rating</span>
              </div>
              <div className="gcta__chip gcta__chip--br">
                <span className="gcta__live-dot" />
                <span>Open Now</span>
              </div>
              <div className="gcta__card-info">
                <strong>Elite Beauty Lounge</strong>
                <span>Manjeri, Kerala</span>
              </div>
            </div>

            {/* Secondary stacked card */}
            <div className="gcta__img-card gcta__img-card--sm">
              <img
                src={salonImg}
                alt="Royal Touch Salon"
                className="gcta__img"
              />
              <div className="gcta__img-overlay" />
              <div className="gcta__card-info">
                <strong>Royal Touch</strong>
                <span>Kondotty</span>
              </div>
            </div>
          </div>

          {/* Award floating badge */}
          <div className="gcta__award" data-anim="scale-in" style={{ "--d": ".5s" }}>
            <Award size={20} />
            <div>
              <strong>#1 Salon</strong>
              <span>Kerala 2024</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default GlamCTA;
