const db = require('../database/db'); // Mengimpor konfigurasi database untuk melakukan query

// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) { 
    // Jika sesi ada dan memiliki userId, lanjutkan ke middleware berikutnya
    return next();
  } else {
    // Jika tidak ada sesi atau userId, arahkan ke halaman login
    return res.redirect('/login'); 
  }
}

// Middleware untuk memeriksa role admin
function isAdmin(req, res, next) {
  if (!req.session || !req.session.username) {
    // Jika tidak ada sesi atau username, arahkan ke halaman login
    return res.redirect('/login');
  }

  // Query ke database untuk mendapatkan role berdasarkan username
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      // Jika terjadi kesalahan pada database, tampilkan pesan error
      console.error('Database error:', err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0) {
      // Jika user tidak ditemukan di database, arahkan ke halaman login
      console.error('User not found in the database.');
      return res.redirect('/login');
    }

    if (results[0].role !== "admin") {
      // Jika user tidak memiliki role "admin", arahkan ke halaman user
      console.warn('Access denied: user is not an admin.');
      return res.redirect('/home');
    }

    // Jika user adalah admin, lanjutkan ke middleware berikutnya
    next();
  });
}

// Middleware untuk memeriksa role user
function isUser(req, res, next) {
  if (!req.session || !req.session.username) {
    // Jika tidak ada sesi atau username, arahkan ke halaman login
    return res.redirect('/login');
  }

  // Query ke database untuk mendapatkan role berdasarkan username
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      // Jika terjadi kesalahan pada database, tampilkan pesan error
      console.error('Database error:', err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0) {
      // Jika user tidak ditemukan di database, arahkan ke halaman login
      console.error('User not found in the database.');
      return res.redirect('/login');
    }

    if (results[0].role !== "user") {
      // Jika user tidak memiliki role "user", arahkan ke halaman admin
      console.warn('Access denied: user is not a regular user.');
      return res.redirect('/admin');
    }

    // Jika user adalah user biasa, lanjutkan ke middleware berikutnya
    next();
  });
}

// Middleware untuk memeriksa role dinamis (dapat digunakan untuk role lain seperti 'moderator', 'editor', dll.)
function checkRole(requiredRole) {
  return (req, res, next) => {
    if (!req.session || !req.session.username) {
      // Jika tidak ada sesi atau username, arahkan ke halaman login
      return res.redirect('/login');
    }

    // Query ke database untuk mendapatkan role berdasarkan username
    const query = "SELECT role FROM users WHERE username = ?";
    db.query(query, [req.session.username], (err, results) => {
      if (err) {
        // Jika terjadi kesalahan pada database, tampilkan pesan error
        console.error('Database error:', err);
        return res.status(500).send("Terjadi kesalahan server.");
      }

      if (results.length === 0) {
        // Jika user tidak ditemukan di database, arahkan ke halaman login
        console.error('User not found in the database.');
        return res.redirect('/login');
      }

      if (results[0].role !== requiredRole) {
        // Jika user tidak memiliki role yang sesuai, kirim pesan error
        console.warn(`Access denied: user does not have the role "${requiredRole}".`);
        return res.status(403).send('Access denied');
      }

      // Jika user memiliki role yang sesuai, lanjutkan ke middleware berikutnya
      next();
    });
  };
}

module.exports = { isAuthenticated, isAdmin, isUser, checkRole }; // Ekspor middleware untuk digunakan di file lain
