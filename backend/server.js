require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("./models/User");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Main DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully ✅");
    seedAdmin();
  })
  .catch((err) => console.log(err));
// Seed Admin logic
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const adminUser = new User({
        fullName: "System Admin",
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log("Admin seeded: username 'admin', password 'admin123'");
    }
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
};

// Static uploads (absolute path from project root)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", require("./routes/academic"));
app.use("/api/exam", require("./routes/exam"));
app.use("/api/student", require("./routes/student"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/certificate", require("./routes/certificate"));
app.use("/api/resources", require("./routes/resource"));
app.use("/api/module-requests", require("./routes/moduleRequests"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
