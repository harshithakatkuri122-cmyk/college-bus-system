const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const {
  getRoutes,
  getSeatsByRoute,
  getRoutesByType,
  getSeatsByRouteNo,
  selectRoute,
  getMyStatus,
  payForBus,
} = require("../controllers/student.controller");
const { bookSeat, bookSeatByRoute } = require("../controllers/booking.controller");

router.get("/test", (req, res) => {
  res.send("Student route working");
});

// GET student routes
router.get(
  "/routes",
  authMiddleware,
  authorizeRoles("student"),
  getRoutes
);

router.get(
  "/routes/:type",
  authMiddleware,
  authorizeRoles("student"),
  getRoutesByType
);

// Select route
router.post(
  "/select-route",
  authMiddleware,
  authorizeRoles("student"),
  selectRoute
);

// Book seat
router.post(
  "/book-seat",
  authMiddleware,
  authorizeRoles("student"),
  bookSeat
);

router.post(
  "/book",
  authMiddleware,
  authorizeRoles("student"),
  bookSeatByRoute
);

router.get(
  "/seats-by-route/:routeNo",
  authMiddleware,
  authorizeRoles("student"),
  getSeatsByRoute
);

router.get(
  "/seats/:routeNo",
  authMiddleware,
  authorizeRoles("student"),
  getSeatsByRouteNo
);

router.get(
  "/my-status",
  authMiddleware,
  authorizeRoles("student"),
  getMyStatus
);

router.post(
  "/pay",
  authMiddleware,
  authorizeRoles("student"),
  payForBus
);

module.exports = router;