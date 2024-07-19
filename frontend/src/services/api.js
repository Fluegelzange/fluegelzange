import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const fetchArticles = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  console.log("Articel", response.data)
  console.log(response.data[response.data.length-1]);
  return response.data;
};


export const fetchNewestArticle = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  console.log("Articel", response.data)
  console.log(response.data[response.data.length-1]);
  const newArticle=response.data[response.data.length-1]
  return newArticle;
};


export const fetchArticleById = async (id) => {
  const response = await axios.get(`${API_URL}/articles/${id}`);
  return response.data;
};

export const createArticle = async (article) => {
  const response = await axios.post(`${API_URL}/articles`, article);
  return response.data;
};
