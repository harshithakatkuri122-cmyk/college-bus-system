const db = require("../config/db");

exports.getAllIncharges = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT bi.id, bi.user_id, bi.name, bi.designation, bi.route_id, r.route_name
       FROM bus_incharges bi
       LEFT JOIN routes r ON bi.route_id = r.route_no
       ORDER BY bi.name`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.assignIncharge = async (req, res) => {
  try {
    const routeIdRaw = req.body.route_id;
    const routeId = routeIdRaw === null || routeIdRaw === "" || Number(routeIdRaw) === 0
      ? null
      : Number(routeIdRaw);
    const userId = Number(req.body.user_id);

    if ((routeId !== null && !Number.isInteger(routeId)) || !Number.isInteger(userId)) {
      return res.status(400).json({ message: "route_id and user_id are required" });
    }

    const [result] = await db.execute(
      `UPDATE bus_incharges
       SET route_id = ?
       WHERE user_id = ?`,
      [routeId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Incharge not found" });
    }

    return res.json({ message: "Incharge assigned successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
