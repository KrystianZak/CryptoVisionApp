const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "my_secret_jwt_key";

// Middleware chroniący dostęp (sprawdza JWT w cookie lub header)
function requireLogin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  let token = null;

  if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
  if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

  if (!token) return res.redirect("/login");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

// Chroniony dostęp do strony głównej
router.get("/", requireLogin, pageController.getHomePage);

// Chroniony dostęp do wizualizera
router.get("/visualiser", requireLogin, pageController.getPortfolioPage);

// Chroniony dostęp do strony analizy
router.get("/analyzer", requireLogin, pageController.getAnalyzerPage);

module.exports = router;
