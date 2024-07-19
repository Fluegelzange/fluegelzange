// src/App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import Article from './components/Article';
import Header from './components/Header';
import { createArticle, fetchArticleById, fetchArticles } from './services/api';

function App() {
  const [articles, setArticles] = useState([]);
  const [header, setHeader] = useState('');
  const [value, setValue] = useState('');
  const [articleId, setArticleId] = useState('');
  const [singleArticle, setSingleArticle] = useState(null);

  useEffect(() => {
    const getArticles = async () => {
      const articlesFromServer = await fetchArticles();
      setArticles(articlesFromServer);
    };

    getArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newArticle = { header, value };
    const result = await createArticle(newArticle);
    setArticles([...articles, result]);
    setHeader('');
    setValue('');
    alert('Artikel erfolgreich hinzugefügt!');
  };

  const handleFetchById = async (e) => {
    e.preventDefault();
    try {
      const article = await fetchArticleById(articleId);
      setSingleArticle(article);
    } catch (error) {
      console.error("Fehler beim Abrufen des Artikels:", error);
      alert('Artikel nicht gefunden!');
    }
  };

  return (
    <div className="App">
      <Header />
      <main>
        <form onSubmit={handleSubmit} className="article-form">
          <input
            type="text"
            placeholder="Header"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
          />
          <textarea
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          ></textarea>
          <button type="submit">Artikel erstellen</button>
        </form>

        <form onSubmit={handleFetchById} className="article-form">
          <input
            type="text"
            placeholder="Article ID"
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
          />
          <button type="submit">Artikel abrufen</button>
        </form>

        {/* Bedingte Überprüfung, um sicherzustellen, dass Artikel geladen sind */}
        {articles.length > 0 ? (
          <Article article={singleArticle || articles[articles.length - 1]} />
        ) : (
          <p>Loading...</p>
        )}
      </main>
      <footer>
        <p><a href="#about">About Flügelzange</a></p>
      </footer>
    </div>
  );
}

export default App;
