const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./config/db');
const path = require("path");
const port = 2121;

// Ganti dengan API key kamu
const apiKey = 'AIzaSyAueUa4JYREdT5IVQQVXlEBj7Jrldzw25E';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware untuk meng-handle JSON request
app.use(express.json());
app.use(express.static('public'));

// Rute untuk menangani permintaan chat pada fitur curhatyuk
app.post('/chat', async (req, res) => {
    const message = req.body.message;

    try {
        // Menambahkan instruksi untuk memastikan AI merespons dalam bahasa Indonesia dan hanya dengan topik kesehatan mental
        const mentalHealthPrompt = `jadilah seperti seorang taman atau psikolog temani user agar merasa nyaman . Pengguna mengatakan: ${message}`;
        
        // Mengirim prompt ke Gemini API dengan instruksi spesifik dalam bahasa Indonesia
        const result = await model.generateContent(mentalHealthPrompt);

        // Mengirimkan balasan ke frontend
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ reply: 'Error communicating with the server.' });
    }
});


// Middleware untuk mengatur template engine EJS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Atur folder 'public' sebagai folder untuk file statis
app.use('/public', express.static(path.join(__dirname, 'public')));

// Konfigurasi Session
app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: true,
    })
);


app.get("/", (req, res) => {
    res.render("index", { title: "Home Page" });
  });

// Halaman Register
app.get('/register', (req, res) => {
    res.render('register');
});

// Proses Register
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Error registering user.');
        }
        res.redirect('/login');
    });
});

// Halaman Login
app.get('/login', (req, res) => {
    res.render('login');
});

// Proses Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error logging in.');
        }
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            //return res.send('Invalid email or password.');
            return res.render('login', {
                errorMessage: 'Email atau password salah!'
            });
        }

        req.session.user = {
            id: results[0].id,
            username: results[0].username,
            email: results[0].email,
        };
        res.redirect('/');
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


// Halaman Chat (Hanya jika Login)
app.get('/curhatyuk', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('curhatyuk', { user: req.session.user });
});


app.listen(port, () => {
    console.log(`Server berjalan pada http://localhost:${port}`);
});
