const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/sportjournal', { useNewUrlParser: true, useUnifiedTopology: true });

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Article = mongoose.model('Article', articleSchema);

app.get('/articles', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) return res.status(500).send(err);
    res.json(articles);
  });
});

app.post('/articles', (req, res) => {
  const newArticle = new Article(req.body);
  newArticle.save((err, article) => {
    if (err) return res.status(500).send(err);
    res.status(201).json(article);
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
