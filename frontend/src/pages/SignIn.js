import React, { useState } from 'react';
import { createUser } from '../services/api';
import './SignIn.css';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const validatePassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setFeedback("Passwort muss mindestens 8 Zeichen lang sein und sowohl Zahlen als auch Buchstaben enthalten.");
      return;
    }

    if (password !== confirmPassword) {
      setFeedback("Passwords do not match!");
      return;
    }

    try {
      const newUser = { username, email, password };
      const result = await createUser(newUser);
      if (result.success) {
        setFeedback("User successfully created!");
      } else {
        setFeedback(result.message); // Feedback from server (e.g., username or email already exists)
      }
    } catch (error) {
      console.error("Error creating user: ", error);
      setFeedback("Nutzername oder Mailadresse schon registriert.");
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </form>
    </div>
  );
}

export default SignIn;
