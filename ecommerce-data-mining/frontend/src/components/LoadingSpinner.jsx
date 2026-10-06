import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ message = "Processing algorithm...", size = 28 }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-glow">
        <Loader2 size={size} className="spinner-icon" />
      </div>
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
