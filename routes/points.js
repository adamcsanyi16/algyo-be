const express = require("express");
const router = express.Router();

const pointsController = require("../controllers/pointsController");

router.get("/:id", pointsController.getPointsById);

router.put("/:id" , pointsController.addPointsById);

module.exports = router;
