require("dotenv").config();
const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

db.getConnection()
  .then(async connection => {
    console.log("MySQL Connected ✅");
    connection.release();

    const [dbName] = await db.execute("SELECT DATABASE() AS db");
    console.log("BACKEND USING DB:", dbName);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed ❌");
    console.error(err);
  });