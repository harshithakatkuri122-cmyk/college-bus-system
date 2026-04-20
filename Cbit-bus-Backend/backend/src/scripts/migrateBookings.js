require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function run() {
  const migrationPath = path.resolve(__dirname, "../../migrations/004_create_bookings.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  console.log("Bookings migration completed successfully.");
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Bookings migration failed:", error);
    process.exit(1);
  });
