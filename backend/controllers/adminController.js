const User = require("../models/User");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");

// Dashboard Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalExams = await Exam.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalAttempts = await Attempt.countDocuments();

    // Pass rate rough estimate
    const passes = await Attempt.countDocuments({ status: "Pass" });
    let passRate = 0;
    if (totalAttempts > 0) {
      passRate = ((passes / totalAttempts) * 100).toFixed(2);
    }

    res.json({
      totalStudents,
      totalExams,
      totalCourses,
      totalAttempts,
      passRate
    });
  } catch (err) {
    res.status(500).json({ message: "Server error generating analytics" });
  }
};

exports.getAllAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate("student", "fullName username")
      .populate("exam", "title totalMarks");
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttemptDetails = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("student", "fullName username")
      .populate("exam", "title totalMarks passingMarks durationMinutes questions");

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
