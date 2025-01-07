const express = require('express');
const router = express.Router();
const db = require('../db'); // Sesuaikan dengan path ke database Anda

// Endpoint untuk menambahkan produk baru
router.post('/', (req, res) => {
    const { namapaket, stok, harga } = req.body;
    if (!namapaket || namapaket.trim() === '') {
        return res.status(400).send('Nama paket tidak boleh kosong');
    }
    if (stok < 0 || harga < 0) {
        return res.status(400).send('Stok dan harga harus lebih besar atau sama dengan 0');
    }

    db.query('INSERT INTO produk (namapaket, stok, harga) VALUES (?, ?, ?)', [namapaket.trim(), stok, harga], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        const newProduct = { id: results.insertId, namapaket: namapaket.trim(), stok, harga };
        res.status(201).json(newProduct);
    });
});

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

// Endpoint untuk memperbarui produk
router.put('/:id', (req, res) => {
    const { namapaket, stok, harga } = req.body;

    if (stok < 0 || harga < 0) {
        return res.status(400).send('Stok dan harga harus lebih besar atau sama dengan 0');
    }

    db.query('UPDATE produk SET namapaket = ?, stok = ?, harga = ? WHERE id = ?', [namapaket, stok, harga, req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');
        res.json({ id: req.params.id, namapaket, stok, harga });
    });
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
