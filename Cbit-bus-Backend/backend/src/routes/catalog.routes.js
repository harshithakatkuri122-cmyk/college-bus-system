const express = require("express");
const router = express.Router();

const { getAllRoutes, getAllBuses, getRoutesByType } = require("../controllers/catalog.controller");

router.get("/routes", getAllRoutes);
router.get("/routes/:type", getRoutesByType);
router.get("/buses", getAllBuses);

module.exports = router;
