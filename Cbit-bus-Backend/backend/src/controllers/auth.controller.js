const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
console.log("Login route hit");

exports.login = async (req, res) => {
  try {
    const { college_id, password } = req.body;

    const [users] = await db.execute(
      "SELECT * FROM users WHERE college_id = ?",
      [college_id]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    let profile = null;

    if (user.role === "student") {
      const [data] = await db.execute(
        "SELECT name, year, payment_status FROM students WHERE user_id = ?",
        [user.id]
      );
      profile = data[0];
    }

    if (user.role === "faculty") {
      const [data] = await db.execute(
        "SELECT name, department, payment_status FROM faculty WHERE user_id = ?",
        [user.id]
      );
      profile = data[0];
    }

    res.json({
      token,
      user: {
        id: user.id,
        college_id: user.college_id,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};