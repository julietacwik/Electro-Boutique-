const jwt = require("jsonwebtoken");

function extractToken(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookieEntry = cookieHeader.split(";").find(c => c.trim().startsWith("token="));
  if (cookieEntry) {
    return cookieEntry.trim().slice("token=".length);
  }
  const [scheme, bearer] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && bearer ? bearer : null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "No autorizado." });
  }
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalido o vencido." });
  }
}

module.exports = { requireAuth };
