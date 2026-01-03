const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_jwt_key";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  let token = null;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Brak tokena autoryzacyjnego" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Nieprawidłowy token" });
  }
}

module.exports = authMiddleware;
