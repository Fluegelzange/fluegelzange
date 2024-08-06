const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2; // Cloudinary einbinden
require('dotenv').config(); // dotenv einbinden

const app = express();

// Cloudinary Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Ersetze durch deinen Cloud-Namen
  api_key: process.env.CLOUD_API_KEY, // Ersetze durch deinen API-Schlüssel
  api_secret: process.env.CLOUD_API_SECRET // Ersetze durch dein API-Geheimnis
});

const client = new MongoClient(process.env.MONGO_URI, {
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

app.use(cors({
  origin: '*'//process.env.FRONTEND_URL // z.B. `https://deine-domain.com`
}));
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
      thumbnailUrl: req.body.thumbnailUrl,
      date: req.body.date
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
    const { username, email, password } = req.body;

    // Überprüfen, ob der Benutzername bereits existiert
    const existingUserByUsername = await client.db("fluegelzange").collection("user").findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Überprüfen, ob die E-Mail bereits existiert
    const existingUserByEmail = await client.db("fluegelzange").collection("user").findOne({ usermail: email });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Passwortvalidierung
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
    }

    const newUser = {
      _id: new ObjectId(),
      username,
      userrole: "user",
      usermail: email,
      passwort: password,
      verifziert: false
    };

    await client.db("fluegelzange").collection("user").insertOne(newUser);
    res.status(201).json({ success: true, message: 'User successfully created!' });

    const token = newUser._id.toString();

    // Bestätigungs-E-Mail senden
    // await EmailService.sendConfirmationEmail(newUser.usermail, newUser.username, token);

  } catch (err) {
    console.error("Error creating new user: ", err);
    res.status(500).send("Internal Server Error");
  }
});

//##################Google############

async function findUserByEmail(email) {
  try {
    const db = client.db('fluegelzange');
    const user = await db.collection('user').findOne({ usermail: email });

    return user;
  } catch (err) {
    console.error('Fehler beim Finden des Benutzers:', err);
    throw new Error('Fehler beim Finden des Benutzers');
  }
}

app.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // Überprüfe das Token bei Google
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const data = response.data;

    if (data.error) {
      return res.status(401).json({ message: 'Ungültiges Token' });
    }

    const { email, name } = data;

    // Prüfe, ob der Benutzer bereits existiert
    let user = await findUserByEmail(email);

    if (!user) {
      // Benutzer existiert nicht, erstelle einen neuen
      user = await createUser({ username: name, email, password: 'temporarypassword' }); // Setze ein temporäres Passwort

      if (user.error) {
        return res.status(400).json({ message: user.error });
      }
    }

    // Führe die Anmeldung durch und gib die Benutzerdaten zurück
    const userRole = 'user'; // Beispielrolle, hier anpassen
    res.json({
      userId: user._id.toString(),
      username: user.username,
      role: userRole,
    });
  } catch (error) {
    console.error('Fehler beim Google Login:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

async function createUser(userData) {
  try {
    const db = client.db('fluegelzange');
    
    const newUser = {
      _id: new ObjectId(),
      username: userData.username,
      userrole: 'user',
      usermail: userData.email,
      passwort: userData.password,
      mitgoogle: true, // In der realen Anwendung, pass auf, dass das Passwort gehasht wird
      verifziert: false
    };

    const result = await db.collection('user').insertOne(newUser);
    return newUser;
  } catch (err) {
    console.error("Fehler beim Erstellen des neuen Benutzers: ", err);
    throw new Error('Fehler beim Erstellen des neuen Benutzers');
  }
}

//#######################################################################

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
    const { articleId, userId, commentText, username } = req.body;

    if (!articleId || !userId || !commentText) {
      return res.status(400).send("Invalid request: Missing required fields");
    }

    const newComment = {
      articleId: articleId,
      userId: userId,
      username: username,
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

//Delete Kommentar

app.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Invalid request: Missing comment ID");
    }

    // Überprüfen, ob der Kommentar existiert und löschen
    const result = await client.db("fluegelzange").collection("comments").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send("Comment not found");
    }

    res.status(200).send("Comment deleted successfully");
  } catch (err) {
    console.error("Error deleting comment: ", err);
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
      .find({ articleId: articleId }) // Beachte, dass articleId als ObjectId konvertiert wird
      .toArray();

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error retrieving comments: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen( () => {
  console.log(`Server läuft auf ${process.env.SERVER_URL}`);
});