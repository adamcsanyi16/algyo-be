const express = require("express");
const router = express.Router();

const playersController = require("../controllers/playersController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Publikus olvasás
router.get("/", playersController.getPlayers);

router.get("/:id", playersController.getPlayerById);

// Védett írás - csak bejelentkezett felhasználók
router.post("/", verifyToken,requireRole("admin"), playersController.addPlayer);

router.put("/:id", verifyToken,requireRole("admin"), playersController.updatePlayer);

router.delete("/:id", verifyToken,requireRole("admin"), playersController.deletePlayer);

module.exports = router;
