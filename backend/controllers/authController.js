const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const crypto = require("crypto");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("program", "name")
      .populate("semester", "name")
      .populate("courses", "title code")
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { username, password, loginType } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, fullName: user.fullName });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.registerStudent = async (req, res) => {
  const { fullName, email, username, semester, program, courses } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required to dispatch credentials" });
    }

    let user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ message: "User already exists with this username" });
    }

    // Auto-generate password
    const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 characters randomly

    user = new User({
      fullName,
      email,
      username,
      password: generatedPassword, // Temporary assignment
      role: "student",
      semester,
      program,
      courses: courses ? (Array.isArray(courses) ? courses : [courses]) : [],
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(generatedPassword, salt);

    await user.save();

    // Send email with credentials
    try {
      const message = `Hello ${fullName},\n\nYour student account has been created for the Exam Portal.\n\nUsername: ${username}\nPassword: ${generatedPassword}\n\nPlease log in and change your password as soon as possible.`;
      
      await sendEmail({
        email: user.email,
        subject: 'Exam Portal - Student Account Credentials',
        message
      });
    } catch (emailError) {
      console.error("Email dispatch failed:", emailError);
      return res.status(201).json({ message: "Student registered but failed to send email. Password is: " + generatedPassword, studentId: user.id });
    }

    res.json({ message: "Student registered successfully and credentials emailed.", studentId: user.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
