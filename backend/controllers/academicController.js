const Program = require("../models/Program");
const Semester = require("../models/Semester");
const Course = require("../models/Course");

// --- Program Logic ---
exports.createProgram = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Program name is required" });
    }
    const existing = await Program.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(409).json({ message: "Program with this name already exists" });
    }
    const program = new Program({ name: name.trim(), description });
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create program" });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- Semester Logic ---
exports.createSemester = async (req, res) => {
  try {
    const { name, programId } = req.body;
    if (!name || name.trim() === "" || !programId) {
      return res.status(400).json({ message: "Semester name and program are required" });
    }
    const existing = await Semester.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      program: programId,
    });
    if (existing) {
      return res.status(409).json({ message: "Semester with this name already exists for the selected program" });
    }
    const semester = new Semester({ name: name.trim(), program: programId });
    await semester.save();
    res.status(201).json(semester);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create semester" });
  }
};

exports.getSemestersByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const semesters = await Semester.find({ program: programId });
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().populate("program", "name");
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- Course Logic ---
exports.createCourse = async (req, res) => {
  try {
    const { title, code, programId, semesterId } = req.body;
    if (!title || !code || !programId || !semesterId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await Course.findOne({ code: { $regex: new RegExp(`^${code.trim()}$`, "i") } });
    if (existing) {
      return res.status(409).json({ message: "Course with this code already exists" });
    }
    const course = new Course({ title: title.trim(), code: code.trim(), program: programId, semester: semesterId });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create course" });
  }
};

exports.getCoursesBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const courses = await Course.find({ semester: semesterId }).populate("program semester");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("program semester");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("program", "name description")
      .populate("semester", "name");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching course details" });
  }
};
