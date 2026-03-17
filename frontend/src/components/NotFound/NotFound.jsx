import React from "react";
import { SearchX, RefreshCcw } from "lucide-react";
import "./NotFound.css";

function NotFound({ title }) {
  return (
    <div className="nf-container">
      <div className="nf-content">
        <div className="nf-icon-wrapper">
          <div className="nf-icon-circle">
            <SearchX size={48} strokeWidth={1.5} />
          </div>
          <div className="nf-pulse-ring"></div>
        </div>

        <h2 className="nf-title">No {title} Found</h2>
        <p className="nf-description">
          We couldn't find any {title} matching your current search or filters.
          Try adjusting your keywords or switching categories.
        </p>

        <button
          className="nf-reset-btn"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw size={18} />
          <span>Clear All Filters</span>
        </button>
      </div>
    </div>
  );
}

export default NotFound;
