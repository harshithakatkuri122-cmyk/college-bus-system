const db = require("../config/db");

exports.getRoutes = async (req, res) => {
  try {
    // req.user comes from verifyToken middleware
    const userId = req.user.id;

    // get student year
    const [rows] = await db.execute(
      "SELECT year FROM students WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const year = rows[0].year;

    // determine route type
    const studentType = year === 1 ? "junior" : "senior";

    // fetch routes
    const [routes] = await db.execute(
      "SELECT route_no, route_name FROM routes WHERE student_type = ?",
      [studentType]
    );

    res.json(routes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectRoute = async (req, res) => {
  try {

    const userId = req.user.id;
    const { route_no } = req.body;

    if (!route_no) {
      return res.status(400).json({ message: "Route number required" });
    }

    // check if route exists
    const [routes] = await db.execute(
      "SELECT * FROM routes WHERE route_no = ?",
      [route_no]
    );

    if (routes.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    // update student route
    await db.execute(
      "UPDATE students SET route = ? WHERE user_id = ?",
      [route_no, userId]
    );

    res.json({
      message: "Route selected successfully",
      route_no
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};