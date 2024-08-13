import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import logo from '../public/logo512.png'; // Importiere das Logo
import { fetchArticles } from '../services/api';
import './Header.css';

const Header = () => {
  const { isAuthenticated, setIsAuthenticated, setPopupMessage, userRole, setUserRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [noResultsMessage, setNoResultsMessage] = useState('');

  useEffect(() => {
    const loadArticles = async () => {
      const articles = await fetchArticles();
      setArticles(articles);
    };
    loadArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      let results = articles.filter(article =>
        article.header.toLowerCase().includes(searchQuery.toLowerCase())
      );
      results = results.sort((a, b) => a.header.localeCompare(b.header));
      setFilteredArticles(results);
      setNoResultsMessage(results.length === 0 ? 'Keine Ergebnisse gefunden' : '');
    } else {
      setFilteredArticles([]);
      setNoResultsMessage('');
    }
  }, [searchQuery, articles]);

  const handleArticleClick = () => {
    setSearchQuery('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('guest');
    setPopupMessage('Erfolgreich ausgeloggt!');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-logo">
      <Link to="/"><img src={logo} alt="Logo" className="logo" /></Link> {/* Logo hinzugefügt */}
        <h1><Link to="/">Flügelzange</Link></h1>
      </div>
      <div className="header-content">
        <div className="header-search">
          <input
            type="text"
            placeholder="Artikel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="search-suggestions">
              {filteredArticles.length > 0 ? (
                <ul>
                  {filteredArticles.map((article) => (
                    <li key={article.id}>
                      <Link to={`/article/${article._id}`} onClick={handleArticleClick} className="search-suggestion-link">
                        {article.header}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{noResultsMessage}</p>
              )}
            </div>
          )}
        </div>
        {userRole === 'admin' && (
          <div className="header-links">
            <Link className="header-button" to="/addArticle">Artikel erstellen</Link>
          </div>
        )}
      </div>
      <nav className="header-nav">
        <ul>
          <li>
            <Link className="header-button" to="/archive">Archiv</Link>
          </li>
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
