const db = require('../database/db');

// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/login'); // Arahkan ke halaman login jika belum login
  }
}

// Middleware untuk memeriksa role admin
function isAdmin(req, res, next) {
  if (!req.session || !req.session.username) {
    return res.redirect('/login'); // Arahkan ke login jika belum login
  }

  // Ambil role dari database berdasarkan username di sesi
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0) {
      console.error('User not found in the database.');
      return res.redirect('/login'); // Arahkan ke login jika user tidak ditemukan
    }

    if (results[0].role !== "admin") {
      console.warn('Access denied: user is not an admin.');
      return res.redirect('/home'); // Arahkan ke halaman user jika bukan admin
    }

    next(); // Lanjutkan ke route jika admin
  });
}

// Middleware untuk memeriksa role user
function isUser(req, res, next) {
  if (!req.session || !req.session.username) {
    return res.redirect('/login'); // Arahkan ke login jika belum login
  }

  // Ambil role dari database berdasarkan username di sesi
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0) {
      console.error('User not found in the database.');
      return res.redirect('/login'); // Arahkan ke login jika user tidak ditemukan
    }

    if (results[0].role !== "user") {
      console.warn('Access denied: user is not a regular user.');
      return res.redirect('/admin'); // Arahkan ke halaman admin jika bukan user
    }

    next(); // Lanjutkan ke route jika user
  });
}

// Middleware untuk memeriksa role dinamis (untuk role lain jika diperlukan)
function checkRole(requiredRole) {
  return (req, res, next) => {
    if (!req.session || !req.session.username) {
      return res.redirect('/login'); // Arahkan ke login jika belum login
    }

    // Ambil role dari database berdasarkan username di sesi
    const query = "SELECT role FROM users WHERE username = ?";
    db.query(query, [req.session.username], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send("Terjadi kesalahan server.");
      }

      if (results.length === 0) {
        console.error('User not found in the database.');
        return res.redirect('/login'); // Arahkan ke login jika user tidak ditemukan
      }

      if (results[0].role !== requiredRole) {
        console.warn(`Access denied: user does not have the role "${requiredRole}".`);
        return res.status(403).send('Access denied'); // Kirim pesan error jika tidak memiliki role
      }

      next(); // Lanjutkan ke route jika memiliki role yang sesuai
    });
  };
}

module.exports = { isAuthenticated, isAdmin, isUser, checkRole };
