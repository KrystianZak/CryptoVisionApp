const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_jwt_key";

const login = (req, res) => {
  const { email, password } = req.body;

  // Prosty, obecny mechanizm walidacji użytkownika 
  if (email === "krystian.zak@mail.com" && password === "1234") {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "2h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  }

  res.status(401).send("Błędny login lub hasło");
};

module.exports = { login };
