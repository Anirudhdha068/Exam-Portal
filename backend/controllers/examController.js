const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");
const Certificate = require("../models/Certificate");

exports.createExam = async (req, res) => {
  try {
    const { title, course, semester, durationMinutes, totalMarks, passingMarks, questions } = req.body;
    const exam = new Exam({
      title, 
      course, 
      semester, 
      durationMinutes, 
      totalMarks, 
      passingMarks, 
      questions,
      isActive: false
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: "Failed to create exam" });
  }
};

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("course semester").select("-questions.correctAnswer");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (exam.isActive === true) {
      return res.status(403).json({ message: "Active exams cannot be modified or deleted" });
    }
    const { title, course, semester, durationMinutes, totalMarks, passingMarks, questions } = req.body;
    if (title !== undefined) exam.title = title;
    if (course !== undefined) exam.course = course;
    if (semester !== undefined) exam.semester = semester;
    if (durationMinutes !== undefined) exam.durationMinutes = durationMinutes;
    if (totalMarks !== undefined) exam.totalMarks = totalMarks;
    if (passingMarks !== undefined) exam.passingMarks = passingMarks;
    if (questions !== undefined) exam.questions = questions;
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Failed to update exam" });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (exam.isActive === true) {
      return res.status(403).json({ message: "Active exams cannot be modified or deleted" });
    }
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting exam" });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    exam.isActive = !exam.isActive;
    await exam.save();
    res.json({ message: `Exam is now ${exam.isActive ? "Active" : "Inactive"}`, exam });
  } catch (err) {
    res.status(500).json({ message: "Server error toggling status" });
  }
};

exports.getExamsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const exams = await Exam.find({ course: courseId, isActive: true })
      .populate("course", "title code")
      .populate("semester", "name")
      .select("-questions.correctAnswer");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getExamDetails = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).select("-questions.correctAnswer");
    if (!exam) return res.status(404).json({ message: "Not found" });
    if (!exam.isActive && req.user.role !== "admin") {
      return res.status(403).json({ message: "This exam is currently unavailable" });
    }
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    // answers is array of { questionId, selectedAnswer }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (!exam.isActive) {
      return res.status(403).json({ message: "This exam is currently inactive and cannot be submitted" });
    }

    let score = 0;
    exam.questions.forEach((q) => {
      const studentAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
      if (studentAnswer && studentAnswer.selectedAnswer === q.correctAnswer) {
        // distribute marks evenly for now
        score += (exam.totalMarks / exam.questions.length);
      }
    });

    const status = score >= exam.passingMarks ? "Pass" : "Fail";

    const attempt = new Attempt({
      student: req.user.id,
      exam: examId,
      score,
      totalMarks: exam.totalMarks,
      status,
      answers
    });
    await attempt.save();

    if (status === "Pass") {
      const cert = new Certificate({
        student: req.user.id,
        exam: examId,
        attempt: attempt._id
      });
      await cert.save();

      // Send certificate email
      const sendCertificateEmail = require('../utils/emailService');
      const student = await require('../models/User').findById(req.user.id).select('email fullName');
      const examTitle = exam.title;
      const issueDate = new Date().toLocaleDateString();
      await sendCertificateEmail({
        email: student.email,
        subject: `🎉 Certificate: ${examTitle}`,
        studentName: student.fullName,
        examTitle,
        score: Math.round(score),
        totalMarks: exam.totalMarks,
        issueDate
      });
    }

    res.json({ attempt, passed: status === "Pass" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit exam" });
  }
};

