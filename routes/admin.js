const express = require("express");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();
const db = require("../database/db");

// Middleware untuk memeriksa role "admin"
function isAdmin(req, res, next) {
  if (req.session.role !== "admin") {
    return res.redirect("/index"); // Jika bukan admin, arahkan ke halaman user
  }
  next();
}

// Route untuk halaman utama admin
router.get("/", isAuthenticated, (req, res) => {
    const query = "SELECT * FROM produk"; // Query untuk mengambil semua data produk
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching produk");
      } else {
        // Kirimkan data film dan username ke view
        res.render("admin", {
          produk: results,
          username: req.session.username, // Pastikan username ada di session
        });
      }
    });
  });
  
module.exports = router;