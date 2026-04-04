const db = require("../config/db");

function parseViaStops(via) {
  return String(via || "")
    .split(/->|→|,/) 
    .map((s) => s.trim())
    .filter(Boolean);
}

function toTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
}

async function seedTimings({ force = false } = {}) {
  const [routes] = await db.execute(
    "SELECT route_no, route_name, via FROM routes ORDER BY route_no"
  );

  if (!Array.isArray(routes) || routes.length === 0) {
    return { inserted: 0, skippedRoutes: 0, message: "No routes found" };
  }

  let inserted = 0;
  let skippedRoutes = 0;

  for (const route of routes) {
    const routeId = Number(route.route_no);
    if (!Number.isInteger(routeId)) {
      skippedRoutes += 1;
      continue;
    }

    const [existing] = await db.execute(
      "SELECT COUNT(*) AS count FROM timings WHERE route_id = ?",
      [routeId]
    );

    const existingCount = Number(existing[0]?.count || 0);
    if (existingCount > 0 && !force) {
      skippedRoutes += 1;
      continue;
    }

    if (force && existingCount > 0) {
      await db.execute("DELETE FROM timings WHERE route_id = ?", [routeId]);
    }

    const stops = parseViaStops(route.via);
    const normalizedStops = stops.length > 0 ? stops : [route.route_name || `Route ${routeId}`];
    const baseMinutes = 7 * 60 + (routeId % 6) * 5;

    for (let index = 0; index < normalizedStops.length; index += 1) {
      const stopName = normalizedStops[index];
      const arrivalTime = toTimeString(baseMinutes + index * 8);

      await db.execute(
        "INSERT INTO timings (route_id, stop_name, arrival_time) VALUES (?, ?, ?)",
        [routeId, stopName, arrivalTime]
      );

      inserted += 1;
    }
  }

  return { inserted, skippedRoutes, message: "Timings seed complete" };
}

module.exports = {
  seedTimings,
};
