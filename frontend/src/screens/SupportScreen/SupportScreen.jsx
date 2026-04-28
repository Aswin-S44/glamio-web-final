import React, { useState } from "react";
import {
  Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp,
  MessageSquare, Send, CheckCircle, Sparkles, HelpCircle,
  BookOpen, Headphones, Zap
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./SupportScreen.css";

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Browse salons on our Shops page, click on a salon you like, choose a service, select a specialist, pick a date and time slot, then confirm your booking. You'll receive an email confirmation instantly.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes! You can cancel for free up to 24 hours before your appointment. To reschedule, cancel your current booking and make a new one. Cancellations within 24 hours may be subject to a fee.",
  },
  {
    q: "How do I find salons near me?",
    a: "Click 'Nearby' in the navigation bar and allow location access. We'll show you a map with all salons near you sorted by distance, along with ratings and contact details.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use industry-standard encryption and do not store your card details. All transactions are processed through a certified payment gateway.",
  },
  {
    q: "How do I list my salon on Glamio?",
    a: "Sign up with a business account, then use our 'Onboard Your Shop' flow to add your salon details, services, and photos. Our team reviews submissions within 48 hours.",
  },
  {
    q: "What if a salon cancels my appointment?",
    a: "If a salon cancels your appointment, you'll be notified immediately and receive a full refund within 3-5 business days. You can also rebook with any other salon instantly.",
  },
  {
    q: "Can I book multiple services at once?",
    a: "Yes! On the salon page, add multiple services to your cart, then proceed to slot selection. The total duration and price are calculated automatically.",
  },
  {
    q: "How are ratings calculated?",
    a: "Ratings are based on verified customer reviews only — people who have completed an appointment at that salon. We aggregate scores from Google Reviews and our own platform.",
  },
];

const CATEGORIES = [
  { icon: <BookOpen size={22} />, label: "Booking Help", desc: "Questions about booking, cancellation, and rescheduling" },
  { icon: <Headphones size={22} />, label: "Account Support", desc: "Login, profile, and account management" },
  { icon: <Zap size={22} />, label: "Technical Issues", desc: "App bugs, payment errors, and technical problems" },
  { icon: <MessageSquare size={22} />, label: "General Enquiry", desc: "Partnerships, feedback, and other queries" },
];

export default function SupportScreen() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [searchFaq, setSearchFaq] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const filteredFaqs = FAQS.filter(
    (f) =>
      !searchFaq ||
      f.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.a.toLowerCase().includes(searchFaq.toLowerCase())
  );

  return (
    <div className="support-page">
      <Header />

      {/* Hero */}
      <div className="support-hero">
        <div className="support-hero-inner">
          <span className="support-hero-tag">
            <Sparkles size={14} /> Support
          </span>
          <h1>How can we help you?</h1>
          <p>We're here for you — find answers or reach out to our team</p>
          <div className="sp-faq-search-bar">
            <HelpCircle size={18} />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchFaq}
              onChange={(e) => setSearchFaq(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="support-body">

        {/* Help Categories */}
        <section className="support-section">
          <div className="section-label">Help Categories</div>
          <h2 className="section-title">What do you need help with?</h2>
          <div className="help-categories-grid">
            {CATEGORIES.map((cat) => (
              <button key={cat.label} className="help-category-card">
                <div className="help-cat-icon">{cat.icon}</div>
                <h4>{cat.label}</h4>
                <p>{cat.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="support-section">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Frequently Asked Questions</h2>

          <div className="sp-faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="sp-faq-no-results">
                <HelpCircle size={40} />
                <p>No results for "{searchFaq}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className={`sp-faq-item ${openFaq === i ? "open" : ""}`}
                >
                  <button
                    className="sp-faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <div className="sp-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="support-section contact-split">
          <div className="contact-info-col">
            <div className="section-label">Contact Us</div>
            <h2 className="section-title">Still need help?</h2>
            <p className="contact-subtitle">
              Our support team is available 7 days a week. We usually respond within 2 hours.
            </p>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="contact-label">Email Us</span>
                  <a href="mailto:support@glamio.in" className="contact-value">support@glamio.in</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="contact-label">Call Us</span>
                  <a href="tel:+918000000000" className="contact-value">+91 8000 000 000</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="contact-label">Our Office</span>
                  <span className="contact-value">Bangalore, Karnataka, India</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="contact-label">Working Hours</span>
                  <span className="contact-value">Mon–Sun, 9 AM – 9 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-col">
            {sent ? (
              <div className="form-success">
                <CheckCircle size={56} />
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 2 hours.</p>
                <button className="btn" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h3>Send us a message</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Select a topic</option>
                    <option value="booking">Booking Help</option>
                    <option value="account">Account Support</option>
                    <option value="payment">Payment Issue</option>
                    <option value="technical">Technical Problem</option>
                    <option value="general">General Enquiry</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="Describe your issue or question in detail..."
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="form-submit-btn" disabled={sending}>
                  {sending ? (
                    <><span className="btn-spinner" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
