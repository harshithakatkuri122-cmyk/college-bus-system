const db = require("../config/db");
const QRCode = require("qrcode");
const {
  getCurrentAcademicYear,
  ensureBookingsTable,
} = require("../services/bookings.service");

function getAdjacentSeat(seatNo) {
  return seatNo % 2 === 0 ? seatNo - 1 : seatNo + 1;
}

function normalizeGender(value) {
  const gender = String(value || "").trim().toLowerCase();
  if (gender.startsWith("m")) return "male";
  if (gender.startsWith("f")) return "female";
  return gender;
}

async function buildSeatResponseByRoute(routeNo) {
  const [busRows] = await db.execute(
    "SELECT id, bus_no FROM buses WHERE route_no = ? LIMIT 1",
    [routeNo]
  );

  if (busRows.length === 0) {
    return { notFound: true };
  }

  const busId = busRows[0].id;
  const busNo = busRows[0].bus_no;

  const [seats] = await db.execute(
    `SELECT seat_no, is_booked
     FROM seats
     WHERE bus_id = ?
     ORDER BY seat_no`,
    [busId]
  );

  // Source booked seats from student assignments on this route.
  // This is robust even when students.bus_no stores route-like values.
  const [bookedWithGender] = await db.execute(
    `SELECT seat_no, gender
     FROM students
     WHERE CAST(route AS CHAR) = CAST(? AS CHAR)
       AND seat_no IS NOT NULL`,
    [routeNo]
  );

  const bookedSet = new Set(
    seats
      .filter((seat) => Number(seat.is_booked) === 1)
      .map((seat) => Number(seat.seat_no))
  );

  const restrictedSet = new Set();
  for (const row of bookedWithGender) {
    const seatNo = Number(row.seat_no);
    const bookedGender = normalizeGender(row.gender);

    // Only female bookings restrict adjacent seat for male booking requests.
    if (bookedGender !== "female") continue;

    if (!Number.isInteger(seatNo)) continue;

    const adjacentSeat = getAdjacentSeat(seatNo);
    if (adjacentSeat < 1 || adjacentSeat > 40) continue;

    // Do not mark restricted if adjacent seat is already booked.
    if (!bookedSet.has(adjacentSeat)) {
      restrictedSet.add(adjacentSeat);
    }
  }

  const restrictedSeats = Array.from(restrictedSet).sort((a, b) => a - b);
  console.log("[Seat API] bus_id:", busId, "bookedSeats:", bookedWithGender.map((row) => Number(row.seat_no)));
  console.log("[Seat API] restrictedSeats:", restrictedSeats);

  return {
    notFound: false,
    seats,
    restrictedSeats,
    busNo,
  };
}

exports.getRoutes = async (req, res) => {
  try {
    // req.user comes from verifyToken middleware
    const userId = req.user.id;

    // get student year
    const [rows] = await db.execute(
      "SELECT year FROM students WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const year = rows[0].year;

    // determine route type
    const studentType = year === 1 ? "junior" : "senior";

    // fetch routes
    const [routes] = await db.execute(
      "SELECT route_no, route_name FROM routes WHERE student_type = ?",
      [studentType]
    );

    res.json(routes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectRoute = async (req, res) => {
  try {

    const userId = req.user.id;
    const { route_no } = req.body;

    if (!route_no) {
      return res.status(400).json({ message: "Route number required" });
    }

    // check if route exists
    const [routes] = await db.execute(
      "SELECT * FROM routes WHERE route_no = ?",
      [route_no]
    );

    if (routes.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    // update student route
    await db.execute(
      "UPDATE students SET route = ? WHERE user_id = ?",
      [route_no, userId]
    );

    res.json({
      message: "Route selected successfully",
      route_no
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const academicYear = getCurrentAcademicYear();

    await ensureBookingsTable(db);

    const [rows] = await db.execute(
      `SELECT
        s.*,
        r.route_name,
        r.via
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      WHERE s.user_id = ?
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];

    const [renewalRows] = await db.execute(
      `SELECT id
       FROM bookings
       WHERE student_id = ?
         AND academic_year = ?
       LIMIT 1`,
      [userId, academicYear]
    );

    const hasRenewedCurrentYear = renewalRows.length > 0;

    return res.json({
      name: student.name,
      roll_no: student.roll_no,
      route_no: student.route,
      route_name: student.route_name || "Not Assigned",
      via: student.via,
      bus_no: student.bus_no,
      seat_no: student.seat_no,
      payment_status: student.payment_status,
      gender: student.gender,
      driver_contact: student.driver_contact,
      academic_year: academicYear,
      has_renewed_current_year: hasRenewedCurrentYear,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentAssignmentById = async (req, res) => {
  try {
    const userId = Number(req.params.user_id || req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const [rows] = await db.execute(
      `SELECT
        s.*, r.route_name
       FROM students s
       LEFT JOIN routes r ON s.route = r.route_no
       WHERE s.user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.payForBus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.execute(
      "SELECT bus_no, seat_no, route, payment_status FROM students WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!students[0].bus_no || !students[0].seat_no) {
      return res.status(400).json({ message: "Book a seat before payment" });
    }

    const currentStatus = String(students[0].payment_status || "").trim();
    const txnRef = `TXN-${Date.now()}-${userId}`;

    await db.execute(
      "UPDATE students SET payment_status = 'Active' WHERE user_id = ?",
      [userId]
    );

    if (currentStatus !== "Active") {
      await db.execute(
        `INSERT INTO transactions (student_id, amount, status, method, txn_ref)
         VALUES (?, ?, 'Success', 'Online', ?)`,
        [userId, 5000, txnRef]
      );
    }

    const [statusRows] = await db.execute(
      `SELECT
        s.name,
        s.roll_no,
        s.route AS route_no,
        r.route_name,
        r.via,
        s.bus_no,
        s.seat_no,
        s.payment_status
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      WHERE s.user_id = ?
      LIMIT 1`,
      [userId]
    );

    const status = statusRows[0] || {};

    return res.json({
      message: currentStatus === "Active" ? "Payment already active" : "Payment successful",
      payment_status: "Active",
      transaction: {
        txn_ref: txnRef,
        amount: 5000,
        status: "Success",
      },
      status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSeatsByRoute = async (req, res) => {
  try {
    const routeNo = Number(req.params.routeNo);

    if (!Number.isInteger(routeNo)) {
      return res.status(400).json({ message: "Invalid route number" });
    }

    const result = await buildSeatResponseByRoute(routeNo);

    if (result.notFound) {
      return res.status(404).json({ message: "Bus not found for route" });
    }

    return res.json({
      seats: result.seats,
      restrictedSeats: result.restrictedSeats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getRoutesByType = async (req, res) => {
  try {
    const studentType = String(req.params.type || "").toLowerCase();

    if (studentType !== "junior" && studentType !== "senior") {
      return res.status(400).json({ message: "student_type must be junior or senior" });
    }

    const [routes] = await db.execute(
      `SELECT
         r.route_no,
         r.route_name,
         r.via,
         COALESCE(SUM(CASE WHEN s.is_booked = 0 THEN 1 ELSE 0 END), 0) AS available_seats
       FROM routes r
       LEFT JOIN buses b ON b.route_no = r.route_no
       LEFT JOIN seats s ON s.bus_id = b.id
      WHERE r.student_type = ?
       GROUP BY r.route_no, r.route_name, r.via
       ORDER BY r.route_no`,
      [studentType]
    );

    return res.json(routes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSeatsByRouteNo = async (req, res) => {
  try {
    const routeNo = Number(req.params.routeNo);

    if (!Number.isInteger(routeNo)) {
      return res.status(400).json({ message: "route_no must be a number" });
    }

    const result = await buildSeatResponseByRoute(routeNo);

    if (result.notFound) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.json({
      seats: result.seats,
      restrictedSeats: result.restrictedSeats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT
        s.*, 
        r.route_name,
        r.via
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      WHERE s.user_id = ?
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];
    return res.json({
      ...student,
      route_no: student.route,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentAssignments = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        s.*, r.route_name
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      ORDER BY s.name`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyQrCode = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT
        s.roll_no,
        s.bus_no,
        s.seat_no,
        r.route_name
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      WHERE s.user_id = ?
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];

    if (!student.bus_no || !student.seat_no) {
      return res.status(400).json({ message: "Seat not booked yet" });
    }

    const payload = JSON.stringify({
      roll_no: student.roll_no,
      bus_no: student.bus_no,
      seat_no: student.seat_no,
      route_name: student.route_name || "",
    });

    const qr_code = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
    });

    return res.json({
      roll_no: student.roll_no,
      bus_no: student.bus_no,
      seat_no: student.seat_no,
      route_name: student.route_name,
      qr_code,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentQrByUserId = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.user_id);

    if (!Number.isInteger(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user_id" });
    }

    if (req.user.role === "student" && Number(req.user.id) !== requestedUserId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [rows] = await db.execute(
      `SELECT
        s.name,
        s.roll_no,
        r.route_name,
        s.bus_no,
        s.seat_no
      FROM students s
      LEFT JOIN routes r ON s.route = r.route_no
      WHERE s.user_id = ?
      LIMIT 1`,
      [requestedUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];

    return res.json({
      name: student.name,
      roll_no: student.roll_no,
      route_name: student.route_name || "Not Assigned",
      bus_no: student.bus_no,
      seat_no: student.seat_no,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};