const db = require("../config/db");

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
