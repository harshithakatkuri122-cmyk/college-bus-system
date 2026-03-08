const db = require("../config/db");

exports.bookSeat = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Fetch Student & check Payment
    const [students] = await connection.execute(
      "SELECT route, payment_status, bus_no FROM students WHERE user_id = ?",
      [userId]
    );

    if (students.length === 0) return res.status(404).json({ message: "Student not found" });

    const student = students[0];

    if (student.bus_no) return res.status(400).json({ message: "You already have a seat!" });
    if (student.payment_status !== "Active") return res.status(403).json({ message: "Please pay first!" });

    // 2. Find THE FIRST available seat on the student's route
    const [available] = await connection.execute(
      `SELECT s.id AS seat_id, s.seat_no, b.bus_no
       FROM seats s
       JOIN buses b ON s.bus_id = b.id
       WHERE b.route_no = ? AND s.is_booked = 0
       ORDER BY s.id ASC
       LIMIT 1 FOR UPDATE`,
      [student.route]
    );

    if (available.length === 0) return res.status(400).json({ message: "Bus is full!" });

    const { seat_id, seat_no, bus_no } = available[0];

    // 3. Perform a guarded update so concurrent requests cannot double-book.
    const seatResult = await connection.execute(
      "UPDATE seats SET is_booked = 1 WHERE id = ? AND is_booked = 0",
      [seat_id]
    );

    if (seatResult[0].affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Seat already taken. Please try again." });
    }

    const [studentResult] = await connection.execute(
      "UPDATE students SET bus_no = ?, seat_no = ? WHERE user_id = ?",
      [bus_no, seat_no, userId]
    );
    if (studentResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student row not matched for this token user_id" });
    }

    await connection.commit();

    return res.json({ message: "Success!", bus_no, seat_no });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }
    console.error("DATABASE ERROR:", error);
    res.status(500).json({ message: "Internal Error" });
  } finally {
    if (connection) connection.release();
  }
};