const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua pesan dan menampilkan di halaman produk
router.get('/', (req, res) => {
    db.query('SELECT * FROM pesan', (err, pesan) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        // Render data pesan ke halaman produk
        res.render('produk', {
            layout: 'layouts/main-layout',
            pesan: pesan // Kirim data 'pesan' ke view produk.ejs
        });
    });
});

// Endpoint untuk mendapatkan detail pesan berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM pesan WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(404).send('Pesanan tidak ditemukan');
        }
        res.render('detail-pesan', {
            layout: 'layouts/main-layout',
            pesan: results[0] // Kirim data pesan ke view produk.ejs
        });
    });
});

module.exports = router;
