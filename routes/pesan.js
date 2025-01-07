const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua pesan
router.get('/', (req, res) => {
    db.query('SELECT * FROM pesan', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Endpoint untuk mendapatkan pesan berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM pesan WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Pesan tidak ditemukan');
        res.json(results[0]);
    });
});

// Endpoint untuk menambahkan pesan baru
router.post('/', (req, res) => {
    const { namapaket, jumlah, notelp, nama } = req.body;

    // Validasi input
    if (!namapaket || typeof namapaket !== 'string' || namapaket.trim() === '') {
        return res.status(400).send('Nama paket tidak valid');
    }
    if (typeof jumlah !== 'number' || jumlah < 0) {
        return res.status(400).send('Jumlah harus berupa angka positif');
    }
    if (!notelp || typeof notelp !== 'string' || notelp.trim() === '' || notelp.length !== 12) {
        return res.status(400).send('Nomor telepon tidak valid');
    }
    if (!nama || typeof nama !== 'string' || nama.trim() === '') {
        return res.status(400).send('Nama pelanggan tidak valid');
    }

    db.query(
        'INSERT INTO pesan (namapaket, jumlah, notelp, nama) VALUES (?, ?, ?, ?)',
        [namapaket.trim(), jumlah, notelp.trim(), nama.trim()],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            const newPesan = { id: results.insertId, namapaket: namapaket.trim(), jumlah, notelp: notelp.trim(), nama: nama.trim() };
            res.status(201).json(newPesan);
        }
    );
});

// Endpoint untuk memperbarui pesan
router.put('/:id', (req, res) => {
    const { namapaket, jumlah, notelp, nama } = req.body;

    // Validasi input
    if (namapaket && (typeof namapaket !== 'string' || namapaket.trim() === '')) {
        return res.status(400).send('Nama paket tidak valid');
    }
    if (jumlah !== undefined && (typeof jumlah !== 'number' || jumlah < 0)) {
        return res.status(400).send('Jumlah harus berupa angka positif');
    }
    if (notelp && (typeof notelp !== 'string' || notelp.trim() === '' || notelp.length !== 12)) {
        return res.status(400).send('Nomor telepon tidak valid');
    }
    if (nama && (typeof nama !== 'string' || nama.trim() === '')) {
        return res.status(400).send('Nama pelanggan tidak valid');
    }

    db.query(
        'UPDATE pesan SET namapaket = COALESCE(?, namapaket), jumlah = COALESCE(?, jumlah), notelp = COALESCE(?, notelp), nama = COALESCE(?, nama) WHERE id = ?',
        [namapaket?.trim() || null, jumlah || null, notelp?.trim() || null, nama?.trim() || null, req.params.id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (results.affectedRows === 0) return res.status(404).send('Pesan tidak ditemukan');
            res.json({ id: req.params.id, namapaket, jumlah, notelp, nama });
        }
    );
});

// Endpoint untuk menghapus pesan
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM pesan WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Pesan tidak ditemukan');
        res.status(204).send();
    });
});

module.exports = router;
