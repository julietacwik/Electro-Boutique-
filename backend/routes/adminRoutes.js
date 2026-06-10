const express = require("express");
const {
  getAllInquiries,
  updateInquiryStatus
} = require("../controllers/inquiryController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/inquiries", requireAuth, getAllInquiries);
router.patch("/inquiries/:id/status", requireAuth, updateInquiryStatus);

module.exports = router;
