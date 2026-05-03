const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  resourceController.upload,
  resourceController.uploadResource
);

router.get("/all", authMiddleware, adminMiddleware, resourceController.getAllResources);
router.get("/student", authMiddleware, resourceController.getStudentResources);
router.delete("/:id", authMiddleware, adminMiddleware, resourceController.deleteResource);

module.exports = router;

