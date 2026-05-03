const jwt = require("jsonwebtoken");
const pool = require("../db");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Érvénytelen token" });
  }
};

// Szerep-alapú hozzáférés vezérlés (RBAC)
const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Felhasználó adatainak lekérése az adatbázisból
      const result = await pool.query("SELECT role FROM users WHERE id = $1", [
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Felhasználó nem található" });
      }

      const userRole = result.rows[0].role;

      // Admin képes minden-hez hozzáférni
      if (userRole === "admin") {
        next();
        return;
      }

      // Szükséges szerep ellenőrzése
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return res
          .status(403)
          .json({ error: "Hozzáférés megtagadva - nincs jogosultsága" });
      }

      next();
    } catch (err) {
      console.error("RBAC hiba:", err);
      res.status(500).json({ error: "Szerver hiba" });
    }
  };
};

module.exports = { verifyToken, requireRole };
