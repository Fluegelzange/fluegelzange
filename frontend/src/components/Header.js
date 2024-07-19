// src/components/Header.js
import React from 'react';
import './Header.css';

const Header = ({ handleSearch }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <h1><a href="#home">Flügelzange</a></h1>
      </div>
      <div className="header-search">
        <input
          type="text"
          placeholder="Search articles..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        
      </div>
      <nav className="header-nav">
        <ul>
        
        <li><a href="#login">Login</a></li>
        </ul>
        </nav>
        
      
    </header>
  );
}

export default Header;
