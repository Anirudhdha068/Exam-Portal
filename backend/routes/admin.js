const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/analytics", authMiddleware, adminMiddleware, adminController.getAnalytics);
router.get("/attempts", authMiddleware, adminMiddleware, adminController.getAllAttempts);
router.get("/attempt/:id", authMiddleware, adminMiddleware, adminController.getAttemptDetails);

module.exports = router;
