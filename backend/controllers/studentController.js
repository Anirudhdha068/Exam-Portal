const User = require("../models/User");
const Course = require("../models/Course");
const Attempt = require("../models/Attempt");
const Certificate = require("../models/Certificate");

// --- Admin Endpoints ---

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate("program semester");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { fullName, email, program, semester, courses } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, program, semester, courses },
      { new: true }
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to update student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete student" });
  }
};

// --- Student Specific Endpoints ---

exports.getMyDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    
    let courses;
    if (student.courses && student.courses.length > 0) {
       courses = await Course.find({ _id: { $in: student.courses } }).populate("program semester");
    } else {
       // fallback if no explicitly mapped courses
       courses = await Course.find({ 
         program: student.program, 
         semester: student.semester 
       }).populate("program semester");
    }

    const attempts = await Attempt.find({ student: student._id }).populate({
      path: "exam",
      populate: { path: "course", select: "title" }
    });
    const certificates = await Certificate.find({ student: student._id }).populate("exam");

    res.json({
      courses,
      attempts,
      certificates
    });
  } catch (err) {
    res.status(500).json({ message: "Server error loading dashboard data" });
  }
};
