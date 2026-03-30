const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { bookSeatByBusNo } = require("../controllers/booking.controller");
const { getSeatsByBusNo } = require("../controllers/catalog.controller");
const { sendNotice, getNoticesByUser } = require("../controllers/notice.controller");
const { getStudentDetails, getStudentAssignments } = require("../controllers/student.controller");
const { getAllIncharges, assignIncharge } = require("../controllers/incharge.controller");
const { getTransactions } = require("../controllers/transaction.controller");

router.get(
  "/student/details",
  authMiddleware,
  authorizeRoles("student"),
  getStudentDetails
);

router.get(
  "/students",
  authMiddleware,
  authorizeRoles("bus-incharge", "faculty", "transport-admin"),
  getStudentAssignments
);

router.get(
  "/incharges",
  authMiddleware,
  authorizeRoles("transport-admin"),
  getAllIncharges
);

router.post(
  "/assign-incharge",
  authMiddleware,
  authorizeRoles("transport-admin"),
  assignIncharge
);

router.get(
  "/transactions",
  authMiddleware,
  authorizeRoles("transport-admin"),
  getTransactions
);

router.get(
  "/seats/:bus_no",
  authMiddleware,
  authorizeRoles("student", "faculty", "transport-admin"),
  getSeatsByBusNo
);

router.post(
  "/book-seat",
  authMiddleware,
  authorizeRoles("student", "faculty", "transport-admin"),
  bookSeatByBusNo
);

router.post(
  "/notice",
  authMiddleware,
  authorizeRoles("faculty", "transport-admin"),
  sendNotice
);

router.post(
  "/notices",
  authMiddleware,
  authorizeRoles("faculty", "transport-admin"),
  sendNotice
);

router.get(
  "/notices/:user_id",
  authMiddleware,
  getNoticesByUser
);

router.get(
  "/notice/:user_id",
  authMiddleware,
  getNoticesByUser
);

module.exports = router;
