import React from "react";
import {
  Target,
  Sparkles,
  Users,
  Clock,
  Award,
  Zap,
  Scissors,
  Phone,
  Calendar,
  Star,
  Shield,
  Smile,
} from "lucide-react";
import "./AboutUsScreen.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function AboutUsScreen() {
  return (
    <>
      <Header />
      <div className="about-container">
        <div className="about-hero">
          <div className="hero-content">
            <h1 className="about-title">About Us</h1>
            <p className="about-subtitle">
              Welcome to Orucom, your trusted partner in revolutionizing the
              beauty and wellness industry. Developed and managed by Nomino
              Innovations Private Limited, Orucom was created with a clear
              vision: to seamlessly connect clients with top-tier beauty
              professionals while providing salon owners with the powerful tools
              they need to thrive in a digital world.
            </p>
          </div>
        </div>

        <div className="about-content">
          <div className="mission-section">
            <div className="mission-icon-wrapper">
              <Target size={32} />
            </div>
            <h2>Our Mission</h2>
            <p>
              We believe that booking a salon appointment should be as relaxing
              as the service itself. Our mission is to eliminate the friction of
              traditional scheduling by providing an intuitive, all-in-one
              mobile booking experience that respects both the customer's time
              and the salon's workflow.
            </p>
          </div>

          <div className="what-we-do-section">
            <div className="section-header">
              <Sparkles size={28} />
              <h2>What We Do</h2>
            </div>
            <p className="section-description">
              Orucom bridges the gap between customers seeking quality self-care
              and the talented professionals providing it.
            </p>

            <div className="features-grid">
              <div className="feature-card customer-feature">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <h3>For Customers</h3>
                <p>
                  Discover local salons, view real-time availability, explore
                  services, and book appointments instantly with just a few
                  taps.
                </p>
                <ul className="feature-list">
                  <li>
                    <Clock size={16} />
                    <span>Real-time availability</span>
                  </li>
                  <li>
                    <Calendar size={16} />
                    <span>Instant booking</span>
                  </li>
                  <li>
                    <Star size={16} />
                    <span>Service exploration</span>
                  </li>
                </ul>
              </div>

              <div className="feature-card owner-feature">
                <div className="feature-icon">
                  <Award size={24} />
                </div>
                <h3>For Salon Owners</h3>
                <p>
                  Streamline daily operations, manage bookings effortlessly,
                  reduce no-shows, and focus on delivering exceptional services
                  rather than worrying about administrative bottlenecks.
                </p>
                <ul className="feature-list">
                  <li>
                    <Zap size={16} />
                    <span>Streamlined operations</span>
                  </li>
                  <li>
                    <Shield size={16} />
                    <span>Reduce no-shows</span>
                  </li>
                  <li>
                    <Phone size={16} />
                    <span>Easy management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="values-section">
            <div className="section-header">
              <Star size={28} />
              <h2>Our Core Values</h2>
            </div>

            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <Zap size={28} />
                </div>
                <h3>Innovation</h3>
                <p>
                  We are dedicated to continuously leveraging technology to
                  enhance the beauty service experience.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Users size={28} />
                </div>
                <h3>Empowerment</h3>
                <p>
                  We equip small and medium-sized salon businesses with the
                  digital infrastructure they need to scale and succeed.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Smile size={28} />
                </div>
                <h3>Simplicity</h3>
                <p>
                  We believe the best technology is invisible. We keep our
                  platform clean, fast, and remarkably easy to use for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutUsScreen;
