import React from "react";
import "./Stats.css";

function Stats() {
  const stats = [
    { id: "01", value: "12+", label: "Years Experience", suffix: "Expertise" },
    { id: "02", value: "25k", label: "Happy Clients", suffix: "Community" },
    {
      id: "03",
      value: "50+",
      label: "Expert Stylists",
      suffix: "Professionals",
    },
    { id: "04", value: "4.9", label: "Average Rating", suffix: "Reviews" },
  ];

  return (
    <section className="stats-experience">
      <div className="stats-bg-container">
        <img
          src={require("../../components/Media/Images/beauty-salon-with-cosmetology-equipment-anime-style.jpg")}
          alt="background"
          className="parallax-img"
        />
        <div className="stats-vignette"></div>
      </div>

      <div className="stats-content-wrapper">
        <div className="stats-intro">
          <div className="stats-line"></div>
          <span className="stats-subtitle">The Excellence</span>
          <h2 className="stats-title">
            Defining Beauty <br />
            <span>Through Numbers</span>
          </h2>
        </div>

        <div className="stats-modern-grid">
          {stats.map((item) => (
            <div key={item.id} className="stat-premium-card">
              <div className="card-number-bg">{item.id}</div>
              <div className="card-visual">
                <div className="card-dot"></div>
                <div className="card-line"></div>
              </div>
              <div className="card-info">
                <h3 className="card-value">{item.value}</h3>
                <p className="card-label">{item.label}</p>
                <span className="card-suffix">{item.suffix}</span>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
