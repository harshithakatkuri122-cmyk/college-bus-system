const db = require("../config/db");

exports.bookSeat = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const { bus_id, seat_no } = req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Check if student already has a seat
    const [students] = await connection.execute(
      "SELECT seat_no, route FROM students WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    if (students[0].seat_no !== null) {
      await connection.rollback();
      return res.status(400).json({ message: "You already have a seat" });
    }

    let selectedBusId = bus_id;
    let selectedSeatNo = seat_no;
    let bus_no = null;

    if (!selectedBusId || selectedSeatNo === undefined || selectedSeatNo === null || selectedSeatNo === "") {
      // Backward-compatible path: auto assign first available seat by student's selected route.
      const [available] = await connection.execute(
        `SELECT s.id, s.seat_no, s.bus_id, b.bus_no
         FROM seats s
         INNER JOIN buses b ON b.id = s.bus_id
         WHERE b.route_no = ? AND s.is_booked = 0
         ORDER BY s.id ASC
         LIMIT 1
         FOR UPDATE`,
        [students[0].route]
      );

      if (available.length === 0) {
        await connection.rollback();
        return res.status(409).json({ message: "No available seats for your route" });
      }

      selectedBusId = available[0].bus_id;
      selectedSeatNo = available[0].seat_no;
      bus_no = available[0].bus_no;
    }

    // 2. Check if requested seat is available
    const [seatRows] = await connection.execute(
      `SELECT id
       FROM seats
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0
       LIMIT 1
       FOR UPDATE`,
      [selectedBusId, selectedSeatNo]
    );

    if (seatRows.length === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    // Resolve bus_no from buses table so student row is always consistent.
    if (!bus_no) {
      const [busRows] = await connection.execute(
        "SELECT bus_no FROM buses WHERE id = ? LIMIT 1",
        [selectedBusId]
      );

      if (busRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Bus not found" });
      }

      bus_no = busRows[0].bus_no;
    }

    // 3. Atomically mark seat as booked
    const [seatUpdateResult] = await connection.execute(
      `UPDATE seats
       SET is_booked = 1
       WHERE bus_id = ? AND seat_no = ? AND is_booked = 0`,
      [selectedBusId, selectedSeatNo]
    );

    if (seatUpdateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already booked" });
    }

    // 4. Update student assignment and mark payment as pending until pay API succeeds
    const [studentResult] = await connection.execute(
      `UPDATE students
       SET bus_no = ?, seat_no = ?, payment_status = 'Pending'
       WHERE user_id = ?`,
      [bus_no, selectedSeatNo, userId]
    );

    if (studentResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student update failed" });
    }

    await connection.commit();

    return res.json({
      message: "Seat booked. Payment pending",
      bus_no,
      seat_no: selectedSeatNo,
      payment_status: "Pending",
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