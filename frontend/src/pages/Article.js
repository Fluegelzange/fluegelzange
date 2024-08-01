import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchArticleById } from '../services/api';
import './Article.css'; // Importiere eine CSS-Datei für das Styling

const Article = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null); // Fehlerzustand hinzufügen

  useEffect(() => {
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticleById(articleId);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Artikel nicht gefunden');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Artikels:', error);
        setError('Fehler beim Abrufen des Artikels');
      }
    };

    getArticle();
  }, [articleId]);

  if (error) {
    return <div className="error-message">{error}</div>; // Fehlernachricht anzeigen
  }

  if (!article) {
    return <p>Artikel wird geladen...</p>;
  }

  return (
    <div className="article-container">
      <Link to="/" className="back-link">Zurück zur Startseite</Link>
      <h1>{article.header}</h1>
      <p>{article.value}</p>
    </div>
  );
}

export default Article;
