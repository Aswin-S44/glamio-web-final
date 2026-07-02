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
  Clock,
  ChevronLeft,
  ChevronRight,
  Scissors,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NearByShops.css";
import Header from "../../components/Header/Header";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { buildShopUrl } from "../../utils/shopUrl.util";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export default function NearByShops() {
  const navigate = useNavigate();

  const [userLoc, setUserLoc] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [permErr, setPermErr] = useState(false);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);

  const mapRef = useRef(null);
  const scrollRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    (async () => {
      try {
        setFetchError("");
        const res = await fetch(`${BASE_URL}/customer/shops`);

        if (!res.ok) {
          throw new Error("Failed to load nearby shops");
        }

        const data = await res.json();
        const shopsArray = data.shops || [];

        const transformedShops = shopsArray.map((shop) => ({
          shop: shop,
          user: shop.user,
          distance: null,
          shopData: shop,
        }));

        setShops(transformedShops);
      } catch (err) {
        setShops([]);
        setFetchError(err.message || "Failed to load nearby shops");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermErr(true);
      setLoading(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        const newUserLoc = { lat: latitude, lng: longitude };
        setUserLoc(newUserLoc);
        setMapCenter(newUserLoc);

        setShops((prev) =>
          prev.map((item) => {
            const lat = parseFloat(item.shop?.latitude);
            const lng = parseFloat(item.shop?.longitude);
            if (
              lat &&
              lng &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat !== 0 &&
              lng !== 0
            ) {
              return {
                ...item,
                distance: haversine(latitude, longitude, lat, lng),
              };
            }
            return { ...item, distance: null };
          })
        );
      },
      (error) => {
        console.error("Geolocation error:", error);
        setPermErr(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const validShops = useMemo(() => {
    return shops.filter((item) => {
      const lat = parseFloat(item.shop?.latitude);
      const lng = parseFloat(item.shop?.longitude);
      return (
        Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
      );
    });
  }, [shops]);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = validShops;

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.shop?.parlourName?.toLowerCase().includes(q) ||
          false ||
          item.shop?.address?.toLowerCase().includes(q) ||
          false
      );
    }

    return [...filtered].sort((a, b) => {
      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    });
  }, [validShops, query]);

  const focusShop = (item) => {
    if (mapRef.current) {
      const lat = parseFloat(item.shop.latitude);
      const lng = parseFloat(item.shop.longitude);
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
    setSelected(item);
  };

  const scrollCards = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const openDirections = (item) => {
    const dest = `${item.shop.latitude},${item.shop.longitude}`;
    const origin = userLoc ? `${userLoc.lat},${userLoc.lng}` : "";
    window.open(`https://www.google.com/maps/dir/${origin}/${dest}`, "_blank");
  };

  if (permErr) {
    return (
      <div className="nb-error">
        <AlertTriangle size={48} className="nb-error-icon" />
        <h3>Location Access Required</h3>
        <p>
          Please enable location services to discover nearby beauty parlours.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="nb-retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  const showLoading = !isLoaded || !userLoc || loading;

  return (
    <div className="nb-root">
      <Header />

      {showLoading ? (
        <div className="nb-loading">
          <div className="nb-loading-ring">
            <Loader2 size={32} className="nb-spin" />
          </div>
          <p>
            {!isLoaded
              ? "Loading maps..."
              : !userLoc
              ? "Getting your location..."
              : "Loading shops..."}
          </p>
        </div>
      ) : (
        <div className="nb-map-wrap">
          <GoogleMap
            mapContainerClassName="nb-map"
            center={mapCenter || userLoc}
            zoom={mapZoom}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              zoomControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
              },
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {userLoc && (
              <Marker
                position={userLoc}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(42, 42),
                }}
              />
            )}

            {displayed.map((item) => {
              const lat = parseFloat(item.shop.latitude);
              const lng = parseFloat(item.shop.longitude);
              return (
                <Marker
                  key={item.shop.id}
                  position={{ lat, lng }}
                  onClick={() => focusShop(item)}
                  icon={{
                    url: `https://maps.google.com/mapfiles/ms/icons/${
                      selected?.shop.id === item.shop.id ? "red" : "pink"
                    }-dot.png`,
                    scaledSize: new window.google.maps.Size(38, 38),
                  }}
                />
              );
            })}

            {selected && (
              <InfoWindow
                position={{
                  lat: parseFloat(selected.shop.latitude),
                  lng: parseFloat(selected.shop.longitude),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="nb-infowin">
                  <img
                    src={selected.user?.profileImage || DEFAULT_NO_IMAGE}
                    alt={selected.shop.parlourName}
                    className="nb-infowin-img"
                    onError={(e) => {
                      e.target.src = DEFAULT_NO_IMAGE;
                    }}
                  />
                  <div className="nb-infowin-body">
                    <h4>{selected.shop.parlourName}</h4>
                    <p>{selected.shop.address?.slice(0, 48)}</p>
                    <div className="nb-infowin-meta">
                      <Star size={12} fill="#FFD700" color="#FFD700" />
                      <span>{selected.shop.totalRating || 5}</span>
                      {selected.distance != null && (
                        <span className="nb-infowin-dist">
                          . {selected.distance} km
                        </span>
                      )}
                    </div>
                    <button
                      className="nb-infowin-btn"
                      onClick={() => navigate(buildShopUrl(selected.shop))}
                    >
                      View Details <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          <div className="nb-search-wrap">
            <div className={`nb-search ${query ? "has-value" : ""}`}>
              <Search size={17} className="nb-search-icon" />
              <input
                type="text"
                placeholder="Search parlours or areas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="nb-clear" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <button
            className="nb-locate-fab"
            onClick={() => {
              if (userLoc && mapRef.current) {
                mapRef.current.panTo(userLoc);
                mapRef.current.setZoom(15);
              }
            }}
            title="Centre on my location"
          >
            <Navigation size={20} />
          </button>

          <div className={`nb-panel ${panelOpen ? "open" : "closed"}`}>
            <div
              className="nb-panel-head"
              onClick={() => setPanelOpen((open) => !open)}
            >
              <div className="nb-handle" />
              <div className="nb-panel-title">
                <Scissors size={15} />
                <span>Nearby Parlours</span>
                <span className="nb-count">{displayed.length}</span>
              </div>
              <button className="nb-toggle-icon">
                {panelOpen ? (
                  <ChevronRight
                    size={18}
                    style={{ transform: "rotate(90deg)" }}
                  />
                ) : (
                  <ChevronLeft
                    size={18}
                    style={{ transform: "rotate(90deg)" }}
                  />
                )}
              </button>
            </div>

            {panelOpen && (
              <div className="nb-cards-area">
                {loading ? (
                  <div className="nb-scroll">
                    {[1, 2, 3].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : fetchError ? (
                  <div className="nb-no-results">
                    <AlertTriangle size={32} />
                    <p>{fetchError}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="nb-no-results">
                    <MapPin size={32} />
                    <p>
                      {query
                        ? "No parlours match your search"
                        : "No parlours available nearby"}
                    </p>
                  </div>
                ) : (
                  <>
                    {displayed.length > 2 && (
                      <button
                        className="nb-scroll-btn nb-scroll-left"
                        onClick={() => scrollCards(-1)}
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="nb-scroll" ref={scrollRef}>
                      {displayed.map((item) => (
                        <ShopCard
                          key={item.shop.id}
                          item={item}
                          active={selected?.shop.id === item.shop.id}
                          onClick={() => focusShop(item)}
                          onView={() => navigate(buildShopUrl(item.shop))}
                          onDirections={() => openDirections(item)}
                        />
                      ))}
                    </div>
                    {displayed.length > 2 && (
                      <button
                        className="nb-scroll-btn nb-scroll-right"
                        onClick={() => scrollCards(1)}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShopCard({ item, active, onClick, onView, onDirections }) {
  const img = item.user?.profileImage || DEFAULT_NO_IMAGE;
  const name = item.shop?.parlourName || "Unknown Shop";
  const addr = item.shop?.address || "Address not available";

  const rating = item.shop?.totalRating || 5;
  const dist = item.distance;

  return (
    <div
      className={`nb-card ${active ? "nb-card-active" : ""}`}
      onClick={onClick}
    >
      <div className="nb-card-img-wrap">
        <img
          src={img}
          alt={name}
          onError={(e) => {
            e.target.src = DEFAULT_NO_IMAGE;
          }}
        />
        <span className="nb-card-rating">
          <Star size={11} fill="#FFD700" color="#FFD700" /> {rating}
        </span>
      </div>

      <div className="nb-card-body">
        <h4 className="nb-card-name">{name}</h4>

        <div className="nb-card-addr">
          <MapPin size={11} />
          <span>
            {addr?.slice(0, 60)}
            {addr?.length > 60 ? "..." : ""}
          </span>
        </div>

        <div className="nb-card-meta">
          {dist != null && dist !== Infinity && (
            <span className="nb-meta-pill">
              <Navigation size={10} /> {dist} km
            </span>
          )}
          <span className="nb-meta-pill">
            <Clock size={10} /> Open
          </span>
        </div>

        <div className="nb-card-actions">
          <button
            className="nb-btn-dir"
            onClick={(e) => {
              e.stopPropagation();
              onDirections();
            }}
          >
            <Navigation size={13} /> Directions
          </button>
          <button
            className="nb-btn-view"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            Book Now <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="nb-card nb-card-skeleton">
      <div className="nb-skel nb-skel-img" />
      <div className="nb-card-body">
        <div className="nb-skel nb-skel-line" />
        <div className="nb-skel nb-skel-line nb-skel-short" />
        <div className="nb-skel nb-skel-line nb-skel-tiny" />
      </div>
    </div>
  );
}
