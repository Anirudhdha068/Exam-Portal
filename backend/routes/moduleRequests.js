const express = require("express");
const router = express.Router();
const moduleRequestController = require("../controllers/moduleRequestController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, moduleRequestController.createModuleRequest);
router.get("/", authMiddleware, adminMiddleware, moduleRequestController.getAllModuleRequests);
router.patch("/:id", authMiddleware, adminMiddleware, moduleRequestController.updateModuleRequestStatus);

module.exports = router;

