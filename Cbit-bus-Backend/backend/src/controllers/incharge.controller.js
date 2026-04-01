const db = require("../config/db");

async function resolveRouteColumn() {
  const [routeIdColumn] = await db.execute(
    "SHOW COLUMNS FROM bus_incharges LIKE 'route_id'"
  );
  if (routeIdColumn.length > 0) {
    return "route_id";
  }

  const [routeNoColumn] = await db.execute(
    "SHOW COLUMNS FROM bus_incharges LIKE 'route_no'"
  );
  if (routeNoColumn.length > 0) {
    return "route_no";
  }

  return null;
}

exports.getAllIncharges = async (req, res) => {
  try {
    const routeColumn = await resolveRouteColumn();
    let rows = [];

    if (routeColumn) {
      [rows] = await db.execute(
        `SELECT
          bi.id,
          bi.user_id,
          bi.name,
          bi.designation,
          bi.${routeColumn} AS route_id,
          r.route_name
         FROM bus_incharges bi
         LEFT JOIN routes r ON bi.${routeColumn} = r.route_no
         ORDER BY bi.name`
      );
    } else {
      [rows] = await db.execute(
        `SELECT
          bi.id,
          bi.user_id,
          bi.name,
          bi.designation,
          NULL AS route_id,
          NULL AS route_name
         FROM bus_incharges bi
         ORDER BY bi.name`
      );
    }

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

    const routeColumn = await resolveRouteColumn();
    if (!routeColumn) {
      return res.status(500).json({
        message: "No route mapping column found in bus_incharges"
      });
    }

    const [result] = await db.execute(
      `UPDATE bus_incharges
       SET ${routeColumn} = ?
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
