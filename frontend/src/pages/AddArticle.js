import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { createArticle, fetchArticleById, fetchArticles, uploadThumbnail } from '../services/api'; // uploadThumbnail Funktion importieren
import './AddArticle.css'; // CSS-Datei importieren

const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [header, setHeader] = useState('');
  const [value, setValue] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null); // Zustand für die hochgeladene Datei
  const [articleId, setArticleId] = useState('');
  const { userRole, setPopupMessage } = useContext(AuthContext);
  const [setSingleArticle] = useState(null);

  useEffect(() => {
    const getArticles = async () => {
      const articlesFromServer = await fetchArticles();
      setArticles(articlesFromServer);
    };

    getArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let thumbnailUrl = '';
      if (thumbnailFile) {
        // Wenn eine Datei ausgewählt wurde, diese zu Cloudinary hochladen
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        formData.append('upload_preset', 'test_preset'); // Ersetze durch deinen Upload-Preset

        const response = await uploadThumbnail(formData);
        thumbnailUrl = response.thumbnailUrl;
      }

      console.log('Thumbnail URL:', thumbnailUrl); // Protokolliere die Thumbnail-URL

      const date = new Date(); // Aktuelles Datum und Uhrzeit
      const newArticle = { header, value, thumbnailUrl, date }; // Datum hinzufügen
      const result = await createArticle(newArticle);
      setArticles([...articles, result]);
      setHeader('');
      setValue('');
      setThumbnailFile(null);
      setPopupMessage('Artikel erfolgreich hinzugefügt!');
    } catch (error) {
      console.error('Fehler beim Erstellen des Artikels:', error);
      setPopupMessage('Fehler beim Erstellen des Artikels!');
    }
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

  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  return (
    <>
      {userRole === 'admin' && (
        <>
          <form onSubmit={handleSubmit} className="article-form">
            <input
              type="text"
              placeholder="Überschrift"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
            />
            <textarea
              placeholder="Artikel"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></textarea>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button type="submit">Artikel erstellen</button>
          </form>

         
        </>
      )}
    </>
  );
};

export default AddArticle;
