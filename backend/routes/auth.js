const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post("/login", authController.login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get("/me", authMiddleware, authController.getMe);

// @route   POST /api/auth/register-student
// @desc    Register a new student (ADMIN ONLY)
router.post(
  "/register-student",
  authMiddleware,
  adminMiddleware,
  authController.registerStudent
);

module.exports = router;

