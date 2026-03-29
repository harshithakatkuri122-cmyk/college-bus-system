const express = require("express");
const router = express.Router();

const { getAllRoutes, getAllBuses } = require("../controllers/catalog.controller");

router.get("/routes", getAllRoutes);
router.get("/buses", getAllBuses);

module.exports = router;
