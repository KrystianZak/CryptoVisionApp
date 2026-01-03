const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

// Logowanie użytkownika
router.post("/login", login);

// Wylogowanie użytkownika
router.get("/logout", (req, res) => {
  // Usuń token JWT (cookie) po wylogowaniu
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
