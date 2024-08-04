const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2; // Cloudinary einbinden
const uri = "mongodb+srv://user1:user@cluster0.bge3kpm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();
const port = process.env.PORT || 5000;

// Cloudinary Konfiguration
cloudinary.config({
  cloud_name: 'dsw1adgtk', // Ersetze durch deinen Cloud-Namen
  api_key: 'QZO23z9UR0CBDTlRe6dgsWCbdQo', // Ersetze durch deinen API-Schlüssel
  api_secret: 'QZO23z9UR0CBDTlRe6dgsWCbdQo' // Ersetze durch dein API-Geheimnis
});

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

// Route für das Hochladen von Thumbnails
app.post('/upload-thumbnail', async (req, res) => {
  try {
    const { filePath } = req.body;

    // Hochladen zur Cloudinary
    const result = await cloudinary.uploader.upload(filePath);
    const thumbnailUrl = result.secure_url; // URL des hochgeladenen Thumbnails

    res.status(201).json({ thumbnailUrl });
  } catch (err) {
    console.error("Error uploading thumbnail: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// ++++++++++++++++++++Articles++++++++++++++++++++++
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
      value: req.body.value,
      thumbnailUrl: req.body.thumbnailUrl // Thumbnail-URL speichern
    };
    const result = await client.db("fluegelzange").collection("articles").insertOne(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Error creating new article: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// ++++++++++++++++++++++++++++++User++++++++++++++++++++++
app.post('/user', async (req, res) => {
  try {
    const newUser = {
      _id: new ObjectId(),
      username: req.body.username,
      userrole: "user",
      usermail: req.body.email,
      passwort: req.body.password,
      verifziert: false
    };

    const result = await client.db("fluegelzange").collection("user").insertOne(newUser);
    res.status(201).json(newUser);

    const token = newUser._id.toString();

    // Bestätigungs-E-Mail senden
    //await EmailService.sendConfirmationEmail(newUser.usermail, newUser.username, token);

  } catch (err) {
    console.error("Error creating new user: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// Verifizierung+Redirect
app.get('/confirm-email', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      console.error('Token fehlt in der Anfrage');
      return res.status(400).send('Ungültiger Token');
    }

    const user = await client.db("fluegelzange").collection("user").findOne({ _id: new ObjectId(token) });
    if (!user) {
      console.error('Nutzer nicht gefunden mit dem Token:', token);
      return res.status(404).send('Nutzer nicht gefunden');
    }

    // Logging vor dem Update
    console.log('Nutzer vor Update:', user);

    const updateResult = await client.db("fluegelzange").collection("user").updateOne(
      { _id: new ObjectId(token) },
      { $set: { verifziert: true } }
    );

    // Logging des Ergebnisses von updateOne
    console.log('Update-Ergebnis:', updateResult);

    if (updateResult.modifiedCount === 1) {
      console.log('Nutzer erfolgreich verifiziert:', token);
      // Umleitung zur Startseite mit verified Parameter
      return res.redirect('http://localhost:3000?verified=true');
    } else if (updateResult.matchedCount === 1 && user.verifziert) {
      console.log('Nutzer war bereits verifiziert:', token);
      // Umleitung zur Startseite mit verified Parameter
      return res.redirect('http://localhost:3000?verified=true');
    } else {
      console.error('Fehler beim Aktualisieren des Nutzers:', token);
      return res.status(500).send("Fehler beim Aktualisieren des Nutzers");
    }
  } catch (err) {
    console.error("Fehler bei der E-Mail-Bestätigung: ", err);
    return res.status(500).send("Interner Serverfehler");
  }
});

// ++++++++++USER++LOGIN++++++++++++++++++++++++
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Benutzer in der Datenbank suchen
    const user = await client.db("fluegelzange").collection("user").findOne({ username });

    if (!user) {
      console.error("Benutzer nicht gefunden:", username);
      return res.status(400).json("Benutzername oder Passwort ist falsch");
    }

    // Passwort überprüfen
    const isPasswordValid = await bcrypt.compare(password, user.passwort);
    if (!isPasswordValid) {
      console.error("Ungültiges Passwort für Benutzer:", username);
      return res.status(400).json("Benutzername oder Passwort ist falsch");
    }

    // Wenn alles korrekt ist, Rückmeldung geben
    res.status(200).json({ message: "Login erfolgreich", userId: user._id, role: user.userrole, username: user.username });
  } catch (err) {
    console.error("Fehler beim Login:", err);
    res.status(500).send("Interner Serverfehler");
  }
});

// ***************Kommentare*******************************
app.post('/comments', async (req, res) => {
  try {
    const { articleId, userId, commentText, userName } = req.body;

    if (!articleId || !userId || !commentText) {
      return res.status(400).send("Invalid request: Missing required fields");
    }

    const newComment = {
      articleId: articleId,
      userId: userId,
      username: userName,
      commentText: commentText,
      createdAt: new Date()
    };

    const result = await client.db("fluegelzange").collection("comments").insertOne(newComment);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error saving comment: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// Kommentare zu einem Artikel abrufen
app.get('/articles/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!ObjectId.isValid(articleId)) {
      return res.status(400).send("Invalid article ID");
    }

    const comments = await client.db("fluegelzange").collection("comments")
      .find({ articleId: new ObjectId(articleId) }) // Beachte, dass articleId als ObjectId konvertiert wird
      .toArray();

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error retrieving comments: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
