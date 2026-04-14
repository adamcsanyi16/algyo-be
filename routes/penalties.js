const express = require("express");
const router = express.Router();

const penaltiesController = require("../controllers/penaltiesController");

router.get("/", penaltiesController.getPenalties);

//router.get("/:id", penaltiesController.getPenaltyById)

router.post("/", penaltiesController.addPenalty)

router.put("/:id", penaltiesController.updatePenalty)

router.delete("/:id", penaltiesController.deletePenalty);

router.put("/bulk-update", penaltiesController.bulkUpdatePenalties)

module.exports = router;