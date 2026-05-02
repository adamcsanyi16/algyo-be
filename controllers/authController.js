const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Üres mező ellenőrzése
  if (!name || !email || !password || !passwordConfirm) {
    return res.status(400).json({ error: "Minden mező kitöltése kötelező" });
  }

  // Név validáció
  if (name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "A név legalább 2 karakter hosszú kell legyen" });
  }

  if (name.length > 100) {
    return res
      .status(400)
      .json({ error: "A név maximum 100 karakter hosszú lehet" });
  }

  // Email validáció
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Érvénytelen email formátum" });
  }

  if (email.length > 100) {
    return res
      .status(400)
      .json({ error: "Az email maximum 100 karakter hosszú lehet" });
  }

  // Jelszó validáció
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: "A jelszavak nem egyeznek" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "A jelszó legalább 6 karakter hosszú kell legyen" });
  }

  if (password.length > 50) {
    return res
      .status(400)
      .json({ error: "A jelszó maximum 50 karakter hosszú lehet" });
  }

  try {
    const userExists = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ez az email már regisztrálva van" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Felhasználó hozzáadása az adatbázishoz (SQL injection elleni védelem: parameterized queries)
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name.trim(), email.toLowerCase(), hashedPassword, "user"],
    );

    // JWT token létrehozása
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Sikeres regisztráció",
      token,
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// Bejelentkezés
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validáció - üres mezők ellenőrzése
  if (!email || !password) {
    return res.status(400).json({ error: "Email és jelszó megadása kötelező" });
  }

  // Email formátum ellenőrzése
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Érvénytelen email formátum" });
  }

  // Jelszó hosszúság ellenőrzése
  if (password.length < 6) {
    return res.status(400).json({ error: "Érvénytelen bejelentkezési adatok" });
  }

  try {
    // Felhasználó keresése az adatbázisban (parameterized query - SQL injection védelem)
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      // Generic error message - titkosság védelme
      return res
        .status(400)
        .json({ error: "Érvénytelen bejelentkezési adatok" });
    }

    const user = result.rows[0];

    // Jelszó ellenőrzése
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Generic error message - titkosság védelme
      return res
        .status(400)
        .json({ error: "Érvénytelen bejelentkezési adatok" });
    }

    // JWT token létrehozása
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Sikeres bejelentkezés",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// Jelenlegi felhasználó adatainak lekérése
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// Kijelentkezés
exports.logout = (req, res) => {
  res.json({ message: "Sikeres kijelentkezés" });
};
