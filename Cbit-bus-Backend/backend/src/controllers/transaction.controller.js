const db = require("../config/db");

exports.getTransactions = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        t.id,
        t.student_id,
        COALESCE(s.name, CONCAT('Student ', t.student_id)) AS student_name,
        s.roll_no,
        r.route_name,
        CASE WHEN s.year = 1 THEN 'junior' ELSE 'senior' END AS student_type,
        t.amount,
        DATE_FORMAT(t.created_at, '%Y-%m-%d') AS date,
        t.status,
        t.txn_ref,
        t.created_at
      FROM transactions t
      LEFT JOIN students s ON s.user_id = t.student_id
      LEFT JOIN routes r ON r.route_no = s.route
      ORDER BY t.id DESC`
    );

    // Include students who have bookings but no transaction row yet.
    const [derivedRows] = await db.execute(
      `SELECT
        s.user_id AS id,
        s.user_id AS student_id,
        s.name AS student_name,
        s.roll_no,
        r.route_name,
        CASE WHEN s.year = 1 THEN 'junior' ELSE 'senior' END AS student_type,
        5000 AS amount,
        DATE_FORMAT(NOW(), '%Y-%m-%d') AS date,
        CASE
          WHEN s.payment_status = 'Active' THEN 'Success'
          ELSE 'Pending'
        END AS status,
        CONCAT('AUTO-', s.user_id) AS txn_ref,
        NOW() AS created_at
      FROM students s
      LEFT JOIN routes r ON r.route_no = s.route
      WHERE s.seat_no IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM transactions t
          WHERE t.student_id = s.user_id
        )
      ORDER BY s.user_id DESC`
    );

    const mergedRows = [...rows, ...derivedRows];
    mergedRows.sort((a, b) => {
      const left = new Date(a.created_at || 0).getTime();
      const right = new Date(b.created_at || 0).getTime();
      return right - left;
    });

    return res.json(mergedRows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
