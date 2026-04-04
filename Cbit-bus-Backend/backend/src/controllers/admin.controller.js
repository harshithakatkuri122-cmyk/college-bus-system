const { seedTimings } = require("../services/timings.service");

exports.seedTimings = async (req, res) => {
  try {
    const force = String(req.body.force || "false").toLowerCase() === "true";
    const result = await seedTimings({ force });

    return res.json({
      success: true,
      message: result.message,
      inserted: result.inserted,
      skippedRoutes: result.skippedRoutes,
    });
  } catch (error) {
    console.error("seedTimings error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
