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

exports.getMyStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT
        s.name,
        s.roll_no,
        s.bus_no,
        s.seat_no,
        s.route,
        s.payment_status,
        NULL AS driver_contact
      FROM students s
      WHERE s.user_id = ?
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];

    return res.json({
      name: student.name,
      roll_no: student.roll_no,
      bus_no: student.bus_no,
      seat_no: student.seat_no,
      route: student.route,
      payment_status: student.payment_status,
      driver_contact: student.driver_contact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.payForBus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await db.execute(
      "SELECT bus_no, seat_no FROM students WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!students[0].bus_no || !students[0].seat_no) {
      return res.status(400).json({ message: "Book a seat before payment" });
    }

    await db.execute(
      "UPDATE students SET payment_status = 'Active' WHERE user_id = ?",
      [userId]
    );

    return res.json({ message: "Payment successful", payment_status: "Active" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};