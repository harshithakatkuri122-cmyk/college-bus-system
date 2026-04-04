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

    if (rows.length > 0) {
      return res.json(rows);
    }

    const [derivedRows] = await db.execute(
      `SELECT
        s.user_id AS id,
        s.user_id AS student_id,
        s.name AS student_name,
        s.roll_no,
        r.route_name,
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
      ORDER BY s.user_id DESC`
    );

    return res.json(derivedRows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
