const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/programs", academicController.getPrograms);
router.post("/programs", authMiddleware, adminMiddleware, academicController.createProgram);

router.get("/semesters/:programId", academicController.getSemestersByProgram);
router.get("/semesters/all", authMiddleware, academicController.getAllSemesters);
router.post("/semesters", authMiddleware, adminMiddleware, academicController.createSemester);

router.get("/courses", authMiddleware, academicController.getAllCourses);
router.get("/courses/:semesterId", authMiddleware, academicController.getCoursesBySemester);
router.get("/course/:id", authMiddleware, academicController.getCourseById);
router.post("/courses", authMiddleware, adminMiddleware, academicController.createCourse);

module.exports = router;
