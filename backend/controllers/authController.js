const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

async function adminLogin(req, res, next) {
  try {
    const identifier = String(req.body.identifier || req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios." });
    }

    const [rows] = await pool.query(
      "SELECT id_admin, email, password_hash FROM admins WHERE email = ? LIMIT 1",
      [identifier]
    );

    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ error: "Credenciales invalidas." });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Credenciales invalidas." });
    }

    const token = jwt.sign(
      { id_admin: admin.id_admin, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000
    });

    return res.json({ ok: true, admin: { id_admin: admin.id_admin, email: admin.email } });
  } catch (error) {
    next(error);
  }
}

module.exports = { adminLogin };
