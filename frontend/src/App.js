import React, { createContext, useContext, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Article from './components/Article';
import Header from './components/Header';
import Popup from './components/Popup';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import { createArticle, fetchArticleById, fetchArticles } from './services/api';

export const AuthContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage('');
      }, 3000); // Popup nach 3 Sekunden zurücksetzen

      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, setPopupMessage }}>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
            </Routes>
          </main>
          <Footer />
          {popupMessage && <Popup message={popupMessage} />}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Home() {
  const [articles, setArticles] = useState([]);
  const [header, setHeader] = useState('');
  const [value, setValue] = useState('');
  const [articleId, setArticleId] = useState('');
  const [singleArticle, setSingleArticle] = useState(null);
  const { setPopupMessage } = useContext(AuthContext);

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

      {articles.length > 0 && (
        <Article article={singleArticle || articles[articles.length - 1]} />
      )}
    </>
  );
}

function ConfirmEmail() {
  const [popupMessage, setPopupMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      fetch(`http://localhost:5000/confirm-email?token=${token}`)
        .then(response => {
          if (response.ok) {
            setPopupMessage('Ihre E-Mail-Adresse wurde erfolgreich verifiziert!');
          } else {
            response.text().then(text => setPopupMessage(`Fehler bei der E-Mail-Verifizierung: ${text}`));
          }
        })
        .catch(error => setPopupMessage(`Fehler bei der E-Mail-Verifizierung: ${error.message}`));
    }
  }, [location.search]);

  return (
    <div>
      {popupMessage && <Popup message={popupMessage} />}
    </div>
  );
}

function Footer() {
  const location = useLocation();
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verified') === 'true') {
      setPopupMessage('Ihre E-Mail-Adresse wurde erfolgreich verifiziert!');
    }
  }, [location]);

  return (
    <footer>
      {popupMessage && <Popup message={popupMessage} />}
      <p><a href="#about">About Flügelzange</a></p>
    </footer>
  );
}

export default App;
