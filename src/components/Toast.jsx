import React, { useEffect } from 'react';
import './Toast.css';
import checkIcon from '../assets/images/check.png';

const Toast = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div className="toast-overlay" onClick={onClose}></div>
      <div className="toast-container">
        <div className="toast-message">
          <img src={checkIcon} alt="Success" />
          <span>Link copied to clipboard!</span>
        </div>
      </div>
    </>
  );
};

export default Toast;
