const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const { authMiddleware } = require("../middleware/auth");

router.get("/attempt/:attemptId", authMiddleware, certificateController.getCertificateByAttempt);
router.get("/:id", authMiddleware, certificateController.getCertificate);
router.get("/student/all", authMiddleware, certificateController.getMyCertificates);

module.exports = router;
