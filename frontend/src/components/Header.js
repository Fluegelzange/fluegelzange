import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Header.css';

const Header = ({ handleSearch }) => {
  const { isAuthenticated, setIsAuthenticated, setPopupMessage } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPopupMessage('Erfolgreich ausgeloggt!');
    navigate('/');
  };

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
          {isAuthenticated ? (
            <li>
              <button className="header-button" onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <li>
              <Link className="header-button" to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
