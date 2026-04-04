const { seedTimings } = require("../services/timings.service");

async function run() {
  const result = await seedTimings();
  console.log(
    `${result.message}. Inserted: ${result.inserted}, skipped routes: ${result.skippedRoutes}`
  );
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Timings seed failed:", error);
    process.exit(1);
  });
