const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Sesuaikan dengan path ke database Anda

// Menggunakan router.get dan router.post
router.get('/', (req, res) => {  
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
router.post('/', (req, res) => {
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
router.delete('/:id', (req, res) => {
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

module.exports = router;
