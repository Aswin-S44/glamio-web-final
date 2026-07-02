import React, { useEffect, useRef } from "react";
import "./GlamCTA.css";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import salonImg from '../../components/Media/Images/review.jpg';

const FEATURES = [
  "Handpicked Local Partners: Access services from our premium beauty parlours.",
  "Clear Pricing & Feedback: Make confident decisions with upfront costs and real customer reviews.",
  "Mobile App Convenience: Manage your beauty schedule instantly from anywhere via our app.",
  "Easy Rescheduling: Adjust or cancel your appointments online with no hassle.",
  "Verified Professional Care: Trust in the skilled hands of our vetted beauty experts.",
  "Location Based Search: Find the nearest available beauty care through integrated map search.",
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
            Every self-care ritual should be effortless. We bring top-rated salons,
            independent stylists, and premium wellness experts together in one seamless
            platform — giving you the freedom to book the perfect beauty service,
            anytime, anywhere.
          </p>

          <ul className="gcta__features">
            {FEATURES.map((text) => (
              <li key={text} className="gcta__feature">
                <CheckCircle size={14} />
                <span>{text}</span>
              </li>
            ))}
          </ul>

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
                alt="Radha's Salon"
                className="gcta__img"
              />
              <div className="gcta__img-overlay" />
              <div className="gcta__chip gcta__chip--br">
                <span className="gcta__live-dot" />
                <span>Open Now</span>
              </div>
              <div className="gcta__card-info">
                <strong>Radha's</strong>
              </div>
            </div>

            {/* Secondary stacked card */}
            <div className="gcta__img-card gcta__img-card--sm">
              <img
                src={salonImg}
                alt="Aura Salon"
                className="gcta__img"
              />
              <div className="gcta__img-overlay" />
              <div className="gcta__card-info">
                <strong>Aura</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default GlamCTA;
