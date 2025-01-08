const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua produk dan menampilkan di halaman menu
router.get('/', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        // Render data produk ke halaman menu
        res.render('menu', {
            layout: 'layouts/main-layout',
            produk: produk // Kirim data 'produk' ke view menu.ejs
        });
    });
});

// Endpoint untuk mendapatkan detail produk berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM produk WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(404).send('Produk tidak ditemukan');
        }
        res.render('detail-produk', {
            layout: 'layouts/main-layout',
            produk: results[0] // Kirim data produk ke view detail-produk.ejs
        });
    });
});

module.exports = router;
