import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Policy.css";

export default function TermsScreen() {
  return (
    <div className="policy-page">
      <Header />

      <div className="policy-simple">
        <h1 className="policy-simple__title">Terms and Conditions</h1>

        <div className="policy-simple__meta">
          <p>
            <strong>Last Updated:</strong> May 18, 2026
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to orucom, an application owned and operated by Nomino
            Innovations Private Limited ("Company"). By accessing or using our
            platform, you agree to be bound by these terms.
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>2. Scope of Service</h2>
          <ul>
            <li>
              Nomino Innovations Private Limited acts strictly as a technology
              intermediary connecting users with independent beauty parlours and
              salons ("Service Providers").
            </li>
            <li>
              We do not own, manage, or control the Service Providers listed on
              orucom.
            </li>
            <li>
              We do not directly provide beauty, grooming, or wellness services.
            </li>
            <li>
              We are not liable for the quality, safety, or standard of services
              rendered by the Service Providers.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>3. User Accounts & Login</h2>
          <ul>
            <li>
              <strong>Google Login:</strong> Customer access to the platform
              requires authentication exclusively via your Google Account. You
              are responsible for maintaining the security of your Google
              account credentials.
            </li>
            <li>
              <strong>Accuracy:</strong> You agree to provide accurate contact
              information (such as your phone number) to ensure Service
              Providers can fulfill your bookings.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>4. User Guidelines & Bookings</h2>
          <ul>
            <li>
              <strong>Confirmations:</strong> A booking is only valid once
              confirmed via an in-app notification or message.
            </li>
            <li>
              <strong>Payments:</strong> All payments for services are to be
              settled directly with the Service Provider, unless an in-app
              payment gateway is explicitly utilized for an advance token.
            </li>
            <li>
              <strong>Cancellations:</strong> Users are expected to cancel
              appointments via the app reasonably in advance. Repeated failure
              to honor bookings (No-Shows) may result in account suspension.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>5. Business Partner (Salon) Obligations</h2>
          <ul>
            <li>
              <strong>Service Fulfillment:</strong> Salons registered on orucom
              agree to honor all confirmed bookings.
            </li>
            <li>
              <strong>Accuracy of Information:</strong> Salons are solely
              responsible for maintaining accurate pricing, availability, and
              service descriptions.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>6. Limitation of Liability</h2>
          <p>
            The orucom platform is provided on an "AS IS" basis. To the maximum
            extent permitted by law, Nomino Innovations Private Limited shall
            not be held liable for any direct, indirect, or consequential
            damages, disputes, or injuries arising between users and Service
            Providers.
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>7. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes are
            subject to the exclusive jurisdiction of the courts in Kerala.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
