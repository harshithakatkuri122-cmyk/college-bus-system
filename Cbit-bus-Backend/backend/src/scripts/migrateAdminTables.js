require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function run() {
  const migrationPath = path.resolve(__dirname, "../../migrations/002_create_admin_tables.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  console.log("Admin tables migration completed successfully.");
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Admin tables migration failed:", error);
    process.exit(1);
  });
