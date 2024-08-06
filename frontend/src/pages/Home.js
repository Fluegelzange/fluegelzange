import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles } from '../services/api';
import './Home.css'; // Importiere die CSS-Datei für das Styling

const Home = () => {
  const [articles, setArticles] = useState([]);

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

  // Den neuesten Artikel und die nächsten drei Artikel extrahieren
  const latestArticle = articles.length > 0 ? articles[articles.length - 1] : null;
  const nextArticlesCount = articles.length > 3 ? 3 : articles.length - 1;
  const nextArticles = articles.slice(articles.length - 1 - nextArticlesCount, articles.length - 1);

  return (
    <div className="home-container">
      {latestArticle ? (
        <div className="latest-article">
          <Link to={`/article/${latestArticle._id}`} className="latest-article-link">
            {latestArticle.thumbnailUrl && (
              <img src={latestArticle.thumbnailUrl} alt={latestArticle.header} className="thumbnail-image" />
            )}
            <h2>{latestArticle.header}</h2>
            <p>{latestArticle.value.split('\n').slice(0, 3).join('\n')}...</p> {/* Zeige nur die ersten 3 Zeilen */}
            <span className="read-more">Mehr lesen</span>
          </Link>
        </div>
      ) : (
        <p>Keine Artikel verfügbar</p>
      )}

      {nextArticles.length > 0 && (
        <div className="article-thumbnails">
          {nextArticles.map((article, index) => (
            <Link key={article._id} to={`/article/${article._id}`} className={`article-thumbnail article-thumbnail-${index}`}>
              {article.thumbnailUrl && (
                <img src={article.thumbnailUrl} alt={article.header} className="thumbnail-image" />
              )}
              <h3>{article.header}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
