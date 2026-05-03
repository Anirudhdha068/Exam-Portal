const Certificate = require("../models/Certificate");

exports.getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate("student", "fullName username")
      .populate("exam", "title course");

    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    // Verify ownership
    if (req.user.role !== "admin" && cert.student._id.toString() !== req.user.id.toString()) {
         return res.status(403).json({ message: "Access denied" });
    }

    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user.id })
       .populate("exam", "title");
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCertificateByAttempt = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ attempt: req.params.attemptId })
      .populate("student", "fullName username")
      .populate("exam", "title course");

    if (!cert) return res.status(404).json({ message: "Certificate not found for this attempt" });

    if (req.user.role !== "admin" && cert.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
