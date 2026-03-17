import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col footer-about">
            <div className="footer-logo">
              GLAM<span>OUR</span>
            </div>
            <p>
              Elevating beauty through precision and care. Experience
              world-class treatments tailored to your unique style.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#gallery">Gallery</a>
              </li>
              <li>
                <a href="#booking">Book Now</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>123 Beauty Lane, Glow City</p>
              <p>+1 (555) 123-4567</p>
              <p>support@glamio.com</p>
            </div>
          </div>

          <div className="footer-col footer-app">
            <h4>Experience the App</h4>
            <p>Book on the go and get exclusive beauty rewards.</p>
            <div className="app-buttons">
              <a href="#" className="app-btn">
                <div className="app-icon">
                  <svg viewBox="0 0 512 512" width="24">
                    <path
                      fill="currentColor"
                      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-10.3 18-28.5-1.2-40.8zM325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"
                    />
                  </svg>
                </div>
                <div className="app-text">
                  <span>GET IT ON</span>
                  <strong>Google Play</strong>
                </div>
              </a>

              <a href="#" className="app-btn">
                <div className="app-icon">
                  <svg viewBox="0 0 384 512" width="24">
                    <path
                      fill="currentColor"
                      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                    />
                  </svg>
                </div>
                <div className="app-text">
                  <span>Download on the</span>
                  <strong>App Store</strong>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Glamio Beauty Parlor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
