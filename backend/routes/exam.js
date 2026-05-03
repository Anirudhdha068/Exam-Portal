const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.post("/create", authMiddleware, adminMiddleware, examController.createExam);
router.get("/all", authMiddleware, adminMiddleware, examController.getAllExams);
router.get("/course/:courseId", authMiddleware, examController.getExamsByCourse);
router.patch("/:id/toggle-status", authMiddleware, adminMiddleware, examController.toggleStatus);
router.get("/:id", authMiddleware, examController.getExamDetails);
router.put("/:id", authMiddleware, adminMiddleware, examController.updateExam);
router.delete("/:id", authMiddleware, adminMiddleware, examController.deleteExam);
router.post("/submit", authMiddleware, examController.submitExam);

module.exports = router;
