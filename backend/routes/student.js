const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Admin Only
router.get("/all", authMiddleware, adminMiddleware, studentController.getAllStudents);
router.put("/:id", authMiddleware, adminMiddleware, studentController.updateStudent);
router.delete("/:id", authMiddleware, adminMiddleware, studentController.deleteStudent);

// Student Request
router.get("/dashboard", authMiddleware, studentController.getMyDashboard);

module.exports = router;
