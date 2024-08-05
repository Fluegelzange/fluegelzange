import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles } from '../services/api';
import './Archive.css';

const Archive = () => {
  const [articles, setArticles] = useState([]);
  const [sortOption, setSortOption] = useState('dateDesc');

  useEffect(() => {
    const getArticles = async () => {
      try {
        const articlesFromServer = await fetchArticles();
        setArticles(articlesFromServer);
      } catch (error) {
        console.error('Fehler beim Abrufen der Artikel:', error);
      }
    };

    getArticles();
  }, []);

  const sortArticles = (articles, option) => {
    switch (option) {
      case 'dateAsc':
        return articles.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'dateDesc':
        return articles.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'titleAsc':
        return articles.slice().sort((a, b) => a.header.localeCompare(b.header));
      case 'titleDesc':
        return articles.slice().sort((a, b) => b.header.localeCompare(a.header));
      default:
        return articles;
    }
  };

  return (
    <div className="archive-container">
      <h1>Artikel-Archiv</h1>
      <div className="filter-options">
        <label htmlFor="sort">Sortieren nach:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="dateDesc">Datum abwärts</option>
          <option value="dateAsc">Datum aufwärts</option>
          <option value="titleAsc">Alphabetisch aufwärts</option>
          <option value="titleDesc">Alphabetisch abwärts</option>
        </select>
      </div>
      <div className="archive-list">
        {sortArticles(articles, sortOption).map(article => (
          <div key={article._id} className="archive-item">
            <Link to={`/article/${article._id}`} className="archive-link">
              {article.thumbnailUrl && (
                <img src={article.thumbnailUrl} alt={article.header} className="archive-thumbnail" />
              )}
              <div className="archive-details">
                <h2>{article.header}</h2>
                <p className="archive-date">Erschienen am: {new Date(article.date).toLocaleDateString()}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archive;
