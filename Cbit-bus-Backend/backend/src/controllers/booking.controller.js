const db = require("../config/db");
const QRCode = require("qrcode");
const {
  getCurrentAcademicYear,
  createBookingRecord,
  getLatestBooking,
  hasAcademicYearBooking,
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

async function generateBookingQrBase64({ roll_no, bus_no, seat_no, route_name }) {
  const payload = JSON.stringify({
    roll_no,
    bus_no,
    seat_no,
    route_name,
  });

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
  });
}

exports.bookSeat = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const routeNo = Number(req.body.routeNo);
    const seatNo = Number(req.body.seatNo);

    if (!Number.isInteger(routeNo)) {
      return res.status(400).json({ message: "routeNo is required" });
    }

    if (!Number.isInteger(seatNo) || seatNo < 1 || seatNo > 40) {
      return res.status(400).json({ message: "seatNo must be between 1 and 40" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Find bus for route (1:1 route <-> bus design)
    const [busRows] = await connection.execute(
      "SELECT id, bus_no FROM buses WHERE route_no = ? LIMIT 1 FOR UPDATE",
      [routeNo]
    );

    if (busRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Bus not found for route" });
    }

    const busId = busRows[0].id;
    const busNo = busRows[0].bus_no;

    // 2. Check if student already has a seat
    const [students] = await connection.execute(
      "SELECT seat_no, gender FROM students WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    if (students[0].seat_no !== null) {
      await connection.rollback();
      return res.status(409).json({ message: "Already booked" });
    }

    const studentGender = normalizeGender(students[0].gender);

    // 3. Lock requested seat
    const [seatRows] = await connection.execute(
      `SELECT is_booked
       FROM seats
       WHERE bus_id = ? AND seat_no = ?
       FOR UPDATE`,
      [busId, seatNo]
    );

    if (seatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Seat not found" });
    }

    if (Number(seatRows[0].is_booked) === 1) {
      await connection.rollback();
      return res.status(400).json({ message: "Seat already booked" });
    }

    // 4. Enforce female-adjacent restriction for male students.
    const adjacentSeat = getAdjacentSeat(seatNo);
    const [adjacentRows] = await connection.execute(
      `SELECT s.seat_no, st.gender
       FROM students st
       JOIN seats s ON s.seat_no = st.seat_no
       WHERE s.bus_id = ? AND s.seat_no = ? AND s.is_booked = 1
       LIMIT 1
       FOR UPDATE`,
      [busId, adjacentSeat]
    );

    if (adjacentRows.length > 0) {
      const adjacentGender = normalizeGender(adjacentRows[0].gender);
      if (studentGender === "male" && adjacentGender === "female") {
        await connection.rollback();
        return res.status(400).json({ message: "Adjacent seat restricted due to gender rule" });
      }
    }

    // 5. Mark seat booked
    const [seatUpdateResult] = await connection.execute(
      `UPDATE seats
       SET is_booked = 1
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0`,
      [busId, seatNo]
    );

    if (seatUpdateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Seat already booked" });
    }

    // 6. Update student assignment
    const [studentResult] = await connection.execute(
      `UPDATE students
       SET bus_no = ?, seat_no = ?, route = ?, payment_status = 'Pending'
       WHERE user_id = ?`,
      [busNo, seatNo, routeNo, userId]
    );

    if (studentResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student update failed" });
    }

    await createBookingRecord(connection, {
      studentId: userId,
      busId,
      routeNo,
      seatNo,
      academicYear: getCurrentAcademicYear(),
      status: "active",
    });

    const [routeRows] = await connection.execute(
      `SELECT s.roll_no, r.route_name
       FROM students s
       LEFT JOIN routes r ON s.route = r.route_no
       WHERE s.user_id = ?
       LIMIT 1`,
      [userId]
    );

    await connection.commit();

    const qrCode = await generateBookingQrBase64({
      roll_no: routeRows[0]?.roll_no || "",
      bus_no: busNo,
      seat_no: seatNo,
      route_name: routeRows[0]?.route_name || "",
    });

    return res.json({
      message: "Success",
      bus_no: busNo,
      seat_no: seatNo,
      payment_status: "Pending",
      qr_code: qrCode,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }
    console.error("DATABASE ERROR:", error);
    return res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.bookSeatByRoute = async (req, res) => {
  let connection;

  try {
    const rollNo = String(req.body.roll_no || "").trim();
    const routeNo = Number(req.body.route_no);
    const seatNo = Number(req.body.seat_no);

    if (!rollNo) {
      return res.status(400).json({ message: "roll_no is required" });
    }

    if (!Number.isInteger(routeNo)) {
      return res.status(400).json({ message: "route_no must be a number" });
    }

    if (!Number.isInteger(seatNo) || seatNo < 1 || seatNo > 40) {
      return res.status(400).json({ message: "seat_no must be between 1 and 40" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // a) Find bus_id from route_no (one route has one bus)
    const [busRows] = await connection.execute(
      "SELECT id, bus_no FROM buses WHERE route_no = ? LIMIT 1 FOR UPDATE",
      [routeNo]
    );

    if (busRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Route not found" });
    }

    const busId = busRows[0].id;
    const busNo = busRows[0].bus_no;

    // Ensure student exists and has no previous booking
    const [students] = await connection.execute(
      "SELECT seat_no, gender FROM students WHERE roll_no = ? LIMIT 1 FOR UPDATE",
      [rollNo]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    if (students[0].seat_no !== null) {
      await connection.rollback();
      return res.status(400).json({ message: "Student already booked" });
    }

    const studentGender = normalizeGender(students[0].gender);

    // b) Check whether requested seat is already booked
    const [seatRows] = await connection.execute(
      `SELECT is_booked
       FROM seats
       WHERE bus_id = ? AND seat_no = ?
       FOR UPDATE`,
      [busId, seatNo]
    );

    if (seatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Seat not found" });
    }

    if (Number(seatRows[0].is_booked) === 1) {
      await connection.rollback();
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Enforce female-adjacent restriction for male students.
    const adjacentSeat = getAdjacentSeat(seatNo);
    const [adjacentRows] = await connection.execute(
      `SELECT s.seat_no, st.gender
       FROM students st
       JOIN seats s ON s.seat_no = st.seat_no
       WHERE s.bus_id = ? AND s.seat_no = ? AND s.is_booked = 1
       LIMIT 1
       FOR UPDATE`,
      [busId, adjacentSeat]
    );

    if (adjacentRows.length > 0) {
      const adjacentGender = normalizeGender(adjacentRows[0].gender);
      if (studentGender === "male" && adjacentGender === "female") {
        await connection.rollback();
        return res.status(400).json({ message: "Adjacent seat restricted due to gender rule" });
      }
    }

    // c) Book seat
    const [seatUpdate] = await connection.execute(
      `UPDATE seats
       SET is_booked = 1
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0`,
      [busId, seatNo]
    );

    if (seatUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Seat already booked" });
    }

    // d) Update student record
    const [studentUpdate] = await connection.execute(
      `UPDATE students
       SET route = ?, bus_no = ?, seat_no = ?, payment_status = 'Pending'
       WHERE roll_no = ?`,
      [routeNo, busNo, seatNo, rollNo]
    );

    if (studentUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student update failed" });
    }

    const [studentMeta] = await connection.execute(
      `SELECT user_id
       FROM students
       WHERE roll_no = ?
       LIMIT 1`,
      [rollNo]
    );

    if (studentMeta.length > 0) {
      await createBookingRecord(connection, {
        studentId: Number(studentMeta[0].user_id),
        busId,
        routeNo,
        seatNo,
        academicYear: getCurrentAcademicYear(),
        status: "active",
      });
    }

    const [studentInfo] = await connection.execute(
      `SELECT s.roll_no, r.route_name
       FROM students s
       LEFT JOIN routes r ON s.route = r.route_no
       WHERE s.roll_no = ?
       LIMIT 1`,
      [rollNo]
    );

    await connection.commit();

    const qrCode = await generateBookingQrBase64({
      roll_no: studentInfo[0]?.roll_no || rollNo,
      bus_no: busNo,
      seat_no: seatNo,
      route_name: studentInfo[0]?.route_name || "",
    });

    return res.json({
      message: "Booking successful",
      roll_no: rollNo,
      route_no: routeNo,
      bus_no: busNo,
      seat_no: seatNo,
      payment_status: "Pending",
      qr_code: qrCode,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }
    console.error("DATABASE ERROR:", error);
    return res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.bookSeatByBusNo = async (req, res) => {
  let connection;

  try {
    const requestedBusNo = String(req.body.bus_no || "").trim();
    const seatNo = Number(req.body.seat_no);
    const role = req.user.role;
    const targetRollNo = String(req.body.roll_no || "").trim();

    if (!requestedBusNo) {
      return res.status(400).json({ message: "bus_no is required" });
    }

    if (!Number.isInteger(seatNo) || seatNo < 1 || seatNo > 40) {
      return res.status(400).json({ message: "seat_no must be between 1 and 40" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [busRows] = await connection.execute(
      `SELECT id, bus_no, route_no
       FROM buses
       WHERE CAST(bus_no AS CHAR) = CAST(? AS CHAR)
       LIMIT 1
       FOR UPDATE`,
      [requestedBusNo]
    );

    if (busRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Bus not found" });
    }

    const busId = busRows[0].id;
    const busNo = busRows[0].bus_no;
    const routeNo = busRows[0].route_no;

    let studentRows = [];

    if (role === "student") {
      [studentRows] = await connection.execute(
        "SELECT roll_no, seat_no, gender FROM students WHERE user_id = ? LIMIT 1 FOR UPDATE",
        [req.user.id]
      );
    } else {
      if (!targetRollNo) {
        await connection.rollback();
        return res.status(400).json({ message: "roll_no is required for this role" });
      }

      [studentRows] = await connection.execute(
        "SELECT roll_no, seat_no, gender FROM students WHERE roll_no = ? LIMIT 1 FOR UPDATE",
        [targetRollNo]
      );
    }

    if (studentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRows[0];
    if (student.seat_no !== null) {
      await connection.rollback();
      return res.status(409).json({ message: "Student already booked" });
    }

    const [seatRows] = await connection.execute(
      `SELECT seat_no, is_booked
       FROM seats
       WHERE bus_id = ? AND seat_no = ?
       FOR UPDATE`,
      [busId, seatNo]
    );

    if (seatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Seat not found" });
    }

    if (Number(seatRows[0].is_booked) === 1) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    const studentGender = normalizeGender(student.gender);
    const adjacentSeat = getAdjacentSeat(seatNo);

    const [adjacentRows] = await connection.execute(
      `SELECT st.gender
       FROM students st
       JOIN seats s ON s.seat_no = st.seat_no
       WHERE s.bus_id = ? AND s.seat_no = ? AND s.is_booked = 1
       LIMIT 1
       FOR UPDATE`,
      [busId, adjacentSeat]
    );

    if (adjacentRows.length > 0) {
      const adjacentGender = normalizeGender(adjacentRows[0].gender);
      if (studentGender === "male" && adjacentGender === "female") {
        await connection.rollback();
        return res.status(400).json({ message: "Adjacent seat restricted due to gender rule" });
      }
    }

    const [seatUpdate] = await connection.execute(
      `UPDATE seats
       SET is_booked = 1
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0`,
      [busId, seatNo]
    );

    if (seatUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    const [studentUpdate] = await connection.execute(
      `UPDATE students
       SET bus_no = ?, seat_no = ?, route = ?, payment_status = 'Pending'
       WHERE roll_no = ?`,
      [busNo, seatNo, routeNo, student.roll_no]
    );

    if (studentUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student update failed" });
    }

    const [studentMeta] = await connection.execute(
      `SELECT user_id
       FROM students
       WHERE roll_no = ?
       LIMIT 1`,
      [student.roll_no]
    );

    if (studentMeta.length > 0) {
      await createBookingRecord(connection, {
        studentId: Number(studentMeta[0].user_id),
        busId,
        routeNo,
        seatNo,
        academicYear: getCurrentAcademicYear(),
        status: "active",
      });
    }

    const [routeRows] = await connection.execute(
      "SELECT route_name FROM routes WHERE route_no = ? LIMIT 1",
      [routeNo]
    );

    await connection.commit();

    const qr_code = await generateBookingQrBase64({
      roll_no: student.roll_no,
      bus_no: busNo,
      seat_no: seatNo,
      route_name: routeRows[0]?.route_name || "",
    });

    return res.json({
      message: "Booking successful",
      roll_no: student.roll_no,
      bus_no: busNo,
      seat_no: seatNo,
      route_name: routeRows[0]?.route_name || null,
      qr_code,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("BOOK-SEAT ERROR:", error);
    return res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) connection.release();
  }
};

exports.renewBooking = async (req, res) => {
  let connection;

  try {
    const userId = Number(req.user.id);
    const academicYear = getCurrentAcademicYear();

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [studentRows] = await connection.execute(
      `SELECT user_id, route, bus_no, seat_no
       FROM students
       WHERE user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRows[0];
    const studentId = Number(student.user_id || userId);

    const alreadyRenewed = await hasAcademicYearBooking(connection, studentId, academicYear);
    if (alreadyRenewed) {
      await connection.rollback();
      return res.status(409).json({
        message: "You have already renewed your bus for this academic year.",
        has_renewed_current_year: true,
        academic_year: academicYear,
      });
    }

    let latest = await getLatestBooking(connection, studentId);
    let busId;
    let routeNo;
    let seatNo;
    let busNo;

    if (latest && Number.isInteger(Number(latest.bus_id))) {
      busId = Number(latest.bus_id);
      routeNo = latest.route_no == null ? null : Number(latest.route_no);
      seatNo = latest.seat_no == null ? null : Number(latest.seat_no);

      const [busRows] = await connection.execute(
        `SELECT id, route_no, bus_no
         FROM buses
         WHERE id = ?
         LIMIT 1
         FOR UPDATE`,
        [busId]
      );

      if (busRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Previous bus record not found" });
      }

      routeNo = routeNo == null ? Number(busRows[0].route_no) : routeNo;
      busNo = busRows[0].bus_no;
    } else {
      routeNo = student.route == null ? null : Number(student.route);
      seatNo = student.seat_no == null ? null : Number(student.seat_no);

      if (!Number.isInteger(routeNo)) {
        await connection.rollback();
        return res.status(404).json({
          message: "No previous booking found for renewal",
        });
      }

      const [busRows] = await connection.execute(
        `SELECT id, route_no, bus_no
         FROM buses
         WHERE route_no = ?
         LIMIT 1
         FOR UPDATE`,
        [routeNo]
      );

      if (busRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Previous bus record not found" });
      }

      busId = Number(busRows[0].id);
      busNo = busRows[0].bus_no;
      latest = {
        bus_id: busId,
        route_no: routeNo,
        seat_no: seatNo,
      };
    }

    await connection.execute(
      `UPDATE students
       SET route = ?, bus_no = ?, seat_no = ?, payment_status = 'Pending'
       WHERE user_id = ?`,
      [routeNo, busNo, seatNo, userId]
    );

    await createBookingRecord(connection, {
      studentId,
      busId,
      routeNo,
      seatNo,
      academicYear,
      status: "renewed",
    });

    await connection.commit();

    return res.json({
      message: "Renewal completed successfully",
      academic_year: academicYear,
      bus_id: busId,
      route_no: routeNo,
      seat_no: seatNo,
      has_renewed_current_year: true,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("RENEWAL ERROR:", error);
    return res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) connection.release();
  }
};

exports.changeBus = async (req, res) => {
  let connection;

  try {
    const userId = Number(req.user.id);
    const routeNo = Number(req.body.route_no);
    const seatNo = Number(req.body.seat_no);
    const academicYear = getCurrentAcademicYear();

    if (!Number.isInteger(routeNo)) {
      return res.status(400).json({ message: "route_no must be a number" });
    }

    if (!Number.isInteger(seatNo) || seatNo < 1 || seatNo > 40) {
      return res.status(400).json({ message: "seat_no must be between 1 and 40" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [studentRows] = await connection.execute(
      `SELECT user_id, roll_no, route, bus_no, seat_no, gender, payment_status
       FROM students
       WHERE user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRows[0];
    const studentId = Number(student.user_id || userId);
    const currentRoute = student.route == null ? null : Number(student.route);
    const currentSeat = student.seat_no == null ? null : Number(student.seat_no);

    const [newBusRows] = await connection.execute(
      `SELECT id, bus_no, route_no
       FROM buses
       WHERE route_no = ?
       LIMIT 1
       FOR UPDATE`,
      [routeNo]
    );

    if (newBusRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Route not found" });
    }

    const newBusId = Number(newBusRows[0].id);
    const newBusNo = newBusRows[0].bus_no;

    if (currentRoute === routeNo && currentSeat === seatNo) {
      await connection.rollback();
      return res.json({
        message: "Bus assignment is already up to date",
        route_no: routeNo,
        seat_no: seatNo,
        bus_no: newBusNo,
      });
    }

    const [targetSeatRows] = await connection.execute(
      `SELECT seat_no, is_booked
       FROM seats
       WHERE bus_id = ? AND seat_no = ?
       LIMIT 1
       FOR UPDATE`,
      [newBusId, seatNo]
    );

    if (targetSeatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Seat not found" });
    }

    if (Number(targetSeatRows[0].is_booked) === 1) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    const studentGender = normalizeGender(student.gender);
    const adjacentSeat = getAdjacentSeat(seatNo);

    const [adjacentRows] = await connection.execute(
      `SELECT st.gender
       FROM students st
       JOIN seats s ON s.seat_no = st.seat_no
       WHERE s.bus_id = ? AND s.seat_no = ? AND s.is_booked = 1
       LIMIT 1
       FOR UPDATE`,
      [newBusId, adjacentSeat]
    );

    if (adjacentRows.length > 0) {
      const adjacentGender = normalizeGender(adjacentRows[0].gender);
      if (studentGender === "male" && adjacentGender === "female") {
        await connection.rollback();
        return res.status(400).json({ message: "Adjacent seat restricted due to gender rule" });
      }
    }

    if (Number.isInteger(currentRoute) && Number.isInteger(currentSeat)) {
      const [oldBusRows] = await connection.execute(
        `SELECT id
         FROM buses
         WHERE route_no = ?
         LIMIT 1
         FOR UPDATE`,
        [currentRoute]
      );

      if (oldBusRows.length > 0) {
        await connection.execute(
          `UPDATE seats
           SET is_booked = 0
           WHERE bus_id = ? AND seat_no = ?`,
          [Number(oldBusRows[0].id), currentSeat]
        );
      }
    }

    const [seatUpdate] = await connection.execute(
      `UPDATE seats
       SET is_booked = 1
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0`,
      [newBusId, seatNo]
    );

    if (seatUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    await connection.execute(
      `UPDATE students
       SET route = ?, bus_no = ?, seat_no = ?
       WHERE user_id = ?`,
      [routeNo, newBusNo, seatNo, userId]
    );

    await createBookingRecord(connection, {
      studentId,
      busId: newBusId,
      routeNo,
      seatNo,
      academicYear,
      status: "changed",
    });

    await connection.commit();

    return res.json({
      message: "Bus changed successfully",
      academic_year: academicYear,
      route_no: routeNo,
      seat_no: seatNo,
      bus_no: newBusNo,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("CHANGE BUS ERROR:", error);
    return res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) connection.release();
  }
};