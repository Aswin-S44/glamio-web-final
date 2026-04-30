import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  Search, MapPin, Star, Loader2, Navigation,
  X, Heart, Phone, Clock, ChevronLeft, ChevronRight,
  Scissors, ArrowRight, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NearByShops.css";
import Header from "../../components/Header/Header";
import { BASE_URL } from "../../constants/urls";

/* ── dummy data ── */
const DUMMY = [
  {
    shop: { id: 1, parlourName: "Glamour Studio", address: "12, MG Road, Bangalore",
      latitude: "12.9716", longitude: "77.5946", totalRating: 4.8 },
    user: { profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300" },
    distance: 0.8,
  },
  {
    shop: { id: 2, parlourName: "Velvet Beauty Lounge", address: "45, Indiranagar, Bangalore",
      latitude: "12.9784", longitude: "77.6408", totalRating: 4.6 },
    user: { profileImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300" },
    distance: 1.4,
  },
  {
    shop: { id: 3, parlourName: "The Glow Lab", address: "8, Koramangala, Bangalore",
      latitude: "12.9352", longitude: "77.6245", totalRating: 4.9 },
    user: { profileImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300" },
    distance: 2.1,
  },
];

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

  const [userLoc,    setUserLoc]    = useState(null);
  const [shops,      setShops]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [permErr,    setPermErr]    = useState(false);
  const [query,      setQuery]      = useState("");
  const [panelOpen,  setPanelOpen]  = useState(true);

  const mapRef      = useRef(null);
  const scrollRef   = useRef(null);

  /* ── Google Maps ── */
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      "AIzaSyBOKng2fU2So-ep_9fPWQq3cq5lKVtq5BY",
  });

  /* ── Fetch shops ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/customer/shops`);
        const data = await res.json();
        const list = data.shops || [];
        setShops(list.length > 0 ? list : DUMMY);
      } catch {
        setShops(DUMMY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Geolocation ── */
  useEffect(() => {
    if (!navigator.geolocation) { setPermErr(true); return; }
    const id = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLoc({ lat: latitude, lng: longitude });
        setShops(prev =>
          prev.map(item => ({
            ...item,
            distance: haversine(
              latitude, longitude,
              parseFloat(item.shop.latitude),
              parseFloat(item.shop.longitude)
            ),
          }))
        );
      },
      () => setPermErr(true),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* ── Filtered + sorted ── */
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...shops]
      .filter(item =>
        !q ||
        item.shop.parlourName.toLowerCase().includes(q) ||
        item.shop.address.toLowerCase().includes(q)
      )
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [shops, query]);

  /* ── Actions ── */
  const focusShop = (item) => {
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(item.shop.latitude),
        lng: parseFloat(item.shop.longitude),
      });
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

  /* ── Permission error screen ── */
  if (permErr) {
    return (
      <div className="nb-error">
        <AlertTriangle size={48} className="nb-error-icon" />
        <h3>Location Access Required</h3>
        <p>Please enable location services to discover nearby beauty parlours.</p>
        <button onClick={() => window.location.reload()} className="nb-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  /* ── Loading screen ── */
  const showLoading = !isLoaded || !userLoc;

  return (
    <div className="nb-root">
      <Header />

      {showLoading ? (
        <div className="nb-loading">
          <div className="nb-loading-ring">
            <Loader2 size={32} className="nb-spin" />
          </div>
          <p>{!isLoaded ? "Loading maps…" : "Getting your location…"}</p>
        </div>
      ) : (
        <div className="nb-map-wrap">
          {/* ── Full-screen map ── */}
          <GoogleMap
            mapContainerClassName="nb-map"
            center={userLoc}
            zoom={14}
            onLoad={m => (mapRef.current = m)}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              zoomControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
              },
              styles: [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
              ],
            }}
          >
            {/* User dot */}
            <Marker
              position={userLoc}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(42, 42),
              }}
            />

            {/* Shop markers */}
            {displayed.map(item => (
              <Marker
                key={item.shop.id}
                position={{
                  lat: parseFloat(item.shop.latitude),
                  lng: parseFloat(item.shop.longitude),
                }}
                onClick={() => focusShop(item)}
                icon={{
                  url: `https://maps.google.com/mapfiles/ms/icons/${
                    selected?.shop.id === item.shop.id ? "red" : "pink"
                  }-dot.png`,
                  scaledSize: new window.google.maps.Size(38, 38),
                }}
              />
            ))}

            {/* Info window */}
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
                    src={
                      selected.user?.profileImage ||
                      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=80"
                    }
                    alt={selected.shop.parlourName}
                    className="nb-infowin-img"
                  />
                  <div className="nb-infowin-body">
                    <h4>{selected.shop.parlourName}</h4>
                    <p>{selected.shop.address?.slice(0, 48)}</p>
                    <div className="nb-infowin-meta">
                      <Star size={12} fill="#FFD700" color="#FFD700" />
                      <span>{selected.shop.totalRating || 4.5}</span>
                      {selected.distance && (
                        <span className="nb-infowin-dist">· {selected.distance} km</span>
                      )}
                    </div>
                    <button
                      className="nb-infowin-btn"
                      onClick={() => navigate(`/parlour/${selected.shop.id}`)}
                    >
                      View Details <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* ── Search bar (floating, top) ── */}
          <div className="nb-search-wrap">
            <div className={`nb-search ${query ? "has-value" : ""}`}>
              <Search size={17} className="nb-search-icon" />
              <input
                type="text"
                placeholder="Search parlours or areas…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="nb-clear" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Locate-me FAB ── */}
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

          {/* ── Bottom panel ── */}
          <div className={`nb-panel ${panelOpen ? "open" : "closed"}`}>
            {/* handle + header row */}
            <div className="nb-panel-head" onClick={() => setPanelOpen(p => !p)}>
              <div className="nb-handle" />
              <div className="nb-panel-title">
                <Scissors size={15} />
                <span>Nearby Parlours</span>
                <span className="nb-count">{displayed.length}</span>
              </div>
              <button className="nb-toggle-icon">
                {panelOpen ? <ChevronRight size={18} style={{ transform: "rotate(90deg)" }} />
                           : <ChevronLeft size={18} style={{ transform: "rotate(90deg)" }} />}
              </button>
            </div>

            {/* card strip */}
            {panelOpen && (
              <div className="nb-cards-area">
                {loading ? (
                  <div className="nb-scroll">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="nb-no-results">
                    <MapPin size={32} />
                    <p>No parlours match your search</p>
                  </div>
                ) : (
                  <>
                    {displayed.length > 2 && (
                      <button className="nb-scroll-btn nb-scroll-left" onClick={() => scrollCards(-1)}>
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="nb-scroll" ref={scrollRef}>
                      {displayed.map(item => (
                        <ShopCard
                          key={item.shop.id}
                          item={item}
                          active={selected?.shop.id === item.shop.id}
                          onClick={() => focusShop(item)}
                          onView={() => navigate(`/parlour/${item.shop.id}`)}
                          onDirections={() => openDirections(item)}
                        />
                      ))}
                    </div>
                    {displayed.length > 2 && (
                      <button className="nb-scroll-btn nb-scroll-right" onClick={() => scrollCards(1)}>
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

/* ── Shop card ── */
function ShopCard({ item, active, onClick, onView, onDirections }) {
  const img   = item.user?.profileImage || "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300";
  const name  = item.shop.parlourName;
  const addr  = item.shop.address;
  const rating= item.shop.totalRating || 4.5;
  const dist  = item.distance;

  return (
    <div className={`nb-card ${active ? "nb-card-active" : ""}`} onClick={onClick}>
      <div className="nb-card-img-wrap">
        <img src={img} alt={name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300"; }} />
        <span className="nb-card-rating">
          <Star size={11} fill="#FFD700" color="#FFD700" /> {rating}
        </span>
      </div>

      <div className="nb-card-body">
        <h4 className="nb-card-name">{name}</h4>

        <div className="nb-card-addr">
          <MapPin size={11} />
          <span>{addr?.slice(0, 60)}{addr?.length > 60 ? "…" : ""}</span>
        </div>

        <div className="nb-card-meta">
          {dist != null && (
            <span className="nb-meta-pill">
              <Navigation size={10} /> {dist} km
            </span>
          )}
          <span className="nb-meta-pill">
            <Clock size={10} /> Open
          </span>
        </div>

        <div className="nb-card-actions">
          <button className="nb-btn-dir" onClick={e => { e.stopPropagation(); onDirections(); }}>
            <Navigation size={13} /> Directions
          </button>
          <button className="nb-btn-view" onClick={e => { e.stopPropagation(); onView(); }}>
            Book Now <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton card ── */
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
