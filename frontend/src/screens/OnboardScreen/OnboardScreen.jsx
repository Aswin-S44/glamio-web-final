import React, { useState } from "react";
import "./OnboardScreen.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function OnboardScreen() {
  const [showContact, setShowContact] = useState(false);

  const contactInfo = {
    email: "admin@beautyparlor.com",
    phones: ["+1 (555) 000-1111", "+1 (555) 000-2222"],
  };

  return (
    <>
      <Header />
      <div className="onboard-container">
        <div className="onboard-card">
          {!showContact ? (
            <div className="onboard-content">
              <div className="status-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="var(--primary)"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 6V12L16 14"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1>Waiting for onboard you</h1>
              <p>
                Your shop profile is currently being reviewed. Our admin team
                needs to onboard and verify your parlor before you can access
                the dashboard.
              </p>
              <div className="onboard-footer">
                <span className="badge">Status: Pending Approval</span>
                <button
                  className="contact-btn"
                  onClick={() => setShowContact(true)}
                >
                  Contact Support
                </button>
              </div>
            </div>
          ) : (
            <div className="onboard-content animate-in">
              <h1>Contact Support</h1>
              <p>
                If you have any questions regarding your application, feel free
                to reach out to us.
              </p>

              <div className="contact-list">
                <div className="contact-item">
                  <div className="mini-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="contact-text">
                    <span>Email Address</span>
                    <strong>{contactInfo.email}</strong>
                  </div>
                </div>

                {contactInfo.phones.map((phone, index) => (
                  <div className="contact-item" key={index}>
                    <div className="mini-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className="contact-text">
                      <span>Phone Number {index + 1}</span>
                      <strong>{phone}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="back-btn"
                onClick={() => setShowContact(false)}
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OnboardScreen;
