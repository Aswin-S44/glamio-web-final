import React, { useState, useEffect, useRef } from "react";
import "./FAQ.css";
import { Plus, Minus, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "How do I book an appointment at Orucom?",
    a: "Booking is simple — browse our featured salons, select your preferred location (Manjeri or Kondotty), choose a service, pick your slot and confirm. You'll receive an instant booking confirmation.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes! We offer free cancellation and flexible rescheduling up to 2 hours before your appointment. Just visit your bookings page or contact us directly — no hidden fees, ever.",
  },
  {
    q: "What services do Orucom salons offer?",
    a: "We offer a full range of beauty services including hair styling & cuts, hair spa & coloring, bridal & event makeup, advanced skin treatments, nail art & extensions, eyebrow threading & lash work, and body waxing.",
  },
  {
    q: "Do you offer bridal and group packages?",
    a: "Absolutely. We specialise in bridal makeovers with dedicated packages for the bride and her party. Group bookings receive priority scheduling and exclusive package pricing. Contact us to customise your package.",
  },
  {
    q: "What are your working hours?",
    a: "Both our Manjeri and Kondotty locations are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sunday from 10:00 AM to 6:00 PM. Appointment slots fill quickly — early booking is recommended.",
  },
  {
    q: "Are the products used safe for sensitive skin?",
    a: "Yes. We exclusively use premium, organic, and dermatologist-approved products suitable for all skin and hair types including sensitive skin. Our stylists will consult you on the right products before every service.",
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
            Everything you need to know about booking and visiting Orucom.
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
