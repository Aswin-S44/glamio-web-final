import React, { useState, useEffect, useRef } from "react";
import "./FAQ.css";
import { Plus, Minus, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "How do I book an appointment through Orucom?",
    a: "Booking is simple — browse our featured salons like Radha's and Aura, choose a service, pick your preferred slot, and confirm. You'll receive an instant booking confirmation on your account.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes! Free cancellation and flexible rescheduling are supported up to 2 hours before your appointment. Just visit your bookings page — no hidden fees, ever.",
  },
  {
    q: "What kinds of salons are listed on Orucom?",
    a: "Orucom lists verified, quality-checked beauty salons offering services like hair styling & cuts, hair spa & coloring, bridal & event makeup, skin treatments, nail art, and more.",
  },
  {
    q: "Do the salons offer bridal and group packages?",
    a: "Yes. Our partner salons offer specialised bridal and group packages. Contact the salon directly through the platform to customise your package and reserve group slots.",
  },
  {
    q: "How does Orucom verify the salons it lists?",
    a: "Every salon on Orucom goes through a verification process — we check service quality, hygiene standards, and customer feedback before a listing goes live. Only trusted salons make it through.",
  },
  {
    q: "Is Orucom free to use for customers?",
    a: "Absolutely. Orucom is completely free for customers. Browse salons, compare services, and book appointments at no extra charge — you only pay the salon for the service you receive.",
  },
];

function FAQItem({ item, index, isOpen, onToggle }) {
  const bodyRef = useRef(null);

  return (
    <div
      className={`hfaq-item${isOpen ? " hfaq-item--open" : ""}`}
      style={{ "--i": index }}
    >
      <button className="hfaq-trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span className="hfaq-q">{item.q}</span>
        <span className="hfaq-icon">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      <div
        className="hfaq-body"
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? `${bodyRef.current?.scrollHeight ?? 300}px` : "0px",
        }}
      >
        <p className="hfaq-answer">{item.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll(".hfaq-item");
    if (!items) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("hfaq-item--visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="hfaq-section" ref={sectionRef}>
      <div className="hfaq-blob hfaq-blob-1" />
      <div className="hfaq-blob hfaq-blob-2" />

      <div className="hfaq-container">
        <div className="hfaq-header">
          <div className="hfaq-eyebrow">
            <Sparkles size={12} />
            <span>Got Questions?</span>
          </div>
          <h2 className="hfaq-title">
            Frequently Asked<br />
            <em>Questions</em>
          </h2>
          <p className="hfaq-sub">
            Everything you need to know about booking through Orucom.
          </p>
        </div>

        <div className="hfaq-layout">
          <div className="hfaq-list">
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>

          <div className="hfaq-panel">
            <div className="hfaq-panel__inner">
              <div className="hfaq-panel__icon">✦</div>
              <h3 className="hfaq-panel__heading">Still have questions?</h3>
              <p className="hfaq-panel__text">
                Our team is always happy to help. Reach out to us directly and
                we'll get back to you within the hour.
              </p>
              <a href="/contact" className="hfaq-panel__btn">Contact Us</a>
              <div className="hfaq-panel__divider" />
              <div className="hfaq-panel__stat">
                <strong>2 min</strong>
                <span>Average response time</span>
              </div>
              <div className="hfaq-panel__stat">
                <strong>Mon – Sun</strong>
                <span>We're available daily</span>
              </div>
              <div className="hfaq-panel__stat">
                <strong>100%</strong>
                <span>Customer satisfaction rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
