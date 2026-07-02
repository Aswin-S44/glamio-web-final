import React, { useCallback, useEffect, useState } from "react";
import "./Services.css";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { Sparkles } from "lucide-react";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/customer/services`);
      const data = await res.json();
      if (data && data.length > 0) {
        setServices(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <section className="services-section">
      <div className="container">
        <header className="section-header">
          <span className="badge">Premium Care</span>
          <h2 className="main-title">Our Professional Services</h2>
          <div className="divider"></div>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Discovering beauty...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={36} strokeWidth={1.5} style={{ color: "#ddd", marginBottom: 12 }} />
            <p style={{ color: "#aaa", fontSize: 15 }}>No services available at the moment.</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-media">
                  <img
                    src={service?.imageUrl ?? DEFAULT_NO_IMAGE}
                    alt={service?.name}
                    loading="lazy"
                  />
                  <div className="price-overlay">{service?.rate}</div>
                </div>
                <div className="service-content">
                  <h3 className="service-name">{service?.name}</h3>
                  <p className="service-description">{service?.description}</p>
                  <button
                    className="book-button"
                    onClick={() =>
                      (window.location.href = `/parlor/${service?.shopId}/service/${service?.id}`)
                    }
                  >
                    Book Appointment
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Services;
