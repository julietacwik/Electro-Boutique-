const express = require("express");
const { getAllInquiries, updateInquiryStatus, deleteInquiry } = require("../controllers/inquiryController");
const { adminLogin } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", adminLogin);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: { email: req.admin.email, id_admin: req.admin.id_admin } });
});

router.get("/messages", requireAuth, getAllInquiries);
router.patch("/messages/:id", requireAuth, updateInquiryStatus);
router.delete("/messages/:id", requireAuth, deleteInquiry);

module.exports = router;
