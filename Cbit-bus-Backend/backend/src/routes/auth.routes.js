const { authorizeRoles } = require("../middleware/role.middleware");
const express = require("express");
const router = express.Router();

console.log("AUTH ROUTES FILE LOADED");

const { login } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const db = require("../config/db");

router.get("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ message: "Auth route working ✅" });
});

router.post("/login", login);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let profile = null;

    if (role === "student") {
      const [data] = await db.execute(
        `SELECT s.name, s.year, s.payment_status, s.route AS route_no, s.bus_no, s.seat_no, r.route_name, r.via
         FROM students s
         LEFT JOIN routes r ON s.route = r.route_no
         WHERE s.user_id = ?`,
        [userId]
      );
      profile = data[0];
    }

    if (role === "faculty") {
      const [data] = await db.execute(
        "SELECT name, department, payment_status FROM faculty WHERE user_id = ?",
        [userId]
      );
      profile = data[0];
    }

    res.json({
      user: req.user,
      profile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/student-only",
  verifyToken,
  authorizeRoles("student"),
  (req, res) => {
    res.json({ message: "Student access granted ✅" });
  }
);

module.exports = router;