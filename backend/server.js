const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const staticRoot = path.resolve(__dirname, "..");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use("/api/inquiries", inquiryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(express.static(staticRoot));

app.get("/", (req, res) => {
  res.sendFile(path.join(staticRoot, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(staticRoot, "admin.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Electro Boutique backend running on http://localhost:${PORT}`);
});
