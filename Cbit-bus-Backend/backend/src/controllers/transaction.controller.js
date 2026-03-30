const db = require("../config/db");

exports.getTransactions = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions ORDER BY id DESC");
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
