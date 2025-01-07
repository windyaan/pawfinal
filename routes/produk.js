const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua produk
router.get('/', (req, res) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Endpoint untuk mendapatkan produk berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM produk WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Produk tidak ditemukan');
        res.json(results[0]);
    });
});

// Endpoint untuk menambahkan produk baru
router.post('/', (req, res) => {
    const { namapaket, stok, harga } = req.body;

    // Validasi input
    if (!namapaket || typeof namapaket !== 'string' || namapaket.trim() === '') {
        return res.status(400).send('Nama paket tidak valid');
    }
    if (typeof stok !== 'number' || stok < 0) {
        return res.status(400).send('Stok harus berupa angka positif');
    }
    if (typeof harga !== 'number' || harga < 0) {
        return res.status(400).send('Harga harus berupa angka positif');
    }

    db.query(
        'INSERT INTO produk (namapaket, stok, harga) VALUES (?, ?, ?)',
        [namapaket.trim(), stok, harga],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            const newProduct = { id: results.insertId, namapaket: namapaket.trim(), stok, harga };
            res.status(201).json(newProduct);
        }
    );
});

// Endpoint untuk memperbarui produk
router.put('/:id', (req, res) => {
    const { namapaket, stok, harga } = req.body;

    // Validasi input
    if (namapaket && (typeof namapaket !== 'string' || namapaket.trim() === '')) {
        return res.status(400).send('Nama paket tidak valid');
    }
    if (stok !== undefined && (typeof stok !== 'number' || stok < 0)) {
        return res.status(400).send('Stok harus berupa angka positif');
    }
    if (harga !== undefined && (typeof harga !== 'number' || harga < 0)) {
        return res.status(400).send('Harga harus berupa angka positif');
    }

    db.query(
        'UPDATE produk SET namapaket = COALESCE(?, namapaket), stok = COALESCE(?, stok), harga = COALESCE(?, harga) WHERE id = ?',
        [namapaket?.trim() || null, stok || null, harga || null, req.params.id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (results.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');
            res.json({ id: req.params.id, namapaket, stok, harga });
        }
    );
});

// Endpoint untuk menghapus produk
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM produk WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');
        res.status(204).send();
    });
});

module.exports = router;
