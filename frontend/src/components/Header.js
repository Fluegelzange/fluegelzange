// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ handleSearch }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <h1><Link to="/">Flügelzange</Link></h1>
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
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
