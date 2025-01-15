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
  
module.exports = router;