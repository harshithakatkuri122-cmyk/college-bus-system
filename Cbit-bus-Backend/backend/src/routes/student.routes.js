const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const {
  getRoutes,
  selectRoute,
  getMyStatus,
  payForBus,
} = require("../controllers/student.controller");
const { bookSeat } = require("../controllers/booking.controller");

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