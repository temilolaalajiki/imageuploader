import React from "react";
import "./styles/LoadingIndicator.css";

const LoadingIndicator = () => {
  return (
    <>
      <div className="loadingOverlay"></div>
      <div className="uploadingContainer">
        <p className="loadingText">
          <span style={{ fontWeight: 500}}>Uploading... </span>please wait
        </p>
        <div className="progressBarContainer">
          <div className="progressBar"></div>
        </div>
      </div>
    </>
  );
};

export default LoadingIndicator;
