const express = require("express");
const router = express.Router();

const penaltiesController = require("../controllers/penaltiesController");
const { verifyToken } = require("../middleware/authMiddleware");

// Publikus olvasás
router.get("/", penaltiesController.getPenalties);

router.get("/:id", penaltiesController.getPenaltyById);

// Védett írás
router.post("/", verifyToken, penaltiesController.addPenalty);

router.put("/:id/paid", verifyToken, penaltiesController.updatePaidPenalty);

router.put("/:id", verifyToken, penaltiesController.updatePenalty);

router.delete("/:id", verifyToken, penaltiesController.deletePenalty);

router.patch(
  "/bulk-update",
  verifyToken,
  penaltiesController.bulkUpdatePenalties,
);

module.exports = router;
