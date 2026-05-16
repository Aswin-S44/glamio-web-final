import React, { useEffect, useRef } from "react";
import "./WhyChooseUs.css";
import { Sparkles } from "lucide-react";

const CARDS = [
  {
    cls: "premium",
    img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80",
    num: "01",
    title: "Premium Products",
    desc: "We use only high-end organic and dermatologist-approved products for your skin and hair.",
  },
  {
    cls: "expert",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80",
    num: "02",
    title: "Expert Stylists",
    desc: "Certified professionals with years of luxury salon experience and a sharp artistic vision.",
  },
  {
    cls: "ambience",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80",
    num: "03",
    title: "Luxury Ambience",
    desc: "Relax in a calm, hygienic, and beautifully designed space tailored for pure comfort.",
  },
  {
    cls: "care",
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80",
    num: "04",
    title: "Personalised Care",
    desc: "Every treatment is tailored to your unique skin and hair type for stunning results.",
  },
];

function WhyChooseUs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".why-card");
            cards.forEach((card, i) => {
              setTimeout(() => card.classList.add("why-card--visible"), i * 130);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="why-section" ref={sectionRef}>
      {/* Decorative top */}
      <div className="why-deco-1" aria-hidden="true">✦</div>
      <div className="why-deco-2" aria-hidden="true">✦</div>

      <div className="why-container">
        <div className="header-stack">
          <span className="sub-title">
            <Sparkles size={12} />
            Why Choose Us
          </span>
          <h2 className="title">Experience Excellence</h2>
          <p className="why-lead">
            Four pillars of beauty that set Orucom apart from the rest.
          </p>
        </div>

        <div className="why-grid">
          {CARDS.map((card) => (
            <div className="why-card" key={card.num}>
              <div className="card-inner">
                <div className={`why-icon ${card.cls}`}>
                  <img src={card.img} alt={card.title} />
                  <div className="why-icon-overlay" />
                </div>
                <div className="why-card-content">
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
                <div className="card-number">{card.num}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
