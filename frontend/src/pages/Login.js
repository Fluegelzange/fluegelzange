import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setUserRole, setPopupMessage, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
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
      const res = await fetch('http://localhost:5000/google-login', {
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
        <GoogleOAuthProvider clientId="279923794458-53jtgbc8bf481v5d2gqro4do00thm28k.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={(error) => console.error('Fehler bei Google Login:', error)}
          />
        </GoogleOAuthProvider>
      </div>
      <div className="sign-in-link-container">
        <p>Kein Konto? <a href="/SignIn">Jetzt registrieren</a></p>
      </div>
    </div>
  );
}

export default Login;
