const express = require('express');
const app = express();
const ucptododb = require('./routes/ucptododb.js');
const produk = require('./routes/produk.js');
const menu = require('./routes/menu.js');

require('dotenv').config();
const port = process.env.PORT;

const db = require('./database/db');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const expressLayouts = require('express-ejs-layouts')

//nambah
const session = require('express-session');

// Mengimpor middleware
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');

app.use(expressLayouts);
app.use(express.json());
app.use(express.static('public'));

app.use('/pesan', ucptododb)
app.use('/produk', produk)
app.use('/menu', menu)


app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));

// Menambahkan routes
app.use("/", authRoutes); // Rute otentikasi

app.use('/', authRoutes);
// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.get('/',isAuthenticated,(req, res) => {  // kalo mau ke index harus login dulu 
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});

app.get('/pesan',isAuthenticated,(req,res)=>{
    res.render('pesan', {
        layout: 'layouts/main-layout'
    });
});

app.get('/menu', isAuthenticated, (req, res) => {
    const query = 'SELECT namapaket, stok, harga FROM produk';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching menu');
            return;
        }
        // Render halaman menu dan kirim data produk ke view menu.ejs
        res.render('menu', {
            layout: 'layouts/main-layout',
            produk: results // Kirim data produk ke halaman menu.ejs
        });
    });
});


app.get('/produk',isAuthenticated,(req,res)=>{
    res.render('produk', {
        layout: 'layouts/main-layout'
    });
});

// Konfigurasi Multer (upload gambar)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images"); // Folder tempat menyimpan file
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Menambahkan timestamp untuk menghindari duplikasi nama file
    },
  });
  
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // File diterima jika tipe MIME sesuai
    } else {
      cb(new Error("Hanya gambar yang diperbolehkan"), false); // Menolak file jika bukan gambar
    }
  };
  
  const upload = multer({ storage, fileFilter });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

