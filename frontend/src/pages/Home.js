// src/pages/Home.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import Article from '../components/Article';
import { createArticle, fetchArticleById, fetchArticles } from '../services/api';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [header, setHeader] = useState('');
  const [value, setValue] = useState('');
  const [articleId, setArticleId] = useState('');
  const [singleArticle, setSingleArticle] = useState(null);
  const { userRole, setPopupMessage } = useContext(AuthContext);

  console.log(userRole);

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
    setPopupMessage('Artikel erfolgreich hinzugefügt!');
  };

  const handleFetchById = async (e) => {
    e.preventDefault();
    try {
      const article = await fetchArticleById(articleId);
      setSingleArticle(article);
    } catch (error) {
      console.error('Fehler beim Abrufen des Artikels:', error);
      setPopupMessage('Artikel nicht gefunden!');
    }
  };

  return (
    <>
      {userRole === 'admin' && (
        <>
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
        </>
      )}

      {articles.length > 0 && (
        <Article article={singleArticle || articles[articles.length - 1]} />
      )}
    </>
  );
}

export default Home;
