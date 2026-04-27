import React, { useState, useEffect, useRef } from "react";
import "./FAQ.css";
import { Plus, Minus, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "How do I book an appointment at Glamio?",
    a: "Booking is simple — browse our featured salons, select your preferred location (Manjeri or Kondotty), choose a service, pick your slot and confirm. You'll receive an instant booking confirmation.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes! We offer free cancellation and flexible rescheduling up to 2 hours before your appointment. Just visit your bookings page or contact us directly — no hidden fees, ever.",
  },
  {
    q: "What services do Glamio salons offer?",
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
      className={`faq-item${isOpen ? " faq-item--open" : ""}`}
      style={{ "--i": index }}
    >
      <button className="faq-trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span className="faq-q">{item.q}</span>
        <span className="faq-icon">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      <div
        className="faq-body"
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? `${bodyRef.current?.scrollHeight ?? 300}px` : "0px",
        }}
      >
        <p className="faq-answer">{item.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  /* Scroll-reveal for items */
  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll(".faq-item");
    if (!items) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("faq-item--visible");
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
    <section className="faq-section" ref={sectionRef}>
      {/* Soft decorative blobs */}
      <div className="faq-blob faq-blob-1" />
      <div className="faq-blob faq-blob-2" />

      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <div className="faq-eyebrow">
            <Sparkles size={12} />
            <span>Got Questions?</span>
          </div>
          <h2 className="faq-title">
            Frequently Asked<br />
            <em>Questions</em>
          </h2>
          <p className="faq-sub">
            Everything you need to know about booking and visiting Glamio.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="faq-layout">
          {/* Left: accordion */}
          <div className="faq-list">
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

          {/* Right: decorative panel */}
          <div className="faq-panel">
            <div className="faq-panel__inner">
              <div className="faq-panel__icon">✦</div>
              <h3 className="faq-panel__heading">Still have questions?</h3>
              <p className="faq-panel__text">
                Our team is always happy to help. Reach out to us directly and
                we'll get back to you within the hour.
              </p>
              <a href="/contact" className="faq-panel__btn">
                Contact Us
              </a>
              <div className="faq-panel__divider" />
              <div className="faq-panel__stat">
                <strong>2 min</strong>
                <span>Average response time</span>
              </div>
              <div className="faq-panel__stat">
                <strong>Mon – Sun</strong>
                <span>We're available daily</span>
              </div>
              <div className="faq-panel__stat">
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
