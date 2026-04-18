const OpenAI = require("openai");
const db = require("../config/db");

const SYSTEM_PROMPT =
  "You are a helpful AI assistant for CBIT transport users. For transport-related questions, prioritize the provided database context. For general questions, answer like a normal helpful AI assistant.";

const PUBLIC_SYSTEM_PROMPT =
  "You are a helpful AI assistant for CBIT website visitors. For transport-related questions, use the provided booking guide and route data. For general questions, answer naturally and helpfully.";

const GENERAL_SYSTEM_PROMPT =
  "You are a helpful, clear, and conversational AI assistant. Answer naturally and directly.";

const CACHE_TTL_MS = Number(process.env.ASSISTANT_CACHE_TTL_MS || 2 * 60 * 1000);
const MAX_HISTORY_MESSAGES = 8;
const answerCache = new Map();

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .map((item) => ({
      role: item.role,
      content: String(item.content || "").trim().slice(0, 500),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES);
}

function cacheKey(scope, question, history = []) {
  const historyPart = history
    .map((item) => `${item.role}:${item.content.toLowerCase()}`)
    .join("|");
  return `${scope}::${String(question || "").trim().toLowerCase()}::${historyPart}`;
}

function readCache(key) {
  const entry = answerCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    answerCache.delete(key);
    return null;
  }

  if (entry.payload && typeof entry.payload.answer === "string") {
    return entry.payload;
  }

  // Backward compatibility for older cached string-only entries.
  if (typeof entry.answer === "string") {
    return {
      answer: entry.answer,
      meta: {
        source: "cache-legacy",
      },
    };
  }

  return null;
}

function writeCache(key, payload) {
  answerCache.set(key, {
    payload,
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

function isCasualMessage(question) {
  const normalized = String(question || "").trim().toLowerCase();
  if (!normalized) return false;

  return /^(hi|hii|hello|hey|yo|how are you|how r u|what'?s up|sup|good morning|good afternoon|good evening)$/.test(
    normalized
  );
}

function buildCasualReply(mode) {
  if (mode === "public") {
    return [
      "Hi. I am doing well, thanks for asking.",
      "I can help with bus pass booking steps, route info, and renewal guidance.",
      "Try asking: How do I book a bus pass?",
    ].join("\n");
  }

  return [
    "Hi. I am doing well, thanks for asking.",
    "I can help you with your route, ETA, timings, and alternative routes.",
    "Try asking: What is my current route and seat?",
  ].join("\n");
}

function isTransportQuestion(question) {
  const text = String(question || "").trim().toLowerCase();
  if (!text) return false;

  return /\b(bus|route|seat|stop|timing|eta|pass|booking|renew|renewal|transport|driver|pickup|drop|college bus|cbit bus|fare|payment)\b/.test(
    text
  );
}

function buildGeneralPrompt({ question, conversationHistory, mode }) {
  return [
    "Mode:",
    mode,
    "",
    "Recent Conversation:",
    JSON.stringify(conversationHistory || [], null, 2),
    "",
    "User Question:",
    question,
    "",
    "Style Rules:",
    "- Answer directly and naturally.",
    "- Keep tone friendly and human.",
    "- Use short bullets only when useful.",
  ].join("\n");
}

function buildUserPrompt({ question, conversationHistory, studentData, currentRoute, timings, alternativeRoutes, notes }) {
  return [
    "Question:",
    question,
    "",
    "Recent Conversation:",
    JSON.stringify(conversationHistory || [], null, 2),
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
    "- If the question is transport-related, prioritize the provided data.",
    "- If data is missing, clearly say it is not available in the database.",
    "- Keep answer concise, student-friendly, and natural.",
    "- If the question is a follow-up, use Recent Conversation for context.",
    "- Avoid repeating the same wording across turns; vary phrasing naturally.",
    "- Use short labeled sections only when they improve clarity.",
    "- For simple questions, answer in 2-5 lines without unnecessary headings.",
    "- Prefer bullet points for route/stop lists and keep time values as they appear in the database.",
  ].join("\n");
}

function buildPublicPrompt({ question, conversationHistory, routes, bookingGuide, notes }) {
  return [
    "Question:",
    question,
    "",
    "Recent Conversation:",
    JSON.stringify(conversationHistory || [], null, 2),
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
    "- If the question is transport-related, prioritize the provided booking guide and routes.",
    "- If the information is not in the data, say it is not available.",
    "- Keep the response concise, practical, and conversational.",
    "- If the question is a follow-up, use Recent Conversation for context.",
    "- Avoid repetitive phrasing across turns.",
    "- Use labeled sections only when useful, such as Booking Steps, Routes, and Notes.",
    "- For straightforward questions, prefer a direct 2-5 line reply.",
  ].join("\n");
}

async function generateOpenAIAnswer({ systemPrompt, prompt, fallback }) {
  const useGroq = Boolean(process.env.GROQ_API_KEY);
  const provider = useGroq ? "groq" : "openai";

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    if (!groqApiKey && !openAIApiKey) {
      throw new Error("Neither GROQ_API_KEY nor OPENAI_API_KEY is configured");
    }

    const client = useGroq
      ? new OpenAI({
          apiKey: groqApiKey,
          baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
        })
      : new OpenAI({ apiKey: openAIApiKey });

    const model = useGroq
      ? process.env.GROQ_MODEL || "llama-3.1-8b-instant"
      : process.env.OPENAI_MODEL || "gpt-4o-mini";

    const configuredTemperature = Number(process.env.ASSISTANT_TEMPERATURE || 0.35);
    const temperature = Number.isFinite(configuredTemperature)
      ? Math.min(Math.max(configuredTemperature, 0), 1)
      : 0.35;

    const completion = await client.chat.completions.create({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const aiAnswer =
      completion.choices && completion.choices[0] && completion.choices[0].message
        ? String(completion.choices[0].message.content || "").trim()
        : "";

    const hasModelAnswer = Boolean(aiAnswer);
    return {
      answer: aiAnswer || fallback || "I could not generate a response from available data.",
      meta: {
        source: hasModelAnswer ? "llm" : "fallback",
        provider,
      },
    };
  } catch (error) {
    console.warn("LLM fallback used:", error.message);
    return {
      answer: fallback || "I could not generate a response from available data.",
      meta: {
        source: "fallback",
        provider,
      },
    };
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

function buildPublicFallbackAnswer({ question, routes, bookingGuide }) {
  const normalizedQuestion = String(question || "").toLowerCase();

  if (isCasualMessage(normalizedQuestion)) {
    return buildCasualReply("public");
  }

  const wantsBookingHelp = /book|booking|renew|renewal|payment|pass|steps|procedure/.test(
    normalizedQuestion
  );

  const routeNames = Array.isArray(routes)
    ? routes.slice(0, 8).map((route) => `${route.route_no} - ${route.route_name}`)
    : [];

  if (!wantsBookingHelp) {
    return [
      "I can help with CBIT transport topics: booking steps, renewal, and available routes.",
      "That specific query is outside the transport data I currently have.",
      "Try asking: Which routes are available from Amberpet?",
    ].join("\n");
  }

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
    const history = normalizeHistory(req.body.history);
    const transportQuery = isTransportQuestion(question);

    if (isCasualMessage(question)) {
      return res.json({
        success: true,
        answer: buildCasualReply("student"),
        meta: {
          source: "rule",
        },
      });
    }

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

    if (!transportQuery) {
      const generalAnswer = await generateOpenAIAnswer({
        systemPrompt: GENERAL_SYSTEM_PROMPT,
        prompt: buildGeneralPrompt({
          question,
          conversationHistory: history,
          mode: "student",
        }),
        fallback: "I can help with that. Please ask your question again with a bit more detail.",
      });

      return res.json({
        success: true,
        answer: generalAnswer.answer,
        meta: generalAnswer.meta,
      });
    }

    const cacheId = cacheKey(studentId, question, history);
    const cached = readCache(cacheId);
    if (cached) {
      return res.json({
        success: true,
        answer: cached.answer,
        cached: true,
        meta: {
          ...(cached.meta || {}),
          cached: true,
        },
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
        conversationHistory: history,
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
      answer: finalAnswer.answer,
      meta: finalAnswer.meta,
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
    const history = normalizeHistory(req.body.history);
    const transportQuery = isTransportQuestion(question);

    if (isCasualMessage(question)) {
      return res.json({
        success: true,
        answer: buildCasualReply("public"),
        meta: {
          source: "rule",
        },
      });
    }

    if (!transportQuery) {
      const generalAnswer = await generateOpenAIAnswer({
        systemPrompt: GENERAL_SYSTEM_PROMPT,
        prompt: buildGeneralPrompt({
          question,
          conversationHistory: history,
          mode: "public",
        }),
        fallback: "I can help with that. Please ask your question again with a bit more detail.",
      });

      return res.json({
        success: true,
        answer: generalAnswer.answer,
        meta: generalAnswer.meta,
      });
    }

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const cacheId = cacheKey("public", question, history);
    const cached = readCache(cacheId);
    if (cached) {
      return res.json({
        success: true,
        answer: cached.answer,
        cached: true,
        meta: {
          ...(cached.meta || {}),
          cached: true,
        },
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
        conversationHistory: history,
        routes,
        bookingGuide,
        notes,
      }),
      fallback: buildPublicFallbackAnswer({
        question,
        routes,
        bookingGuide,
      }),
    });

    writeCache(cacheId, finalAnswer);

    return res.json({
      success: true,
      answer: finalAnswer.answer,
      meta: finalAnswer.meta,
    });
  } catch (error) {
    console.error("public assistant error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

