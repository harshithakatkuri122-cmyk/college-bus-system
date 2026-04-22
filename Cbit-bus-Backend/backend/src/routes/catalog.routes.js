const express = require("express");
const router = express.Router();

const {
	getAllRoutes,
	getAllBuses,
	getRoutesByType,
	getRoutesWithTimings,
	getRouteTimingsById,
} = require("../controllers/catalog.controller");

router.get("/routes", getAllRoutes);
router.get("/routes/:id/timings", getRouteTimingsById);
router.get("/routes/:type", getRoutesByType);
router.get("/routes-with-timings", getRoutesWithTimings);
router.get("/buses", getAllBuses);

module.exports = router;
