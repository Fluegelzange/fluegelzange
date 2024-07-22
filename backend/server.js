const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://user1:user@cluster0.bge3kpm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();
const port = process.env.PORT || 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());



//++++++++++++++++++++Articles++++++++++++++++++++++
app.get('/articles', async (req, res) => {
  try {
    const articles = await client.db("fluegelzange").collection("articles").find().toArray();
    res.json(articles);
  } catch (err) {
    console.error("Error fetching articles: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    console.log(articleId);
    const article = await client.db("fluegelzange").collection("articles").findOne({ _id: new ObjectId(articleId) });
    console.log("Artikel", article);
    if (!article) {
      return res.status(404).send("Article not found");
    }
    res.json(article);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/articles', async (req, res) => {
  try {
    const newArticle = {
      _id: new ObjectId(),
      header: req.body.header,
      value: req.body.value
    };
    const result = await client.db("fluegelzange").collection("articles").insertOne(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Error creating new article: ", err);
    res.status(500).send("Internal Server Error");
  }
});



//++++++++++++++++++++++++++++++USer++++++++++++++++++++++
app.post('/user', async (req, res) => {
  try {
    const newArticle = {
      _id: new ObjectId(),
      username: req.body.username,
      userrole: "user",
      usermail: req.body.email,
      passwort: req.body.password,
      verifziert:false
    };
    const result = await client.db("fluegelzange").collection("user").insertOne(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Error creating new article: ", err);
    res.status(500).send("Internal Server Error");
  }
});




app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
