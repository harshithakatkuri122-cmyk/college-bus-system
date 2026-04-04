const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function migrate() {
  const filePath = path.join(__dirname, "../../migrations/003_create_timings.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  await db.query(sql);
  console.log("Timings migration completed successfully.");
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Timings migration failed:", error);
    process.exit(1);
  });
