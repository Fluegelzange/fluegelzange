import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { createComment, fetchArticleById, fetchComments } from '../services/api';
import './Article.css';

const Article = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [noCommentsMessage, setNoCommentsMessage] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const getArticleAndComments = async () => {
      try {
        const [fetchedArticle, fetchedComments] = await Promise.all([
          fetchArticleById(articleId),
          fetchComments(articleId)
        ]);

        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Artikel nicht gefunden');
        }

        if (fetchedComments.length === 0) {
          setNoCommentsMessage(true);
        } else {
          setComments(fetchedComments);
          setNoCommentsMessage(false);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen von Daten:', error);
        setError('Fehler beim Abrufen von Daten');
      }
    };

    getArticleAndComments();
  }, [articleId]);

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      // Zur Login-Seite weiterleiten, falls der Benutzer nicht authentifiziert ist
      // navigate('/login'); // Stelle sicher, dass du `useNavigate` verwendest, um zu navigieren
      return;
    }

    // Überprüfe, ob das user-Objekt und user.userId vorhanden sind
    if (!user.username || !user.userId) {
      console.error('Benutzer ist nicht angemeldet oder Benutzer-ID fehlt');
      return;
    }

    try {
      const newComment = {
        articleId,
        userId: user.userId, // Benutzer-ID aus dem Auth-Kontext
        username: user.username, // Benutzername aus dem Auth-Kontext
        commentText: comment
      };

      const createdComment = await createComment(newComment);
      setComments([...comments, createdComment]);
      setComment('');
      setNoCommentsMessage(false); // Kommentarmeldung zurücksetzen
    } catch (error) {
      console.error('Fehler beim Erstellen des Kommentars:', error);
      // Hier könntest du eine Fehlermeldung anzeigen
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!article) {
    return <p>Artikel wird geladen...</p>;
  }

  return (
    <div className="article-container">
      <Link to="/" className="back-link">Zurück zur Startseite</Link>
      <h1>{article.header}</h1>
      {article.thumbnailUrl && (
        <img src={article.thumbnailUrl} alt="Artikel Thumbnail" className="article-thumbnail" />
      )}
      <p>{article.value}</p>

      <div className="comment-section">
        <h2>Kommentare</h2>
        <div className="comment-form">
          {isAuthenticated ? (
            <>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Schreibe einen Kommentar..."
                rows="3"
              ></textarea>
              <button onClick={handleCommentSubmit}>Abschicken</button>
            </>
          ) : (
            <p>
              <Link to="/login" className="login-link">Melde dich an</Link>, um einen Kommentar zu schreiben.
            </p>
          )}
        </div>
        <div className="comments-list">
          {noCommentsMessage ? (
            <p>Es wurden noch keine Kommentare zu diesem Artikel gepostet</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="comment">
                <strong>{c.username}:</strong> <span>{c.commentText}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Article;
