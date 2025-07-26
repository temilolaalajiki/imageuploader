import React from 'react';
import './LoadingIndicator.css';

const LoadingIndicator = () => {
  return (
    <>
      <div className="loading-overlay"></div>
      <div className="loading-container">
        <p className="loading-text"><span style={{fontWeight: 500}}>Uploading... </span>please wait</p>
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </>
  );
};

export default LoadingIndicator;
