import React from "react";
import "./Testimonials.css";

const testimonials = [
  {
    name: "Ayesha",
    text: "Absolutely loved the service. The ambience is so calming!",
  },
  {
    name: "Nihal",
    text: "Professional staff and premium quality treatments.",
  },
  {
    name: "Fathima",
    text: "Best bridal makeup experience ever!",
  },
];

function Testimonials() {
  return (
    <section className="testimonials">
      <h2 className="title">What Our Clients Say</h2>
      <div className="testimonial-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <p>“{t.text}”</p>
            <h4>- {t.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
