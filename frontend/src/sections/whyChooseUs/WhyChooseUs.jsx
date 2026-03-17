import React from "react";
import "./WhyChooseUs.css";

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-bg-accent"></div>
      <div className="why-container">
        <div className="header-stack">
          <span className="sub-title">Our Excellence</span>
          <h2 className="title">Why Choose Us</h2>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="card-inner">
              <div className="why-icon premium"></div>
              <h3>Premium Products</h3>
              <p>
                We use only high-end organic and dermatologist-approved products
                for your skin.
              </p>
              <div className="card-number">01</div>
            </div>
          </div>

          <div className="why-card">
            <div className="card-inner">
              <div className="why-icon expert"></div>
              <h3>Expert Stylists</h3>
              <p>
                Certified professionals with years of luxury salon experience
                and artistic vision.
              </p>
              <div className="card-number">02</div>
            </div>
          </div>

          <div className="why-card">
            <div className="card-inner">
              <div className="why-icon ambience"></div>
              <h3>Luxury Ambience</h3>
              <p>
                Relax in a calm, hygienic, and beautifully designed environment
                tailored for comfort.
              </p>
              <div className="card-number">03</div>
            </div>
          </div>

          <div className="why-card">
            <div className="card-inner">
              <div className="why-icon care"></div>
              <h3>Personal Care</h3>
              <p>
                Every treatment is customized for your unique skin and hair type
                requirements.
              </p>
              <div className="card-number">04</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
