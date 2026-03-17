import React from "react";
import "./Banner.css";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Star,
  Award,
  ShieldCheck,
} from "lucide-react";

function Banner() {
  return (
    <section className="hero-banner">
      {/* Visual Background with Anti-Flicker Fix */}
      <div className="hero-visual-wrapper">
        <div className="hero-image-luxury"></div>
        <div className="hero-overlay-curtain"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content-box">
          <div className="hero-top-badge">
            <Sparkles size={14} className="icon-pink" />
            <span>The Gold Standard of Beauty</span>
          </div>

          <h1 className="hero-display-title">
            Your Beauty, <br />
            <span className="cursive-text">Our Masterpiece.</span>
          </h1>

          <p className="hero-subtitle">
            Experience the pinnacle of luxury hair and skin treatments. Tailored
            artistry designed to make you shine from within.
          </p>

          <div className="hero-cta-row">
            <button className="glam-btn-solid">
              Schedule Appointment <Calendar size={18} />
            </button>
            <button className="glam-btn-outline">Explore Services</button>
          </div>

          <div className="hero-social-proof">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill="var(--primary)"
                  color="var(--primary)"
                />
              ))}
            </div>
            <span className="proof-text">
              Loved by 5,000+ glamorous clients
            </span>
          </div>
        </div>

        {/* Floating Interactive Badge */}
        <div className="hero-floating-card">
          <div className="glass-inner">
            <div className="badge-icon-box">
              <ShieldCheck size={24} color="var(--primary)" />
            </div>
            <div className="badge-text">
              <h4>Safety First</h4>
              <p>100% Organic Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Decorative Element */}
      <div className="hero-side-branding">
        <div className="side-line"></div>
        <span className="side-text">GLAMOUR EST. 2024</span>
      </div>
    </section>
  );
}

export default Banner;
