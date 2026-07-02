import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ArrowRight, Trash2 } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { DEFAULT_NO_IMAGE } from "../../constants/urls";
import { buildShopUrl } from "../../utils/shopUrl.util";
import {
  getWishlist,
  removeFromWishlist,
  WISHLIST_EVENT,
} from "../../utils/wishlist.util";
import "./WishlistScreen.css";

export default function WishlistScreen() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  const refresh = useCallback(() => setWishlist(getWishlist()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(WISHLIST_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const handleRemove = (e, shopId) => {
    e.stopPropagation();
    removeFromWishlist(shopId);
  };

  return (
    <div className="wishlist-page">
      <Header />

      <div className="wishlist-hero">
        <div className="wishlist-hero-inner">
          <span className="wishlist-hero-tag">
            <Heart size={14} /> Wishlist
          </span>
          <h1>Your Saved Salons</h1>
          <p>Quick access to the salons you've bookmarked for later</p>
        </div>
      </div>

      <div className="wishlist-body">
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <Heart size={56} />
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon on any salon to save it here for later.</p>
            <button className="btn" onClick={() => navigate("/shops")}>
              Explore Salons <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((shop) => (
              <div
                key={shop.id}
                className="wishlist-card"
                onClick={() => navigate(buildShopUrl(shop))}
              >
                <div className="wishlist-card-img-wrap">
                  <img
                    src={shop.shopImage || DEFAULT_NO_IMAGE}
                    alt={shop.parlourName}
                    onError={(e) => {
                      e.target.src = DEFAULT_NO_IMAGE;
                    }}
                  />
                  <button
                    className="wishlist-remove-btn"
                    onClick={(e) => handleRemove(e, shop.id)}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="wishlist-card-body">
                  <h3>{shop.parlourName}</h3>
                  {shop.address && (
                    <div className="wishlist-card-addr">
                      <MapPin size={13} />
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {shop.totalRating != null && (
                    <div className="wishlist-card-rating">
                      <Star size={13} fill="#FFD700" color="#FFD700" />
                      <span>{Number(shop.totalRating).toFixed(1)}</span>
                    </div>
                  )}
                  <button
                    className="wishlist-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(buildShopUrl(shop));
                    }}
                  >
                    View Salon <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
