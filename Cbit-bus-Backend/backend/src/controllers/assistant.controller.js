const OpenAI = require("openai");
const db = require("../config/db");

const SYSTEM_PROMPT =
  "You are a CBIT bus assistant. Answer strictly using given data. Do not hallucinate.";

const PUBLIC_SYSTEM_PROMPT =
  "You are a CBIT transport assistant for website visitors. Answer strictly using the provided booking guide and route data. Do not hallucinate.";

const CACHE_TTL_MS = 2 * 60 * 1000;
const answerCache = new Map();

function cacheKey(studentId, question) {
  return `${studentId}::${String(question || "").trim().toLowerCase()}`;
}

function readCache(key) {
  const entry = answerCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    answerCache.delete(key);
    return null;
  }

  return entry.answer;
}

function writeCache(key, answer) {
  answerCache.set(key, {
    answer,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

async function tableExists(tableName) {
  const [rows] = await db.execute(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName]
  );

  return rows.length > 0;
}

async function getColumns(tableName) {
  const [rows] = await db.execute(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(rows.map((row) => String(row.Field || "").toLowerCase()));
}

async function fetchFirstRow(querySpecs) {
  for (const spec of querySpecs) {
    const [rows] = await db.execute(spec.sql, spec.params || []);
    if (rows.length > 0) {
      return rows[0];
    }
  }

  return null;
}

function selectFirstAvailable(columns, candidates) {
  for (const name of candidates) {
    if (columns.has(name.toLowerCase())) {
      return name;
    }
  }
  return null;
}

function buildUserPrompt({ question, studentData, currentRoute, timings, alternativeRoutes, notes }) {
  return [
    "Question:",
    question,
    "",
    "Student Data:",
    JSON.stringify(studentData, null, 2),
    "",
    "Current Route:",
    JSON.stringify(currentRoute, null, 2),
    "",
    "Timings:",
    JSON.stringify(timings, null, 2),
    "",
    "Alternative Routes:",
    JSON.stringify(alternativeRoutes, null, 2),
    "",
    "Notes:",
    JSON.stringify(notes, null, 2),
    "",
    "Rules:",
    "- Only answer from the provided data.",
    "- If data is missing, clearly say it is not available in the database.",
    "- Keep answer concise and student-friendly.",
    "- When useful, format the response with short labeled sections like Route Details, ETA, Alternative Routes, Timings, and Notes.",
    "- Prefer bullet points for route/stop lists and keep time values as they appear in the database.",
  ].join("\n");
}

function buildPublicPrompt({ question, routes, bookingGuide, notes }) {
  return [
    "Question:",
    question,
    "",
    "Booking Guide:",
    JSON.stringify(bookingGuide, null, 2),
    "",
    "Routes:",
    JSON.stringify(routes, null, 2),
    "",
    "Notes:",
    JSON.stringify(notes, null, 2),
    "",
    "Rules:",
    "- Only answer from the provided booking guide and routes.",
    "- If the information is not in the data, say it is not available.",
    "- Keep the response concise and practical.",
    "- Use labeled sections when useful, such as Booking Steps, Routes, and Notes.",
  ].join("\n");
}

async function generateOpenAIAnswer({ systemPrompt, prompt, fallback }) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const aiAnswer =
      completion.choices && completion.choices[0] && completion.choices[0].message
        ? String(completion.choices[0].message.content || "").trim()
        : "";

    return aiAnswer || fallback || "I could not generate a response from available data.";
  } catch (error) {
    console.warn("OpenAI fallback used:", error.message);
    return fallback || "I could not generate a response from available data.";
  }
}

function buildStudentFallbackAnswer({ student, currentRoute, timings, alternativeRoutes }) {
  const lines = [];
  lines.push(`Route Details: ${currentRoute.route_name || "Not assigned"}`);
  lines.push(
    `Bus Details: Bus ${student.bus_no || "Not assigned"}, Seat ${student.seat_no || "-"}`
  );

  if (currentRoute.start_point || currentRoute.end_point) {
    lines.push(`Current Route: ${currentRoute.start_point || "-"} to ${currentRoute.end_point || "-"}`);
  }

  if (Array.isArray(timings) && timings.length > 0) {
    lines.push("Timings:");
    for (const timing of timings.slice(0, 6)) {
      lines.push(`- ${timing.stop_name}: ${String(timing.arrival_time).slice(0, 5)}`);
    }
  } else {
    lines.push("Timings: Not available in the database.");
  }

  if (Array.isArray(alternativeRoutes) && alternativeRoutes.length > 0) {
    lines.push("Alternative Routes:");
    for (const route of alternativeRoutes.slice(0, 5)) {
      lines.push(`- ${route.route_name}`);
    }
  } else {
    lines.push("Alternative Routes: None found with the same start point.");
  }

  return lines.join("\n");
}

function buildPublicFallbackAnswer({ routes, bookingGuide }) {
  const routeNames = Array.isArray(routes)
    ? routes.slice(0, 8).map((route) => `${route.route_no} - ${route.route_name}`)
    : [];

  return [
    "Booking Steps:",
    ...bookingGuide.map((step) => `- ${step}`),
    "",
    "Available Routes:",
    ...(routeNames.length > 0 ? routeNames.map((route) => `- ${route}`) : ["- Not available in the database"]),
  ].join("\n");
}

exports.askAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();
    const requestedStudentId = req.body.studentId;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const studentId = Number(
      requestedStudentId != null ? requestedStudentId : req.user && req.user.id
    );

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "valid studentId is required",
      });
    }

    const cacheId = cacheKey(studentId, question);
    const cached = readCache(cacheId);
    if (cached) {
      return res.json({
        success: true,
        answer: cached,
        cached: true,
      });
    }

    const studentsColumns = await getColumns("students");
    const routesColumns = await getColumns("routes");

    const studentIdColumn = selectFirstAvailable(studentsColumns, ["user_id", "id"]);
    const studentNameColumn = selectFirstAvailable(studentsColumns, ["name"]);
    const studentRouteColumn = selectFirstAvailable(studentsColumns, ["route_id", "route"]);

    if (!studentIdColumn || !studentNameColumn || !studentRouteColumn) {
      return res.status(500).json({
        success: false,
        message: "Student table schema not supported",
      });
    }

    const routeIdColumn = selectFirstAvailable(routesColumns, ["id", "route_no"]);
    const routeNameColumn = selectFirstAvailable(routesColumns, ["route_name", "name"]);
    const routeStartColumn = selectFirstAvailable(routesColumns, ["start_point"]);
    const routeEndColumn = selectFirstAvailable(routesColumns, ["end_point"]);
    const routeNoColumn = routesColumns.has("route_no") ? "route_no" : null;

    if (!routeIdColumn || !routeNameColumn) {
      return res.status(500).json({
        success: false,
        message: "Routes table schema not supported",
      });
    }

    const [studentRows] = await db.execute(
      `SELECT ${studentIdColumn} AS student_id, ${studentNameColumn} AS name, ${studentRouteColumn} AS route_id
       FROM students
       WHERE ${studentIdColumn} = ?
       LIMIT 1`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.json({
        success: true,
        answer: "Student record was not found in the database.",
      });
    }

    const student = studentRows[0];
    const currentRouteValue = student.route_id;

    if (currentRouteValue == null || currentRouteValue === "") {
      return res.json({
        success: true,
        answer: "Your route is not assigned yet in the database.",
      });
    }

    let currentRouteRecord = await fetchFirstRow([
      {
        sql: `SELECT ${routeIdColumn} AS id, ${routeNoColumn || routeIdColumn} AS route_no, ${routeNameColumn} AS route_name, ${
          routeStartColumn || "NULL"
        } AS start_point, ${routeEndColumn || "NULL"} AS end_point
         FROM routes
         WHERE ${routeIdColumn} = ?
         LIMIT 1`,
        params: [currentRouteValue],
      },
      ...(routeNoColumn && routeNoColumn !== routeIdColumn
        ? [{
            sql: `SELECT ${routeIdColumn} AS id, ${routeNoColumn} AS route_no, ${routeNameColumn} AS route_name, ${
              routeStartColumn || "NULL"
            } AS start_point, ${routeEndColumn || "NULL"} AS end_point
             FROM routes
             WHERE ${routeNoColumn} = ?
             LIMIT 1`,
            params: [currentRouteValue],
          }]
        : []),
      {
        sql: `SELECT ${routeIdColumn} AS id, ${routeNoColumn || routeIdColumn} AS route_no, ${routeNameColumn} AS route_name, ${
          routeStartColumn || "NULL"
        } AS start_point, ${routeEndColumn || "NULL"} AS end_point
         FROM routes
         WHERE ${routeNameColumn} = ?
         LIMIT 1`,
        params: [String(currentRouteValue)],
      },
    ]);

    const [allRoutes] = await db.execute(
      `SELECT ${routeIdColumn} AS id, ${routeNameColumn} AS route_name, ${
        routeStartColumn || "NULL"
      } AS start_point, ${routeEndColumn || "NULL"} AS end_point, ${
        routeNoColumn || routeIdColumn
      } AS route_no
       FROM routes
       ORDER BY ${routeIdColumn}`
    );

    let resolvedRoute = currentRouteRecord;
    if (!resolvedRoute) {
      const normalizedStudentRoute = normalizeValue(currentRouteValue);
      resolvedRoute = allRoutes.find((route) => {
        return (
          normalizeValue(route.id) === normalizedStudentRoute ||
          normalizeValue(route.route_no) === normalizedStudentRoute ||
          normalizeValue(route.route_name) === normalizedStudentRoute
        );
      }) || null;
    }

    if (!resolvedRoute) {
      return res.json({
        success: true,
        answer: "Your route is stored in the student record, but I could not match it to a route in the database.",
      });
    }

    const currentRouteData = resolvedRoute;

    let alternativeRoutes = [];
    if (routeStartColumn && currentRouteData.start_point) {
      const [altRows] = await db.execute(
        `SELECT ${routeIdColumn} AS id, ${routeNameColumn} AS route_name, ${routeStartColumn} AS start_point, ${
          routeEndColumn || "NULL"
        } AS end_point
         FROM routes
         WHERE ${routeStartColumn} = ? AND ${routeIdColumn} != ?
         ORDER BY ${routeIdColumn}`,
        [currentRouteData.start_point, currentRouteData.id]
      );
      alternativeRoutes = altRows;
    }

    let timings = [];
    const notes = [];

    const hasTimingsTable = await tableExists("timings");
    if (hasTimingsTable) {
      const timingsColumns = await getColumns("timings");
      const timingRouteColumn = selectFirstAvailable(timingsColumns, ["route_id"]);
      const timingStopColumn = selectFirstAvailable(timingsColumns, ["stop_name"]);
      const timingArrivalColumn = selectFirstAvailable(timingsColumns, ["arrival_time"]);

      if (timingRouteColumn && timingStopColumn && timingArrivalColumn) {
        const [timingRows] = await db.execute(
          `SELECT ${timingRouteColumn} AS route_id, ${timingStopColumn} AS stop_name, ${timingArrivalColumn} AS arrival_time
           FROM timings
             WHERE ${timingRouteColumn} IN (?, ?)
           ORDER BY ${timingArrivalColumn}`,
            [currentRouteData.id, currentRouteData.route_no]
        );
        timings = timingRows;
      } else {
        notes.push("timings table exists but required columns are missing");
      }
    } else {
      notes.push("timings table not found");
    }

    const finalAnswer = await generateOpenAIAnswer({
      systemPrompt: SYSTEM_PROMPT,
      prompt: buildUserPrompt({
        question,
        studentData: student,
        currentRoute: currentRouteData,
        timings,
        alternativeRoutes,
        notes,
        allRoutes,
      }),
      fallback: buildStudentFallbackAnswer({
        student,
        currentRoute: currentRouteData,
        timings,
        alternativeRoutes,
      }),
    });

    writeCache(cacheId, finalAnswer);

    return res.json({
      success: true,
      answer: finalAnswer,
    });
  } catch (error) {
    console.error("assistant error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.askPublicAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const cacheId = cacheKey("public", question);
    const cached = readCache(cacheId);
    if (cached) {
      return res.json({
        success: true,
        answer: cached,
        cached: true,
      });
    }

    const [routes] = await db.execute(
      `SELECT route_no, route_name, via, student_type
       FROM routes
       ORDER BY route_no`
    );

    const bookingGuide = [
      "Login with college ID and password.",
      "Open the booking procedure page or student dashboard.",
      "Select a route from the available routes list.",
      "Choose an available seat.",
      "Complete payment to activate the bus pass.",
      "After payment, download the bus pass from the dashboard.",
      "For renewal, choose Renewal in the student dashboard and follow the prompts.",
    ];

    const notes = [
      "This assistant answers from booking procedure and route data only.",
      "If a route or stop is not present in the database, say it is not available.",
    ];

    const finalAnswer = await generateOpenAIAnswer({
      systemPrompt: PUBLIC_SYSTEM_PROMPT,
      prompt: buildPublicPrompt({
        question,
        routes,
        bookingGuide,
        notes,
      }),
      fallback: buildPublicFallbackAnswer({
        routes,
        bookingGuide,
      }),
    });

    writeCache(cacheId, finalAnswer);

    return res.json({
      success: true,
      answer: finalAnswer,
    });
  } catch (error) {
    console.error("public assistant error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

