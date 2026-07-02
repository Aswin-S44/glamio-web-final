import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Policy.css";

export default function PrivacyScreen() {
  return (
    <div className="policy-page">
      <Header />

      <div className="policy-simple">
        <h1 className="policy-simple__title">Privacy Policy</h1>

        <div className="policy-simple__meta">
          <p>
            <strong>App Name:</strong> orucom
          </p>
          <p>
            <strong>Company:</strong> Nomino Innovations Private Limited
          </p>
          <p>
            <strong>Last Updated:</strong> May 18, 2026
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>1. Introduction</h2>
          <p>
            Nomino Innovations Private Limited ("we," "our," or "us") operates
            the orucom mobile application. We are committed to protecting your
            personal information and your right to privacy. This privacy policy
            explains what data we collect, why we collect it, and how we keep it
            safe.
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>2. Information We Collect</h2>
          <p>
            We only collect data that is strictly necessary to provide our slot
            booking services.
          </p>
          <ul>
            <li>
              <strong>Data from Google Sign-In:</strong> Our application
              exclusively uses Google Login for customer authentication. We do
              not offer or process public account registrations via standard
              email and password. When you log in, we securely receive basic
              profile information from your Google account, specifically your
              Name and Email Address.
            </li>
            <li>
              <strong>Personal Data:</strong> To facilitate salon bookings and
              coordination, we will additionally request your Phone Number.
            </li>
            <li>
              <strong>Booking Data:</strong> Details of appointments you book
              (Date, Time, Service requested, and the Salon Name).
            </li>
            <li>
              <strong>Device Information:</strong> We automatically collect
              basic device and usage information (such as your IP address,
              operating system, and app crash logs) to diagnose technical issues
              and improve app stability.
            </li>
            <li>
              <strong>Location Data:</strong> We request access to your location
              to suggest Service Providers near you. This is only collected if
              you grant explicit permission.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>
              Facilitate account creation and secure login via your Google
              Account.
            </li>
            <li>Fulfill and manage your salon bookings.</li>
            <li>
              Send administrative notifications, including booking confirmations
              and reminders via App Notifications or WhatsApp.
            </li>
            <li>Monitor app performance and prevent fraudulent activities.</li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>4. Data Sharing and Third Parties</h2>
          <p>
            We do not sell your personal data. We only share your data in the
            following specific scenarios:
          </p>
          <ul>
            <li>
              <strong>Service Providers (Salons):</strong> We share your Name
              and Phone Number with the specific Salon you have chosen to book
              with, so they can manage your appointment.
            </li>
            <li>
              <strong>Legal Obligations:</strong> We may disclose your
              information where legally required to comply with applicable laws
              or governmental requests.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>5. Data Retention and Account Deletion (User Rights)</h2>
          <p>
            You have full control over your data. We retain your data only for
            as long as your account is active.
          </p>
          <ul>
            <li>
              <strong>How to Delete Your Account & Data:</strong> You can
              request the complete deletion of your account and all associated
              personal data at any time by using the dedicated Account Deletion
              Link provided within the app (Menu &gt; Delete Account) or by
              requesting account deletion by contacting
              nominoinnovations@gmail.com.
            </li>
            <li>
              Upon submitting the deletion request through the provided link,
              all your personal information, booking history, and Google Login
              associations will be permanently removed from our active
              databases.
            </li>
          </ul>
        </div>

        <div className="policy-simple__section">
          <h2>6. Security of Your Information</h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information during transmission and storage. However, no
            digital platform can guarantee 100% security.
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>7. Children's Privacy</h2>
          <p>
            orucom is not intended for children under the age of 18. We do not
            knowingly collect personal data from minors.
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>8. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding this policy,
            please contact us at:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:nominoinnovations@gmail.com">
              nominoinnovations@gmail.com
            </a>
          </p>
          <p>
            Address: NOMINO INNOVATIONS PRIVATE LIMITED
            <br />
            Door No: 155, Building ID: 50916010009071
            <br />
            Ward No: 6-Neerad, Kondotty
            <br />
            Malappuram, Kerala - 673638
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
