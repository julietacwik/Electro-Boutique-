const pool = require("../db");

const VALID_STATUSES = new Set(["pending", "read", "replied"]);

function normalizeText(value) {
  return String(value || "").trim();
}

async function resolveClient({ name, email, phone }) {
  const normalizedEmail = email.toLowerCase();

  const [existingRows] = await pool.query(
    "SELECT id_client FROM clients WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  if (existingRows[0]) {
    await pool.query(
      "UPDATE clients SET name = ?, phone = ? WHERE id_client = ?",
      [name, phone || null, existingRows[0].id_client]
    );
    return existingRows[0].id_client;
  }

  const [result] = await pool.query(
    "INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)",
    [name, normalizedEmail, phone || null]
  );

  return result.insertId;
}

async function resolveProduct({ productId, productName }) {
  if (productId) {
    const [rows] = await pool.query(
      "SELECT id_product FROM products WHERE id_product = ? LIMIT 1",
      [productId]
    );
    return rows[0] ? rows[0].id_product : null;
  }

  if (!productName) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT id_product FROM products WHERE name = ? LIMIT 1",
    [productName]
  );

  if (rows[0]) {
    return rows[0].id_product;
  }

  const [result] = await pool.query(
    "INSERT INTO products (name, brand, category, description) VALUES (?, NULL, NULL, NULL)",
    [productName]
  );

  return result.insertId;
}

async function createInquiry(req, res, next) {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email);
    const phone = normalizeText(req.body.phone);
    const message = normalizeText(req.body.message);
    const productName = normalizeText(req.body.product);
    const productId = req.body.productId ? Number(req.body.productId) : null;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Nombre, email y mensaje son obligatorios."
      });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLooksValid) {
      return res.status(400).json({ error: "Ingresá un email valido." });
    }

    const clientId = await resolveClient({ name, email, phone });
    const resolvedProductId = await resolveProduct({ productId, productName });

    const [result] = await pool.query(
      "INSERT INTO inquiries (id_client, id_product, message, status) VALUES (?, ?, ?, 'pending')",
      [clientId, resolvedProductId, message]
    );

    return res.status(201).json({
      message: "Gracias. Tu mensaje fue enviado correctamente.",
      inquiryId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function getAllInquiries(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id_inquiry  AS id,
        i.message,
        i.status,
        i.created_at  AS createdAt,
        c.name,
        c.email,
        c.phone,
        p.name        AS productName
      FROM inquiries i
      INNER JOIN clients c ON c.id_client = i.id_client
      LEFT JOIN products p ON p.id_product = i.id_product
      ORDER BY i.created_at DESC, i.id_inquiry DESC
    `);

    res.json({ messages: rows });
  } catch (error) {
    next(error);
  }
}

async function deleteInquiry(req, res, next) {
  try {
    const inquiryId = Number(req.params.id);
    if (!inquiryId) {
      return res.status(400).json({ error: "ID invalido." });
    }
    const [result] = await pool.query(
      "DELETE FROM inquiries WHERE id_inquiry = ?",
      [inquiryId]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Consulta no encontrada." });
    }
    res.json({ message: "Mensaje eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}

async function updateInquiryStatus(req, res, next) {
  try {
    const inquiryId = Number(req.params.id);
    const status = normalizeText(req.body.status).toLowerCase();

    if (!inquiryId) {
      return res.status(400).json({ error: "ID invalido." });
    }

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({
        error: "Estado invalido. Usar pending, read o replied."
      });
    }

    const [result] = await pool.query(
      "UPDATE inquiries SET status = ? WHERE id_inquiry = ?",
      [status, inquiryId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Consulta no encontrada." });
    }

    res.json({ message: "Estado actualizado correctamente." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry
};
