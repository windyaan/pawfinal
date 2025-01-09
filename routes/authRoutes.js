const express = require('express');
const multer = require("multer");
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Middleware untuk sesi
const session = require('express-session');
router.use(
    session({
        secret: 'yourSecretKey', // Ganti dengan kunci rahasia yang kuat
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Ubah ke `true` jika menggunakan HTTPS
    })
);

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images"); // Folder tempat menyimpan file
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Rename file
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};

const upload = multer({ storage, fileFilter });

// Route Signup
router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Check if username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error checking user');
        }

        if (results.length > 0) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        bcrypt.hash(password, 10)
            .then(hash => {
                db.query(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [username, hash],
                    (err, result) => {
                        if (err) {
                            console.error('Error registering user:', err);
                            return res.status(500).send('Error registering user');
                        }
                        console.log('User registered successfully:', username);
                        res.redirect('/login');
                    }
                );
            })
            .catch(err => {
                console.error('Error hashing password:', err);
                return res.status(500).send('Error hashing password');
            });
    });
});

// Route untuk menampilkan form signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'layouts/main-layout',
    });
});

// Route Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        if (results.length === 0) {
            console.log('User not found:', username);
            return res.status(400).send('User not found');
        }

        // Compare the password
        bcrypt.compare(password, results[0].password)
            .then(isMatch => {
                if (!isMatch) {
                    console.log('Incorrect password for user:', username);
                    return res.status(401).send('Incorrect password');
                }

                // Store userId in session
                req.session.userId = results[0].id;
                req.session.username = username; // Optional: Save username in session
                console.log('User logged in successfully:', username);
                res.redirect('/'); // Redirect to homepage after login
            })
            .catch(err => {
                console.error('Error checking password:', err);
                return res.status(500).send('Error checking password');
            });
    });
});

// Route untuk menampilkan form login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout',
    });
});

// Middleware untuk melindungi route (hanya untuk pengguna yang login)
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/login');
}

// Route Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }
        console.log('User logged out successfully');
        res.redirect('/login'); // Redirect to login page after logout
    });
});

// Route Protected Example (gunakan middleware `isAuthenticated`)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.send(`Welcome ${req.session.username}, this is your dashboard!`);
});

module.exports = router;
