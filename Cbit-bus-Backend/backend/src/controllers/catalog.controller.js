const db = require("../config/db");

function getAdjacentSeat(seatNo) {
  return seatNo % 2 === 0 ? seatNo - 1 : seatNo + 1;
}

function normalizeGender(value) {
  const gender = String(value || "").trim().toLowerCase();
  if (gender.startsWith("m")) return "male";
  if (gender.startsWith("f")) return "female";
  return gender;
}

exports.getAllRoutes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT route_no, route_name, via, student_type
       FROM routes
       ORDER BY route_no`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getRoutesByType = async (req, res) => {
  try {
    const type = String(req.params.type || "").trim().toLowerCase();

    if (!type) {
      return res.status(400).json({ message: "type is required" });
    }

    let rows = [];

    if (type === "faculty") {
      const [result] = await db.execute(
        `SELECT route_no, route_name, via, student_type
         FROM routes
         WHERE LOWER(student_type) IN ('faculty', 'staff')
         ORDER BY route_no`
      );
      rows = result;
    } else {
      const [result] = await db.execute(
        `SELECT route_no, route_name, via, student_type
         FROM routes
         WHERE LOWER(student_type) = ?
         ORDER BY route_no`,
        [type]
      );
      rows = result;
    }

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBuses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, bus_no, route_no, student_type, total_seats
       FROM buses
       ORDER BY route_no, id`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSeatsByBusNo = async (req, res) => {
  try {
    const busNo = String(req.params.bus_no || "").trim();

    if (!busNo) {
      return res.status(400).json({ message: "bus_no is required" });
    }

    const [busRows] = await db.execute(
      `SELECT id, bus_no, route_no
       FROM buses
       WHERE CAST(bus_no AS CHAR) = CAST(? AS CHAR)
       LIMIT 1`,
      [busNo]
    );

    if (busRows.length === 0) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const bus = busRows[0];

    const [seats] = await db.execute(
      `SELECT seat_no, is_booked
       FROM seats
       WHERE bus_id = ?
       ORDER BY seat_no`,
      [bus.id]
    );

    const [bookedWithGender] = await db.execute(
      `SELECT seat_no, gender
       FROM students
       WHERE CAST(bus_no AS CHAR) = CAST(? AS CHAR)
         AND seat_no IS NOT NULL`,
      [bus.bus_no]
    );

    const bookedSet = new Set(
      seats
        .filter((seat) => Number(seat.is_booked) === 1)
        .map((seat) => Number(seat.seat_no))
    );

    const restrictedSet = new Set();
    for (const row of bookedWithGender) {
      const seatNo = Number(row.seat_no);
      const gender = normalizeGender(row.gender);

      if (!Number.isInteger(seatNo) || gender !== "female") continue;

      const adjacentSeat = getAdjacentSeat(seatNo);
      if (adjacentSeat < 1 || adjacentSeat > 40) continue;

      if (!bookedSet.has(adjacentSeat)) {
        restrictedSet.add(adjacentSeat);
      }
    }

    return res.json({
      seats,
      restrictedSeats: Array.from(restrictedSet).sort((a, b) => a - b),
      bus_no: bus.bus_no,
      route_no: bus.route_no,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
