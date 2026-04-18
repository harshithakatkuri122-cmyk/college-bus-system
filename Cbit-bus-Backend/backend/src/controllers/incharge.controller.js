const db = require("../config/db");

async function ensureInchargeAssignmentTable() {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS incharge_route_assignments (
      user_id INT NOT NULL PRIMARY KEY,
      route_no INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_incharge_assignments_route FOREIGN KEY (route_no) REFERENCES routes(route_no) ON DELETE SET NULL
    )`
  );
}

async function ensureRouteIdColumn() {
  const [routeIdColumn] = await db.execute(
    "SHOW COLUMNS FROM bus_incharges LIKE 'route_id'"
  );

  if (routeIdColumn.length > 0) {
    return true;
  }

  try {
    await db.execute("ALTER TABLE bus_incharges ADD COLUMN route_id INT NULL");

    await db.execute(
      "ALTER TABLE bus_incharges ADD INDEX idx_bus_incharges_route_id (route_id)"
    );

    await db.execute(
      `ALTER TABLE bus_incharges
       ADD CONSTRAINT fk_bus_incharges_route
       FOREIGN KEY (route_id) REFERENCES routes(route_no)
       ON DELETE SET NULL`
    );
  } catch (error) {
    // Ignore duplicate/index/constraint errors; final verification decides outcome.
    console.warn("Unable to auto-add route_id on bus_incharges:", error.message);
  }

  const [recheck] = await db.execute(
    "SHOW COLUMNS FROM bus_incharges LIKE 'route_id'"
  );
  return recheck.length > 0;
}

async function resolveRouteColumn() {
  const hasRouteId = await ensureRouteIdColumn();
  if (hasRouteId) {
    return "route_id";
  }

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
      await ensureInchargeAssignmentTable();
      [rows] = await db.execute(
        `SELECT
          bi.id,
          bi.user_id,
          bi.name,
          bi.designation,
          ira.route_no AS route_id,
          r.route_name
         FROM bus_incharges bi
         LEFT JOIN incharge_route_assignments ira ON ira.user_id = bi.user_id
         LEFT JOIN routes r ON r.route_no = ira.route_no
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

    const [inchargeRows] = await db.execute(
      `SELECT user_id
       FROM bus_incharges
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (inchargeRows.length === 0) {
      return res.status(404).json({ message: "Incharge not found" });
    }

    if (routeId !== null) {
      const [routeRows] = await db.execute(
        `SELECT route_no
         FROM routes
         WHERE route_no = ?
         LIMIT 1`,
        [routeId]
      );

      if (routeRows.length === 0) {
        return res.status(404).json({ message: "Route not found" });
      }
    }

    const routeColumn = await resolveRouteColumn();
    let result;

    if (!routeColumn) {
      await ensureInchargeAssignmentTable();
      [result] = await db.execute(
        `INSERT INTO incharge_route_assignments (user_id, route_no)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE route_no = VALUES(route_no)`,
        [userId, routeId]
      );
    } else {
      [result] = await db.execute(
        `UPDATE bus_incharges
         SET ${routeColumn} = ?
         WHERE user_id = ?`,
        [routeId, userId]
      );
    }

    if (routeColumn && result.affectedRows === 0) {
      return res.status(404).json({ message: "Incharge not found" });
    }

    return res.json({ message: "Incharge assigned successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to assign incharge",
      error: error && (error.sqlMessage || error.message) ? (error.sqlMessage || error.message) : "Unknown error",
    });
  }
};
