import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Policy.css";

const COOKIE_TYPES = [
  {
    name: "Strictly Necessary",
    purpose: "Essential for the platform to function. These cannot be disabled.",
    examples: "Authentication tokens, session identifiers, security cookies.",
    required: true,
  },
  {
    name: "Functional",
    purpose: "Remember your preferences and personalise your experience.",
    examples: "Language preference, last-searched location, saved filters.",
    required: false,
  },
  {
    name: "Analytics",
    purpose: "Help us understand how users interact with the platform so we can improve it.",
    examples: "Pages visited, time spent, click paths (via Firebase Analytics).",
    required: false,
  },
  {
    name: "Performance",
    purpose: "Monitor platform performance and detect errors.",
    examples: "Error logs, load times, API response tracking.",
    required: false,
  },
];

export default function CookiesScreen() {
  return (
    <div className="policy-page">
      <Header />

      <div className="policy-simple">
        <h1 className="policy-simple__title">Cookie Policy</h1>

        <div className="policy-simple__meta">
          <p><strong>Last Updated:</strong> December 25, 2026</p>
        </div>

        <div className="policy-simple__section">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website or use a web app.
            They are widely used to make platforms work efficiently and to provide information to the platform owner.
          </p>
          <p>
            Cookies can be <strong>session cookies</strong> (deleted when you close your browser) or{" "}
            <strong>persistent cookies</strong> (stored on your device for a set period or until you delete them).
          </p>
        </div>

        <div className="policy-simple__section">
          <h2>2. Cookies We Use</h2>
          <p>We use the following categories of cookies on the Orucom platform:</p>
          {COOKIE_TYPES.map((ct) => (
            <div key={ct.name} className="policy-cookie-card">
              <div className="policy-cookie-card__header">
                <strong>{ct.name}</strong>
                <span className={`policy-cookie-badge ${ct.required ? "required" : "optional"}`}>
                  {ct.required ? "Required" : "Optional"}
                </span>
              </div>
              <p>{ct.purpose}</p>
              <p className="policy-cookie-card__examples"><strong>Examples:</strong> {ct.examples}</p>
            </div>
          ))}
        </div>

        <div className="policy-simple__section">
          <h2>3. Third-Party Cookies</h2>
          <p>Some cookies on our platform are set by third-party services we use. These include:</p>
          <ul>
            <li>
              <strong>Firebase (Google):</strong> Used for authentication, analytics, and performance monitoring.
              Governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>.
            </li>
            <li>
              <strong>Google Maps:</strong> Used for the "Nearby Salons" feature to display salon locations.
              Governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>.
            </li>
            <li>
              <strong>Netlify:</strong> Our hosting provider may set cookies related to performance and security.
            </li>
          </ul>
          <p>We do not have control over third-party cookies. Please refer to each provider's privacy policy for details.</p>
        </div>

        <div className="policy-simple__section">
          <h2>4. Managing Cookies</h2>
          <p>You can control and manage cookies in several ways:</p>
          <ul>
            <li><strong>Browser settings:</strong> Most browsers allow you to view, block, or delete cookies via their settings. Note that blocking strictly necessary cookies will prevent the platform from functioning correctly.</li>
            <li><strong>Incognito / private mode:</strong> Browsing in private mode limits persistent cookies from being stored.</li>
            <li>
              <strong>Opt-out tools:</strong> For analytics cookies set by Google, you can use the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </li>
          </ul>
          <p>Disabling optional cookies will not prevent you from using the platform but may affect some features such as personalised recommendations and location-based search.</p>
        </div>

        <div className="policy-simple__section">
          <h2>5. Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us:</p>
          <p>Email: <a href="mailto:nominoinnovations@gmail.com">nominoinnovations@gmail.com</a></p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
