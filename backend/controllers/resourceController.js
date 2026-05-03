const Resource = require("../models/Resource");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists (absolute path from project root)
const uploadPath = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadPath, { recursive: true });

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "text/plain"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, PNG, and TXT files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Wrapper to handle multer errors gracefully
exports.upload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

exports.uploadResource = async (req, res) => {
  try {
    const { title, type, externalLink, course, program, semester } = req.body;

    if (!title || !type || !course || !program || !semester) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const resource = new Resource({
      title,
      type,
      externalLink: externalLink || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      course,
      program,
      semester,
      uploadedBy: req.user.id
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload resource" });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("course", "title code")
      .populate("program", "name")
      .populate("semester", "name")
      .populate("uploadedBy", "fullName");
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentResources = async (req, res) => {
  try {
    const User = require("../models/User");
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const query = { course: { $in: student.courses || [] } };
    const resources = await Resource.find(query)
      .populate("course", "title code")
      .populate("program", "name")
      .populate("semester", "name");
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

