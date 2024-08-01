import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { createArticle, fetchArticleById, fetchArticles } from '../services/api';

const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [header, setHeader] = useState('');
  const [value, setValue] = useState('');
  const [articleId, setArticleId] = useState('');
  const { userRole, setPopupMessage } = useContext(AuthContext);
  const [ setSingleArticle] = useState(null);


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
      setSingleArticle(article); // Hier fehlt möglicherweise der `setSingleArticle`-Zustand
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
    </>
  );
}

export default AddArticle;
