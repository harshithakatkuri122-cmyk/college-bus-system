const db = require("../config/db");

exports.sendNotice = async (req, res) => {
  let connection;

  try {
    const { title, message, target_type, route_no, user_ids } = req.body;

    if (!title || !message || !target_type) {
      return res.status(400).json({ message: "title, message and target_type are required" });
    }

    if (!["all", "route", "users"].includes(target_type)) {
      return res.status(400).json({ message: "target_type must be all, route, or users" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [noticeResult] = await connection.execute(
      `INSERT INTO notices (title, message, target_type, route_no, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        String(message).trim(),
        target_type,
        target_type === "route" ? Number(route_no) : null,
        req.user.id,
      ]
    );

    const noticeId = noticeResult.insertId;

    let recipients = [];

    if (target_type === "all") {
      const [rows] = await connection.execute("SELECT user_id FROM students");
      recipients = rows.map((row) => Number(row.user_id));
    }

    if (target_type === "route") {
      if (!Number.isInteger(Number(route_no))) {
        await connection.rollback();
        return res.status(400).json({ message: "route_no is required for route target" });
      }

      const [rows] = await connection.execute(
        "SELECT user_id FROM students WHERE route = ?",
        [Number(route_no)]
      );
      recipients = rows.map((row) => Number(row.user_id));
    }

    if (target_type === "users") {
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: "user_ids array is required for users target" });
      }

      recipients = user_ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
    }

    if (recipients.length > 0) {
      const values = recipients.map((userId) => [noticeId, userId]);
      await connection.query(
        "INSERT IGNORE INTO notice_recipients (notice_id, user_id) VALUES ?",
        [values]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Notice sent successfully",
      notice_id: noticeId,
      recipients_count: recipients.length,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("NOTICE ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

exports.getNoticesByUser = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.user_id);

    if (!Number.isInteger(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user_id" });
    }

    const callerRole = req.user.role;
    const callerId = Number(req.user.id);

    if (
      callerId !== requestedUserId &&
      callerRole !== "transport-admin" &&
      callerRole !== "faculty"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [rows] = await db.execute(
      `SELECT
        n.id,
        n.title,
        n.message,
        n.target_type,
        n.route_no,
        n.created_by,
        n.created_at,
        nr.is_read
      FROM notice_recipients nr
      JOIN notices n ON n.id = nr.notice_id
      WHERE nr.user_id = ?
      ORDER BY n.created_at DESC`,
      [requestedUserId]
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
