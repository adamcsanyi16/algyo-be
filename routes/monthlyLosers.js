const express = require("express");
const router = express.Router();

const monthlyLosersController = require("../controllers/monthlyLosersController");
const { verifyToken } = require("../middleware/authMiddleware");

// Publikus olvasás
router.get("/", monthlyLosersController.getMonthlyLosers);

router.get("/:id", monthlyLosersController.getMonthlyLoserById);

// Védett írás
router.post("/", verifyToken, monthlyLosersController.addMonthlyLoser);

router.put("/:id", verifyToken, monthlyLosersController.updateMonthlyLoser);

router.delete("/:id", verifyToken, monthlyLosersController.deleteMonthlyLoser);

module.exports = router;
