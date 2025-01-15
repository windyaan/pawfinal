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
const { isAuthenticated, isUser, isAdmin } = require('./middlewares/middleware.js');
const cors = require('cors');
app.use(cors());

app.use(expressLayouts);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/pesan', ucptododb)
app.use('/produk', produk)
app.use('/menu', menu)
app.use("/", authRoutes); // Rute otentikasi

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/',(req, res) => {  // kalo mau ke index harus login dulu 
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});

app.get('/',(req,res)=>{
    res.render('pesan', {
        layout: 'layouts/main-layout'
    });
});

app.get('/menu',(req,res)=>{
    res.render('menu', {
        layout: 'layouts/main-layout'
    });
});

app.get('/pesanan',(req,res)=>{
    res.render('pesanan', {
        layout: 'layouts/main-layout'
    });
});

app.get('/produk',(req,res)=>{
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
