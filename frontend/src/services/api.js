import axios from 'axios';
import bcrypt from 'bcryptjs';

const API_URL = 'http://localhost:5000';



//Artikel
export const fetchArticles = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  console.log("Articel", response.data)
  console.log(response.data[response.data.length-1]);
  return response.data;
};


export const fetchNewestArticle = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  console.log("Articel", response.data);
  console.log(response.data[response.data.length-1]);
  const newArticle=response.data[response.data.length-1]
  return newArticle;
};


export const fetchArticleById = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/articles/${id}`);
    if (!response.ok) {
      throw new Error('Netzwerkantwort war nicht ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen des Artikels:', error);
    throw error;
  }
};





export const createArticle = async (article) => {
  const response = await axios.post(`${API_URL}/articles`, article);
  return response.data;
};
//Artikel Ende

//User
export const createUser = async (user) => {

  const { username, email, password } = user;

  if (!username || !email || !password) {
    throw new Error('Missing required fields');
  }

  // Passwort hashen
  const hashPassword = await bcrypt.hash(password, 10); // 10 ist die Anzahl der Salt-Runden
  
  // Ausgabe des Hashes in der Konsole
  console.log('Hashed Password:', hashPassword); 
  const usermithash={
    username:user.username,
    email:user.email,
    password:hashPassword
  };
  const response = await axios.post(`${API_URL}/user`, usermithash);
    
  
  return response.data;
};


//User lOgin
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error.response.data || 'Login failed';
  }
};