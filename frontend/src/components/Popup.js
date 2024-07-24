// src/components/Popup.js
import React from 'react';
import './Popup.css';

const Popup = ({ message }) => {
  return (
    <div className="popup">
      <div className="popup-inner">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Popup;
