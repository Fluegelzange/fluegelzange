// src/pages/SignIn.js
import React, { useState } from 'react';
import { createUser } from '../services/api';
import './SignIn.css';


const SignIn = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newUser = { username, email, password };
    const result = await createUser(newUser);
    console.log('User erfolgreich hinzugefügt!');
    alert(result);

    // Hier kannst du die Sign-In-Logik implementieren
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
    } else {
      console.log(`Username: ${username}, Email: ${email}, Password: ${password}`);
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
      </form>
    </div>
  );
}

export default SignIn;
