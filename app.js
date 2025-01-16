const express = require('express'); // Mengimpor Express.js framework
const app = express(); // Membuat instance aplikasi Express
const ucptododb = require('./routes/ucptododb.js'); // Mengimpor rute untuk pengolahan data input ke database
const produk = require('./routes/produk.js'); // Mengimpor rute untuk produk
const menu = require('./routes/menu.js'); // Mengimpor rute untuk menu

require('dotenv').config(); // Menggunakan dotenv untuk membaca variabel lingkungan dari file .env
const port = process.env.PORT; // Menyimpan port yang digunakan dari variabel lingkungan

const db = require('./database/db'); // Mengimpor konfigurasi koneksi database
const multer = require("multer"); // Mengimpor Multer untuk menangani upload file
const path = require("path"); // Mengimpor module path untuk menangani path file
const fs = require("fs"); // Mengimpor module File System untuk manipulasi file
const expressLayouts = require('express-ejs-layouts'); // Mengimpor middleware untuk layout EJS

// Mengimpor session untuk menangani sesi pengguna
const session = require('express-session'); 

// Mengimpor rute otentikasi dan middleware
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');

// Middleware untuk menggunakan layout EJS, parsing JSON, dan melayani file statis
app.use(expressLayouts); // Menggunakan express-ejs-layouts untuk layout EJS
app.use(express.json()); // Middleware untuk parsing JSON
app.use(express.static(path.join(__dirname, 'public'))); // Middleware untuk melayani file statis dari folder public

// Menggunakan rute yang telah didefinisikan
app.use('/pesan', ucptododb); // Rute untuk ucptododb
app.use('/produk', produk); // Rute untuk produk
app.use('/menu', menu); // Rute untuk menu

// Mengonfigurasi engine tampilan EJS
app.set('view engine','ejs'); // Menggunakan EJS sebagai view engine
app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing data URL-encoded dari form

// Menambahkan rute untuk autentikasi
app.use("/", authRoutes); // Rute utama untuk autentikasi

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Kunci rahasia untuk session
    resave: false, // Jangan simpan ulang session jika tidak ada perubahan
    saveUninitialized: false, // Jangan simpan session yang belum diinisialisasi
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

// Rute untuk halaman utama, hanya bisa diakses jika terautentikasi
app.get('/', isAuthenticated, (req, res) => { 
    res.render('index', { // Render halaman index.ejs dengan layout 'main-layout'
        layout: 'layouts/main-layout'
    });
});

// Rute untuk halaman pesan, hanya bisa diakses jika terautentikasi
app.get('/pesan', isAuthenticated, (req, res) => {
    res.render('pesan', { // Render halaman pesan.ejs dengan layout 'main-layout'
        layout: 'layouts/main-layout'
    });
});

// Rute untuk halaman menu, hanya bisa diakses jika terautentikasi
app.get('/menu', isAuthenticated, (req, res) => {
    const query = 'SELECT namapaket, stok, harga FROM produk'; // Query untuk mengambil data produk dari database
    db.query(query, (err, results) => { // Query ke database
        if (err) { // Jika terjadi error
            res.status(500).send('Error fetching menu'); // Mengirimkan respons error
            return;
        }
        // Render halaman menu.ejs dan kirimkan data produk
        res.render('menu', {
            layout: 'layouts/main-layout',
            produk: results // Kirim data produk ke halaman menu.ejs
        });
    });
});

// Rute untuk halaman pesanan, hanya bisa diakses jika terautentikasi
app.get('/pesanan', isAuthenticated, (req, res) => {
    const query = 'SELECT nama, namapaket, notelp, jumlah FROM pesan'; // Query untuk mengambil data pesanan dari database
    db.query(query, (err, results) => { // Query ke database
        if (err) { // Jika terjadi error
            res.status(500).send('Error fetching menu'); // Mengirimkan respons error
            return;
        }
        // Render halaman pesanan.ejs dan kirimkan data pesan
        res.render('pesanan', {
            layout: 'layouts/main-layout',
            pesan: results // Kirim data pesanan ke halaman pesanan.ejs
        });
    });
});

// Rute untuk halaman produk, hanya bisa diakses jika terautentikasi
app.get('/produk', isAuthenticated, (req, res) => {
    res.render('produk', { // Render halaman produk.ejs dengan layout 'main-layout'
        layout: 'layouts/main-layout'
    });
});

// Konfigurasi Multer untuk menangani upload file (gambar)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // Tempat penyimpanan file yang diupload
      cb(null, "public/images"); // Menyimpan file di folder public/images
    },
    filename: function (req, file, cb) { // Menetapkan nama file yang diupload
      cb(null, file.originalname); // Menggunakan nama file asli
    },
  });
  
// Filter untuk menerima hanya gambar dengan format tertentu
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]; // Jenis file yang diperbolehkan
    if (allowedTypes.includes(file.mimetype)) { // Cek tipe MIME file
      cb(null, true); // Terima file jika sesuai
    } else {
      cb(new Error("Hanya gambar yang diperbolehkan"), false); // Tolak file selain gambar
    }
};
  
const upload = multer({ storage, fileFilter }); // Membuat instance multer dengan konfigurasi yang telah ditetapkan

// Menjalankan server pada port yang telah ditentukan
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`); // Menampilkan pesan di console jika server berjalan
});
