import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setUserRole, setPopupMessage, setUser, user } = useContext(AuthContext);
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
        console.log(data); // Annahme: die Antwort enthält { token, role, userId, username }
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUser({
          userId: data.userId, // Benutzer-ID aus der Antwort
          username: data.username // Benutzername aus der Antwort
        });
        console.log(user);
        setPopupMessage(`Willkommen zurück, ${username}!`);
        navigate('/');
      } else {
        alert('Benutzername oder Passwort ist falsch.');
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
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
    </div>
  );
}

export default Login;
