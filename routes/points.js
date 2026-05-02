const express = require("express");
const router = express.Router();

const pointsController = require("../controllers/pointsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Publikus olvasás
router.get("/:id", pointsController.getPointsById);

// Védett írás
router.put("/:id", verifyToken, pointsController.addPointsById);
router.patch("/bulk-update", verifyToken, pointsController.bulkUpdatePoints);
router.post("/reset-all", verifyToken, pointsController.resetAllPoints);

module.exports = router;
