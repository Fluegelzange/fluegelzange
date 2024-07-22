// src/components/Article.js
import React from 'react';
import './Article.css';

const Article = ({ article }) => {
  return (
    <article className="article">
      <h2>{article.header}</h2>
      <pre>{article.value}</pre>
    </article>
  );
}

export default Article;
