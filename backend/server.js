const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const client = new MongoClient(process.env.MONGO_URI, {
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
    process.exit(1);
  }
}
run().catch(console.dir);

const allowedOrigins = ['https://fluegel-zange.de', 'https://www.fluegel-zange.de'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

app.post('/upload-thumbnail', async (req, res) => {
  try {
    const { filePath } = req.body;
    const result = await cloudinary.uploader.upload(filePath);
    const thumbnailUrl = result.secure_url;
    res.status(201).json({ thumbnailUrl });
  } catch (err) {
    console.error("Error uploading thumbnail: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// Articles routes
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
    const article = await client.db("fluegelzange").collection("articles").findOne({ _id: new ObjectId(articleId) });
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

app.post('/user', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUserByUsername = await client.db("fluegelzange").collection("user").findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const existingUserByEmail = await client.db("fluegelzange").collection("user").findOne({ usermail: email });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _id: new ObjectId(),
      username,
      userrole: "user",
      usermail: email,
      passwort: hashedPassword, // Store hashed password
      verifziert: false
    };
 
    await client.db("fluegelzange").collection("user").insertOne(newUser);
    res.status(201).json({ success: true, message: 'User successfully created!' });

  } catch (err) {
    console.error("Error creating new user: ", err);
    res.status(500).send("Internal Server Error");
  }
});

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
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const data = response.data;

    if (data.error) {
      return res.status(401).json({ message: 'Ungültiges Token' });
    }

    const { email, name } = data;

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({ username: name, email, password: 'temporarypassword' });

      if (user.error) {
        return res.status(400).json({ message: user.error });
      }
    }

    const userRole = 'user';
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
      mitgoogle: true,
      verifziert: false
    };

    const result = await db.collection('user').insertOne(newUser);
    return newUser;
  } catch (err) {
    console.error("Fehler beim Erstellen des neuen Benutzers: ", err);
    throw new Error('Fehler beim Erstellen des neuen Benutzers');
  }
}

// Email confirmation route
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

    const updateResult = await client.db("fluegelzange").collection("user").updateOne(
      { _id: new ObjectId(token) },
      { $set: { verifziert: true } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.redirect('http://localhost:3000?verified=true');
    } else if (updateResult.matchedCount === 1 && user.verifziert) {
      return res.redirect('http://localhost:3000?verified=true');
    } else {
      return res.status(500).send("Fehler beim Aktualisieren des Nutzers");
    }
  } catch (err) {
    console.error("Fehler bei der E-Mail-Bestätigung: ", err);
    return res.status(500).send("Interner Serverfehler");
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await client.db("fluegelzange").collection("user").findOne({ username });

    if (!user) {
      return res.status(400).json("Benutzername oder Passwort ist falsch");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwort);
    if (!isPasswordValid) {
      return res.status(400).json("Benutzername oder Passwort ist falsch");
    }

    res.status(200).json({ message: "Login erfolgreich", userId: user._id, role: user.userrole, username: user.username });
  } catch (err) {
    console.error("Fehler beim Login:", err);
    res.status(500).send("Interner Serverfehler");
  }
});

// Comments routes
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

app.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Invalid request: Missing comment ID");
    }

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

app.get('/articles/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!ObjectId.isValid(articleId)) {
      return res.status(400).send("Invalid article ID");
    }

    const comments = await client.db("fluegelzange").collection("comments")
      .find({ articleId: articleId })
      .toArray();

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error retrieving comments: ", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000; // Dynamic port assignment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
