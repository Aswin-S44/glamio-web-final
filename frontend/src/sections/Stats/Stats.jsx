import React from "react";
import "./Stats.css";

function Stats() {
  const stats = [
    {
      index: "01",
      value: "12",
      symbol: "+",
      title: "Years",
      description: "Of beauty excellence",
    },
    {
      index: "02",
      value: "25k",
      symbol: "",
      title: "Happy Clients",
      description: "Across the city",
    },
    {
      index: "03",
      value: "50",
      symbol: "+",
      title: "Expert Stylists",
      description: "Certified professionals",
    },
    {
      index: "04",
      value: "4.9",
      symbol: "",
      title: "Average Rating",
      description: "From 10k+ reviews",
    },
  ];

  return (
    <section className="stats-wrapper">
      <div className="stats-inner">
        <div className="stats-headline">
          <span className="stats-eyebrow">By The Numbers</span>
          <h2>
            Beauty <span>Stats</span>
          </h2>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.index} className="stat-block">
              <div className="stat-index">{stat.index}</div>
              <div className="stat-value-wrapper">
                <span className="stat-main-value">{stat.value}</span>
                {stat.symbol && (
                  <span className="stat-symbol">{stat.symbol}</span>
                )}
              </div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <p>{stat.description}</p>
              </div>
              <div className="stat-decoration"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
