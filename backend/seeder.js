require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Program = require("./models/Program");
const Semester = require("./models/Semester");
const Course = require("./models/Course");
const User = require("./models/User");
const Exam = require("./models/Exam");
const Attempt = require("./models/Attempt");
const Certificate = require("./models/Certificate");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding...");

    // Clear existing logical mock/testing data
    console.log("Clearing old data (Keeping Admin intact)...");
    await Program.deleteMany();
    await Semester.deleteMany();
    await Course.deleteMany();
    await Exam.deleteMany();
    await Attempt.deleteMany();
    await Certificate.deleteMany();
    await User.deleteMany({ role: "student" });

    // 1. Create Programs
    const bca = await Program.create({ name: "BCA", description: "Bachelors in Computer Application" });
    const bba = await Program.create({ name: "BBA", description: "Bachelors in Business Administration" });
    console.log("Programs Seeded");

    // 2. Create Semesters
    const bcaSem1 = await Semester.create({ name: "Semester 1", program: bca._id });
    const bcaSem2 = await Semester.create({ name: "Semester 2", program: bca._id });
    const bbaSem1 = await Semester.create({ name: "Semester 1", program: bba._id });
    console.log("Semesters Seeded");

    // 3. Create Courses
    const cCourse = await Course.create({ title: "Programming in C", code: "CS101", program: bca._id, semester: bcaSem1._id });
    const javaCourse = await Course.create({ title: "Advanced Java", code: "CS102", program: bca._id, semester: bcaSem2._id });
    const marketCourse = await Course.create({ title: "Marketing 101", code: "BB101", program: bba._id, semester: bbaSem1._id });
    console.log("Courses Seeded");

    // 4. Create Students
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash("password123", salt);

    const student1 = await User.create({
      fullName: "Alice Doe",
      email: "alice@example.com",
      username: "alicedoe",
      password: pass,
      role: "student",
      program: bca._id,
      semester: bcaSem2._id,
      courses: [javaCourse._id]
    });

    const student2 = await User.create({
      fullName: "Bob Smith",
      email: "bob@example.com",
      username: "bobsmith",
      password: pass,
      role: "student",
      program: bba._id,
      semester: bbaSem1._id,
      courses: [marketCourse._id]
    });
    console.log("Students Seeded (Passwords are 'password123')");

    // 5. Create Exams
    const javaExam = await Exam.create({
      title: "Advanced Java Mid-Term",
      course: javaCourse._id,
      semester: bcaSem2._id,
      durationMinutes: 45,
      totalMarks: 100,
      passingMarks: 50,
      questions: [
        {
          questionText: "What does JSP stand for?",
          options: ["Java Server Pages", "Java System Pages", "Java Standard Protocol", "None of the above"],
          correctAnswer: "Java Server Pages"
        },
        {
          questionText: "Which is not an implicit object in JSP?",
          options: ["request", "response", "session", "compiler"],
          correctAnswer: "compiler"
        }
      ]
    });
    console.log("Exams Seeded");

    // 6. Create Attempt (Results)
    const passedAttempt = await Attempt.create({
      student: student1._id,
      exam: javaExam._id,
      score: 100,
      totalMarks: 100,
      status: "Pass"
    });

    // Create Certificate representing passed
    await Certificate.create({
      student: student1._id,
      exam: javaExam._id,
      attempt: passedAttempt._id
    });

    console.log("Results & Certificates Seeded");

    console.log("✅✅ All Database Data Seeded Successfully ✅✅");
    process.exit();

  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDatabase();
