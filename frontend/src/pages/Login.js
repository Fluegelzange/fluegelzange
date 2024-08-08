import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setUserRole, setPopupMessage, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Backend-URL als Umgebungsvariable

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUser({
          userId: data.userId,
          username: data.username
        });
        setPopupMessage(`Willkommen zurück, ${username}!`);
        navigate('/');
      } else {
        alert('Benutzername oder Passwort ist falsch.');
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await fetch(`${backendUrl}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUser({
          userId: data.userId,
          username: data.username
        });
        setPopupMessage(`Willkommen zurück, ${data.username}!`);
        navigate('/');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Ein Fehler ist aufgetreten.');
      }
    } catch (error) {
      console.error('Fehler bei Google Login:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div className="google-login-container">
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={(error) => console.error('Fehler bei Google Login:', error)}
          />
        </GoogleOAuthProvider>
      </div>
      <div className="sign-in-link-container">
      <p>Kein Konto? <Link to="/signin">Jetzt registrieren</Link></p>
            </div>
    </div>
  );
}

export default Login;
