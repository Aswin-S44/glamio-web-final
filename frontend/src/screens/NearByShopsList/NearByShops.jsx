import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  Search,
  MapPin,
  Star,
  Loader2,
  Navigation,
  X,
  Heart,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./NearByShops.css";
import Header from "../../components/Header/Header";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
};

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const NearByShops = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListVisible, setIsListVisible] = useState(true);
  const mapRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      "AIzaSyBOKng2fU2So-ep_9fPWQq3cq5lKVtq5BY",
  });

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/customer/shops"
        );
        const data = await response.json();
        setShops(data.shops || []);
      } catch (err) {
        console.error("Error fetching shops", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionError(true);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        setShops((prev) =>
          prev.map((item) => ({
            ...item,
            distance: calculateDistance(
              latitude,
              longitude,
              parseFloat(item.shop.latitude),
              parseFloat(item.shop.longitude)
            ),
          }))
        );
      },
      () => setPermissionError(true),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops;
    return shops.filter(
      (item) =>
        item.shop.parlourName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.shop.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shops, searchQuery]);

  const sortedShops = useMemo(() => {
    return [...filteredShops].sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
    );
  }, [filteredShops]);

  const centerOnShop = (shop) => {
    if (mapRef.current && shop) {
      const lat = parseFloat(shop.shop.latitude);
      const lng = parseFloat(shop.shop.longitude);
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
      setSelectedShop(shop);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (permissionError) {
    return (
      <div className="error-screen">
        <Navigation size={48} />
        <h3>Location Access Required</h3>
        <p>Please enable location services to find nearby beauty parlours.</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="nearby-page">
      <Header />
      <div className="nearby-container">
        {isLoaded && userLocation ? (
          <>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation}
              zoom={14}
              onLoad={(map) => (mapRef.current = map)}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: {
                  position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
                },
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(45, 45),
                  }}
                />
              )}

              {sortedShops.map((item) => (
                <Marker
                  key={item.shop.id}
                  position={{
                    lat: parseFloat(item.shop.latitude),
                    lng: parseFloat(item.shop.longitude),
                  }}
                  onClick={() => setSelectedShop(item)}
                  icon={{
                    url: `https://maps.google.com/mapfiles/ms/icons/${
                      selectedShop?.shop.id === item.shop.id ? "red" : "pink"
                    }-dot.png`,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              ))}

              {selectedShop && (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedShop.shop.latitude),
                    lng: parseFloat(selectedShop.shop.longitude),
                  }}
                  onCloseClick={() => setSelectedShop(null)}
                >
                  <div className="info-window">
                    <img
                      src={
                        selectedShop.user?.profileImage ||
                        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=80"
                      }
                      alt={selectedShop.shop.parlourName}
                      className="info-img"
                    />
                    <div className="info-content">
                      <h4>{selectedShop.shop.parlourName}</h4>
                      <p>{selectedShop.shop.address?.substring(0, 50)}</p>
                      <div className="info-rating">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span>{selectedShop.shop.totalRating || 4.5}</span>
                        <span className="info-distance">
                          • {selectedShop.distance} km away
                        </span>
                      </div>
                      <button
                        className="view-details-btn"
                        onClick={() =>
                          (window.location.href = `/shop/${selectedShop.shop.id}`)
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            <div className="search-header">
              <div className="search-bar-modern">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for parlours, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="clear-btn"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <button
              className="toggle-list-btn"
              onClick={() => setIsListVisible(!isListVisible)}
            >
              {isListVisible ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
              <span>{isListVisible ? "Hide" : "Show"} shops</span>
            </button>

            <div
              className={`shops-slider-container ${
                isListVisible ? "visible" : "hidden"
              }`}
            >
              <div className="slider-header">
                <h3>
                  Nearby Beauty Parlours
                  <span className="shop-count">
                    {sortedShops.length} shops found
                  </span>
                </h3>
              </div>

              {loading ? (
                <div className="shops-horizontal-scroll">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shop-card-skeleton">
                      <div className="skeleton-img"></div>
                      <div className="skeleton-details">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line small"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedShops.length === 0 ? (
                <div className="no-results">
                  <p>No parlours found matching your search</p>
                </div>
              ) : (
                <>
                  {sortedShops.length > 2 && (
                    <button className="scroll-btn left" onClick={scrollLeft}>
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <div
                    className="shops-horizontal-scroll"
                    ref={scrollContainerRef}
                  >
                    {sortedShops.map((item) => (
                      <div
                        key={item.shop.id}
                        className={`shop-card-horizontal ${
                          selectedShop?.shop.id === item.shop.id ? "active" : ""
                        }`}
                        onClick={() => centerOnShop(item)}
                      >
                        <div className="card-image-wrapper">
                          <img
                            src={
                              item.user?.profileImage ||
                              "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=150"
                            }
                            alt={item.shop.parlourName}
                            className="shop-image"
                          />
                          <button className="favorite-btn">
                            <Heart size={16} />
                          </button>
                        </div>
                        <div className="shop-info">
                          <div className="shop-header">
                            <h4 className="shop-title">
                              {item.shop.parlourName}
                            </h4>
                            <div className="rating-badge">
                              <Star size={12} fill="#FFD700" color="#FFD700" />
                              <span>{item.shop.totalRating || 4.5}</span>
                            </div>
                          </div>
                          <div className="shop-address">
                            <MapPin size={12} />
                            <span>{item.shop.address?.substring(0, 70)}</span>
                          </div>
                          <div className="shop-meta-info">
                            <div className="distance-badge">
                              <Navigation size={12} />
                              <span>
                                {item.distance
                                  ? `${item.distance} km away`
                                  : "Calculating..."}
                              </span>
                            </div>
                            <div className="time-badge">
                              <Clock size={12} />
                              <span>Open until 9 PM</span>
                            </div>
                          </div>
                          <div className="shop-actions">
                            <button className="call-btn">
                              <Phone size={14} />
                              Call
                            </button>
                            <button
                              className="direction-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = `https://www.google.com/maps/dir/${userLocation?.lat},${userLocation?.lng}/${item.shop.latitude},${item.shop.longitude}`;
                                window.open(url, "_blank");
                              }}
                            >
                              <Navigation size={14} />
                              Directions
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {sortedShops.length > 2 && (
                    <button className="scroll-btn right" onClick={scrollRight}>
                      <ChevronRight size={24} />
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              className="locate-me-btn"
              onClick={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.panTo(userLocation);
                  mapRef.current.setZoom(15);
                }
              }}
            >
              <Navigation size={20} />
            </button>
          </>
        ) : (
          <div className="loading-map">
            <Loader2 className="spinner" />
            <p>
              {!isLoaded
                ? "Loading Google Maps..."
                : "Getting your location..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearByShops;
