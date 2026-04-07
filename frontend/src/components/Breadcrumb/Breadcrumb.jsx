import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map routes to display names
  const routeNames = {
    "": "Home",
    signin: "Sign In",
    signup: "Sign Up",
    "signup/type=customer": "Customer Sign Up",
    parlour: "Parlor",
    parlor: "Parlor",
    service: "Service",
    summary: "Booking Summary",
    shop: "Shop",
    dashboard: "Dashboard",
    profile: "My Profile",
    "edit-profile": "Edit Profile",
    onboard: "Onboard",
  };

  // Handle special cases for dynamic routes
  const getDisplayName = (segment, index, fullPath) => {
    // Check if it's a dynamic ID (like parlor/:id)
    if (segment.match(/^[0-9a-fA-F]{24}$/) || segment.match(/^\d+$/)) {
      return "Details";
    }

    // Check if it's a service ID
    if (
      segment === "service" &&
      fullPath[index + 1]?.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return "Select Service";
    }

    // Check if it's a dynamic service ID
    if (
      segment.match(/^[0-9a-fA-F]{24}$/) &&
      fullPath[index - 1] === "service"
    ) {
      return "Service Details";
    }

    // Return mapped name or capitalize the segment
    return (
      routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <svg
                className="breadcrumb-home-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path
                  fill="currentColor"
                  d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                />
              </svg>
              <span>Home</span>
            </Link>
          </li>

          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const displayName = getDisplayName(value, index, pathnames);

            // Skip rendering if display name is empty
            if (!displayName) return null;

            return (
              <li key={to} className="breadcrumb-item">
                <span className="breadcrumb-separator">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      fill="currentColor"
                      d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                    />
                  </svg>
                </span>
                {isLast ? (
                  <span className="breadcrumb-current">{displayName}</span>
                ) : (
                  <Link to={to} className="breadcrumb-link">
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
