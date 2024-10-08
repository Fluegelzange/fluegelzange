import React, { createContext, useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Popup from './components/Popup';
import About from './pages/About';
import AddArticle from './pages/AddArticle';
import Archive from './pages/Archive';
import Article from './pages/Article'; // Importiere die Article-Komponente
import Home from './pages/Home';
import Login from './pages/Login';
import SignIn from './pages/SignIn';

export const AuthContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState('');
  const [popupMessage, setPopupMessage] = useState('');


  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole, user, setUser, setPopupMessage }}>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/addArticle" element={<AddArticle />} />
              <Route path="/article/:articleId" element={<Article />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/about" element={<About />} />
              <Route path="/archive" element={<Archive/>}/>
            </Routes>
          </main>
          <Footer />
          {popupMessage && <Popup message={popupMessage} />}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function ConfirmEmail() {
  const [popupMessage, setPopupMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL; // Backend-URL als Umgebungsvariable

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      fetch(`${backendUrl}/confirm-email?token=${token}`)
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
      <p><Link to="/about">About Flügelzange</Link></p>
    </footer>
  );
}

export default App;
