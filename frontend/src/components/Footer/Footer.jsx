import React from "react";
import "./Footer.css";
import { ArrowRight, Sparkles, ChevronUp, Shield, Award, Star } from "lucide-react";

const DISCOVER = [
  { label: "Home", href: "/" },
  { label: "All Salons", href: "/shops" },
  { label: "Near Me", href: "/nearby" },
  { label: "Book Now", href: "/shops" },
];

const SERVICES = [
  { label: "Hair Styling & Cuts", href: "/services" },
  { label: "Bridal Makeover", href: "/services" },
  { label: "Skin Treatments", href: "/services" },
  { label: "Nail Art & Extensions", href: "/services" },
  { label: "Makeup & Beauty", href: "/services" },
  { label: "Hair Spa & Coloring", href: "/services" },
];

const COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

function Footer() {
  return (
    <footer className="gf">
      {/* Top accent */}
      <div className="gf__accent" />

      <div className="gf__container">
        <div className="gf__grid">

          {/* ── Brand ── */}
          <div className="gf__brand">
            <div className="gf__logo">
              <div className="gf__logo-icon">
                <Sparkles size={17} />
              </div>
              <span className="gf__logo-text">GLAM<em>IO</em></span>
            </div>

            <p className="gf__brand-desc">
              Glamio connects you with the finest beauty salons in Kerala.
              Premium experiences, expert hands, unforgettable results —
              all bookable in seconds.
            </p>

            <div className="gf__trust">
              <div className="gf__trust-item">
                <Shield size={13} /> <span>Verified Salons</span>
              </div>
              <div className="gf__trust-item">
                <Award size={13} /> <span>Top Rated</span>
              </div>
              <div className="gf__trust-item">
                <Star size={13} fill="#FFD700" color="#FFD700" />
                <span>4.9 / 5.0</span>
              </div>
            </div>

            <div className="gf__social">
              {/* Instagram */}
              <a href="#" className="gf__social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="gf__social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="gf__social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="gf__social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Discover ── */}
          <div className="gf__col">
            <h5 className="gf__col-title">Discover</h5>
            <ul className="gf__links">
              {DISCOVER.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="gf__link">
                    <ArrowRight size={11} /> {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Services ── */}
          <div className="gf__col">
            <h5 className="gf__col-title">Services</h5>
            <ul className="gf__links">
              {SERVICES.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="gf__link">
                    <ArrowRight size={11} /> {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company + App ── */}
          <div className="gf__col">
            <h5 className="gf__col-title">Company</h5>
            <ul className="gf__links">
              {COMPANY.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="gf__link">
                    <ArrowRight size={11} /> {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="gf__apps">
              <p className="gf__apps-label">Book on the Go</p>
              <a href="#" className="gf__app-btn">
                <svg viewBox="0 0 512 512" width="18" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-10.3 18-28.5-1.2-40.8zM325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z" />
                </svg>
                <div>
                  <span>GET IT ON</span>
                  <strong>Google Play</strong>
                </div>
              </a>
              <a href="#" className="gf__app-btn">
                <svg viewBox="0 0 384 512" width="16" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <div>
                  <span>DOWNLOAD ON</span>
                  <strong>App Store</strong>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="gf__bottom">
          <p className="gf__copy">
            &copy; 2025 Glamio Beauty Platform · All rights reserved ·
            <span>Made with ✦ in Kerala, India</span>
          </p>
          <div className="gf__legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookies</a>
          </div>
          <button className="gf__top-btn" onClick={scrollTop} aria-label="Back to top">
            <ChevronUp size={17} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
