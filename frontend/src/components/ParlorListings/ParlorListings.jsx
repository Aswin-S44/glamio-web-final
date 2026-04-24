import React, { useState } from "react";
import { Star, MapPin, Clock, Heart, Filter, ChevronRight } from "lucide-react";

function ParlorListings({ featuredParlors, loading, onFilterClick }) {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="content-right">
        <div className="listings-header">
          <h2>Best Parlors Near You</h2>
          <button className="filter-btn" onClick={onFilterClick}>
            <Filter size={18} />
            Filter
          </button>
        </div>
        <div className="loading-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="content-right">
      <div className="listings-header">
        <h2>Best Parlors Near You</h2>
        <button className="filter-btn" onClick={onFilterClick}>
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div className="parlor-grid">
        {featuredParlors.map((parlor) => (
          <div key={parlor.id} className="parlor-card">
            <div className="parlor-image">
              <img src={parlor.image} alt={parlor.name} />
              <button
                className={`favorite-btn ${
                  favorites.includes(parlor.id) ? "active" : ""
                }`}
                onClick={() => toggleFavorite(parlor.id)}
              >
                <Heart
                  size={18}
                  fill={favorites.includes(parlor.id) ? "#D41172" : "none"}
                />
              </button>
              {parlor.open ? (
                <span className="open-badge">Open</span>
              ) : (
                <span className="closed-badge">Closed</span>
              )}
            </div>

            <div className="parlor-info">
              <div className="parlor-header">
                <h3>{parlor.name}</h3>
                <div className="rating">
                  <Star size={14} fill="#FFD700" color="#FFD700" />
                  <span>{parlor.rating}</span>
                  <span className="reviews">({parlor.reviews})</span>
                </div>
              </div>

              <div className="parlor-location">
                <MapPin size={14} />
                <span>{parlor.location}</span>
                {/* {parlor.waitTime && (
                  <span className="wait-time">
                    <Clock size={14} />
                    {parlor.waitTime} wait
                  </span>
                )} */}
              </div>

              {/* <div className="parlor-tags">
                {parlor.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                  </span>
                ))}
                <span className="price">{parlor.price}</span>
              </div> */}

              <div className="parlor-actions">
                {console.log("parlor----------------", parlor)}
                <button
                  className="book-btn"
                  onClick={() => {
                    window.location.href = `/parlour/${parlor?.id}`;
                  }}
                >
                  Book Now
                </button>
                <button className="view-btn">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="view-more-btn">
        View More Parlors
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default ParlorListings;
