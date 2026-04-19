const express = require("express");
const router = express.Router();

const monthlyLosersController = require("../controllers/monthlyLosersController");


router.get("/", monthlyLosersController.getMonthlyLosers);

router.get("/:id", monthlyLosersController.getMonthlyLoserById);

router.post("/", monthlyLosersController.addMonthlyLoser);

router.put("/:id", monthlyLosersController.updateMonthlyLoser);

router.delete("/:id", monthlyLosersController.deleteMonthlyLoser);

module.exports = router;
