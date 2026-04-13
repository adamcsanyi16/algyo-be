const express = require("express");
const router = express.Router();

const penaltiesController = require("../controllers/playersController");

router.get("/", penaltiesController.getPenalties);

//router.get("/:id", penaltiesController.getPenaltyById)

router.post("/", penaltiesController.addPenalty)

//router.put("/:id", penaltiesController.updatePenalty)

router.delete("/:id", penaltiesController.deletePenalty);

module.exports = router;