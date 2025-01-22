const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  }
});

const upload = multer({ storage });

// Rute GET untuk endpoint '/produk' yang akan menampilkan daftar produk
router.get('/produk', (req, res) => {
    // Query SQL untuk mengambil semua data dari tabel 'produk'
    const sql = 'SELECT * FROM produk';
    // Eksekusi query ke database
    db.query(sql, (err, results) => {
        // Jika terjadi error saat query, log error di console dan kirimkan respons 500 ke klien
        if (err) {
            console.error(err); // Debugging: Tampilkan error di console
            return res.status(500).send('Terjadi kesalahan'); // Respons 500 dengan pesan error
        }
        // Debugging: Tampilkan hasil query di console untuk memastikan data yang diambil benar
        console.log(results);
        // Kirimkan data hasil query ke template 'produk.ejs' untuk dirender sebagai halaman HTML
        res.render('produk', { produk: results });
    });
});


// Endpoint untuk mendapatkan semua produk
router.get('/', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('produk', {
            layout: 'layouts/main-layout',
            produk: produk // Kirim data 'produk' ke view produk.ejs
        });
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


// Route untuk menambahkan produk baru
router.post('/', (req, res) => {
    const { namapaket, stok, harga, images } = req.body;

    // Validasi input
    if (!namapaket || !stok || !harga || !images) {
        return res.status(400).send('namapaket, stok, harga, images tidak boleh kosong');
    }

    const query = 'INSERT INTO produk (namapaket, stok, harga, images) VALUES (?, ?, ?, ?)';

    db.query(query, [namapaket, stok, harga, images], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding message');
        }
        res.status(201).json({ id: result.insertId, namapaket, stok, harga, images}); // Send the newly created message
    });
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
    if (images !== undefined && (typeof images !== 'String' || images < 0)) {
        return res.status(400).send('Foto harus diisi');
    }

    db.query(
        'UPDATE produk SET namapaket = COALESCE(?, namapaket), stok = COALESCE(?, stok), harga = COALESCE(?, harga) WHERE id = ?',
        [namapaket?.trim() || null, stok || null, harga || null, images || null, req.params.id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (results.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');
            res.json({ id: req.params.id, namapaket, stok, harga, images });
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

