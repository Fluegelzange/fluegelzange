import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const CLOUD_URL = process.env.REACT_APP_CLOUD_URL;

if (!backendUrl || !CLOUD_URL) {
  console.error("Umgebungsvariablen sind nicht korrekt definiert.");
}



//Artikel
export const fetchArticles = async () => {
  const response = await axios.get(`${backendUrl}/articles`);
  console.log("Articel", response.data)
  console.log(response.data[response.data.length-1]);
  return response.data;
};


export const fetchNewestArticle = async () => {
  const response = await axios.get(`${backendUrl}/articles`);
  console.log("Articel", response.data);
  console.log(response.data[response.data.length-1]);
  const newArticle=response.data[response.data.length-1]
  return newArticle;
};


export const fetchArticleById = async (id) => {
  try {
    const response = await fetch(`${backendUrl}/articles/${id}`);
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
  const response = await axios.post(`${backendUrl}/articles`, article);
  return response.data;
};


export const uploadThumbnail = async (formData) => {
  try {
    const response = await fetch(CLOUD_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudinary Response:', data); // Protokolliere die Cloudinary-Antwort
    return { thumbnailUrl: data.secure_url };
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};


//User
export const createUser = async (user) => {

  const { username, email, password } = user;

  if (!username || !email || !password) {
    throw new Error('Missing required fields');
  }

  // Passwort hashen
  
  const usermithash={
    username:user.username,
    email:user.email,
    password:user.password
  };

  const response = await axios.post(`${backendUrl}/user`, usermithash);
  console.log("Response from server: ", response);
  console.log(response.data);
  
  return response.data;
};


//User lOgin
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${backendUrl}/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error.response.data || 'Login failed';
  }
};

//Kommentare
// Kommentare für einen Artikel abrufen
export const fetchComments = async (articleId) => {
  try {
    const response = await axios.get(`${backendUrl}/articles/${articleId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

//Kommentar löschen
export const deleteComment = async (commentId) =>{
  try {
    const response = await axios.delete(`${backendUrl}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comments:', error);
    throw error;
  }
}


// Kommentar erstellen
export const createComment = async (comment) => {
  try {
    const response = await axios.post(`${backendUrl}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};