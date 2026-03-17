import React, { useEffect, useState } from "react";
import "./Parlors.css";
import { DEFAULT_NO_IMAGE } from "../../constants/urls";

const parlorsData = [
  {
    id: 1,
    name: "Elite",
    location: "Manjeri",
    rating: 4.9,
    address: "Court Road, Manjeri, Kerala",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Royal Touch Kondotty",
    location: "Kondotty",
    rating: 4.8,
    address: "Airport Road, Kondotty",
    image:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "The Beauty Hub",
    location: "Manjeri",
    rating: 4.7,
    address: "IGBT Bus Stand, Manjeri",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Signature Glow",
    location: "Kondotty",
    rating: 4.9,
    address: "Main Junction, Kondotty",
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop",
  },
];

function Parlors() {
  const [activeTab, setActiveTab] = useState("All");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/customer/shops");
        const data = await res.json();
        if (data && data.shops) {
          setShops(data.shops);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const filteredParlors =
    activeTab === "All"
      ? parlorsData
      : parlorsData.filter((p) => p.location === activeTab);

  return (
    <section className="parlors-section">
      <div className="parlors-container">
        <div className="parlors-header">
          <span className="subtitle">Our Branches</span>
          <h2 className="title">Choose Your Location</h2>
          <div className="parlor-tabs">
            {["All", "Manjeri", "Kondotty"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="parlor-grid">
          {shops.map((parlor, index) => (
            <div
              key={parlor.id}
              className="parlor-card"
              onClick={() =>
                (window.location.href = `/parlour/${parlor?.shop?.id}`)
              }
            >
              <div className="parlor-img">
                <img
                  src={parlor?.shop?.shopImage ?? DEFAULT_NO_IMAGE}
                  alt={parlor?.shop?.parlourName}
                />
                <div className="rating">★ {parlor?.shop?.totalRating}</div>
              </div>
              <div className="parlor-details">
                {/* <span className="location-tag">{parlor.location}</span> */}
                <h3>{parlor?.shop?.parlourName}</h3>
                <p>{parlor?.shop?.address}</p>
                <button className="visit-btn">Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Parlors;
