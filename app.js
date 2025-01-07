const express = require('express');
const app = express();
const ucptodoRoutes = require('./routes/produk.js');
require('dotenv').config();
const port = process.env.PORT;

const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts')

app.use(expressLayouts);
app.use(express.json());

app.use('/ucptodo', ucptodoRoutes)

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));


app.get('/',(req, res) => {  // kalo mau ke index harus login dulu 
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});

app.get('/pesan', (req, res) => {
    db.query('SELECT * FROM pesan', (err, pesan) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('pesan', {
            layout: 'layouts/main-layout',
            pesan: pesan // Kirim data 'pesan' ke view pesan.ejs
        });
    });
});

// Route untuk menambahkan pesan baru
app.post('/pesan', (req, res) => {
    const { namapaket, jumlah, nama, notelp } = req.body;

    // Validasi input
    if (!namapaket || !jumlah || !nama || !notelp) {
        return res.status(400).send('namapaket, jumlah, nama, dan notelp tidak boleh kosong');
    }

    const query = 'INSERT INTO pesan (namapaket, jumlah, nama, notelp) VALUES (?, ?, ?, ?)';

    db.query(query, [namapaket, jumlah, nama, notelp], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding message');
        }
        res.status(201).json({ id: result.insertId, namapaket, jumlah, nama, notelp }); // Send the newly created message
    });
});

// Route untuk menghapus pesan berdasarkan ID
app.delete('/pesan/:id', (req, res) => {
    const pesanId = req.params.id;
    const query = 'DELETE FROM pesan WHERE id = ?';

    db.query(query, [pesanId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting message');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Message not found');
        }
        res.status(200).send('Message deleted');
    });
});


app.get('/produk', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('produk', {
            layout: 'layouts/main-layout',
            produk: produk
        });
    });
});

// Route untuk menampilkan form edit produk
app.get('/editproduk/:id', (req, res) => {
    const produkId = req.params.id;
    db.query('SELECT * FROM produk WHERE id = ?', [produkId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('editproduk', {
            layout: 'layouts/main-layout',
            produk: result[0]
        });
    });
});

// Route untuk menangani form edit produk
app.post('/editproduk/:id', (req, res) => {
    const { namapaket, stok, harga } = req.body;
    const produkId = req.params.id;

    // Validasi input
    if (!namapaket || !stok || !harga) {
        return res.status(400).send('namapaket, stok, dan harga tidak boleh kosong');
    }

    db.query(
        'UPDATE produk SET namapaket = ?, stok = ?, harga = ? WHERE id = ?',
        [namapaket, stok, harga, produkId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/produk');  // Redirect ke halaman daftar produk setelah edit
        }
    );
});

// Route untuk menambahkan produk baru
app.post('/produk', (req, res) => {
    const { namapaket, stok, harga } = req.body;

       // Validasi input
       if (!namapaket || !stok || !harga) {
        return res.status(400).send('namapaket, stok, dan harga tidak boleh kosong');
    }

    const query = 'INSERT INTO produk (namapaket, stok, harga) VALUES (?, ?, ?)';
    
    db.query(query, [namapaket, stok, harga], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding visitor');
        }
        res.status(201).json({ id: result.insertId, namapaket, stok, harga }); // Send the newly created visitor
    });
});

// Route untuk menghapus produk berdasarkan ID
app.delete('/produk/:id', (req, res) => {
    const produkId = req.params.id;
    const query = 'DELETE FROM produk WHERE id = ?';

    db.query(query, [produkId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting visitor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Visitor not found');
        }
        res.status(200).send('Visitor deleted');
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

