const express = require('express');
const app = express();
const ucptododb = require('./routes/ucptododb.js');
const produk = require('./routes/produk.js');
const menu = require('./routes/menu.js');

require('dotenv').config();
const port = process.env.PORT;

const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts')

//nambah
const session = require('express-session');
// Mengimpor middleware
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');

app.use(expressLayouts);
app.use(express.json());

app.use('/pesan', ucptododb)
app.use('/produk', produk)
app.use('/menu', menu)


app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.use('/', authRoutes);

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

app.get('/menu',isAuthenticated, (req, res) => {
    const query = 'SELECT namapaket, stok, harga FROM produk';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching menu');
            return;
        }
        res.json(results); // Mengirimkan data produk sebagai JSON
    });
});

app.get('/produk',isAuthenticated,(req,res)=>{
    res.render('produk', {
        layout: 'layouts/main-layout'
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

