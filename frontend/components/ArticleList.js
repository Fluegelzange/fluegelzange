// src/components/ArticleList.js
import React from 'react';
import Article from './Article';
import './ArticleList.css';

const ArticleList = ({ articles }) => {
  return (
    <section className="article-list">
      {articles.map((article) => (
        <Article key={article._id} article={article} />
      ))}
    </section>
  );
}

export default ArticleList;
