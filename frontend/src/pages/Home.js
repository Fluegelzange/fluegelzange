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
        console.log('Articles from server:', articlesFromServer); // Debugging: Zeige die Artikel in der Konsole an
        setArticles(articlesFromServer);
      } catch (error) {
        console.error('Fehler beim Abrufen der Artikel:', error);
      }
    };

    getArticles();
  }, []);

  // Den neuesten Artikel und die nächsten drei Artikel extrahieren
  const latestArticle = articles.length > 0 ? articles[articles.length-1] : null; // Neuesten Artikel (erste in der Liste)
  const nextThreeArticles = articles.length > 3 ? articles.slice(articles.length-4, articles.length-1) : []; // Die nächsten drei Artikel, falls verfügbar

  // Debugging: Überprüfe, ob latestArticle und nextThreeArticles korrekt sind
  console.log('Latest Article:', latestArticle);
  console.log('Next Three Articles:', nextThreeArticles);

  return (
    <div className="home-container">
      {latestArticle ? (
        <div className="latest-article">
          <Link to={`/${latestArticle._id}`} className="latest-article-link">
            <h2>{latestArticle.header}</h2>
            <p>{latestArticle.value.split('\n').slice(0, 3).join('\n')}...</p> {/* Zeige nur die ersten 3 Zeilen */}
            <span className="read-more">Read more</span>
          </Link>
        </div>
      ) : (
        <p>Keine Artikel verfügbar</p>
      )}

      <div className="article-thumbnails">
        {nextThreeArticles.length > 0 ? (
          nextThreeArticles.map(article => (
            <Link key={article._id} to={`/${article._id}`} className="article-thumbnail">
              <h3>{article.header}</h3>
            </Link>
          ))
        ) : (
          <p>Keine weiteren Artikel verfügbar</p>
        )}
      </div>
    </div>
  );
}

export default Home;
