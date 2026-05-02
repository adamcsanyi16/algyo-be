const express = require("express");
const router = express.Router();

const playersController = require("../controllers/playersController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Publikus olvasás
router.get("/", playersController.getPlayers);

router.get("/:id", playersController.getPlayerById);

// Védett írás - csak bejelentkezött felhasználók
router.post("/", verifyToken, playersController.addPlayer);

router.put("/:id", verifyToken, playersController.updatePlayer);

router.delete("/:id", verifyToken, playersController.deletePlayer);

module.exports = router;
