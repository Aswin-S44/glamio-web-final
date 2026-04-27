import React, { useEffect, useRef, useState } from "react";
import "./Stats.css";

const STATS = [
  { id: "01", raw: 12,  suffix: "+", label: "Years",         desc: "Of beauty excellence" },
  { id: "02", raw: 25,  suffix: "K+",label: "Happy Clients", desc: "Across our locations" },
  { id: "03", raw: 50,  suffix: "+", label: "Expert Stylists",desc: "Certified professionals" },
  { id: "04", raw: 4.9, suffix: "",  label: "Avg Rating",    desc: "From 10k+ reviews", isDecimal: true },
];

function Counter({ raw, suffix, isDecimal, active }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = raw * eased;
      setVal(isDecimal ? current.toFixed(1) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [active, raw, isDecimal]);

  return (
    <span className="st-num">
      {val}{suffix}
    </span>
  );
}

function Stats() {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="st-section" ref={ref}>
      {/* Background decorations */}
      <div className="st-bg-ring st-bg-ring-1" />
      <div className="st-bg-ring st-bg-ring-2" />
      <div className="st-grid-lines" />
      <span className="st-deco st-deco-1" aria-hidden="true">✦</span>
      <span className="st-deco st-deco-2" aria-hidden="true">✦</span>

      <div className="st-inner">
        {/* Section label */}
        <div className="st-label">
          <div className="st-label-line" />
          <span>Numbers that speak</span>
          <div className="st-label-line" />
        </div>

        <h2 className="st-headline">
          Trust Built on<br />
          <em>Real Results</em>
        </h2>

        {/* Stats grid */}
        <div className="st-grid">
          {STATS.map((stat) => (
            <div key={stat.id} className="st-card">
              {/* 3D shimmer layer */}
              <div className="st-card__shine" />

              <div className="st-card__top">
                <span className="st-card__id">{stat.id}</span>
                <div className="st-card__bar" />
              </div>

              <div className="st-card__value">
                <Counter raw={stat.raw} suffix={stat.suffix} isDecimal={stat.isDecimal} active={active} />
              </div>

              <div className="st-card__body">
                <h3 className="st-card__label">{stat.label}</h3>
                <p className="st-card__desc">{stat.desc}</p>
              </div>

              {/* Corner glow on hover */}
              <div className="st-card__glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
