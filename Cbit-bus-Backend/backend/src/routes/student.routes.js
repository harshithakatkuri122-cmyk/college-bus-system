const express = require("express");
const router = express.Router();
const db = require("../config/db");

const verifyToken = require("../middleware/verifyToken");
const { authorizeRoles } = require("../middleware/role.middleware");

const { getRoutes, selectRoute } = require("../controllers/student.controller");
const { bookSeat } = require("../controllers/booking.controller");

// GET student routes
router.get(
  "/routes",
  verifyToken,
  authorizeRoles("student"),
  getRoutes
);

// Select route
router.post(
  "/select-route",
  verifyToken,
  authorizeRoles("student"),
  selectRoute
);

// Book seat
router.post(
  "/book-seat",
  verifyToken,
  authorizeRoles("student"),
  bookSeat
);

router.get("/my-status/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT name, bus_no, seat_no, payment_status FROM students WHERE user_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student ID not found in table" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;