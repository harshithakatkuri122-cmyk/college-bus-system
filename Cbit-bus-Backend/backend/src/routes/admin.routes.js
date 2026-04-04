const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { seedTimings } = require("../controllers/admin.controller");

const router = express.Router();

router.post(
  "/timings/seed",
  authMiddleware,
  authorizeRoles("transport-admin"),
  seedTimings
);

module.exports = router;
