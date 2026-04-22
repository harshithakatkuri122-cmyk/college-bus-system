const OpenAI = require("openai");
const db = require("../config/db");

const CBIT_SYSTEM_PROMPT = [
  "You are an assistant for the CBIT Bus Management System.",
  "You ONLY answer questions related to this system.",
  "",
  "System features:",
  "- Students log in to dashboard",
  "- Click 'Book Bus'",
  "- Select route based on stops and timings",
  "- Choose seat and confirm booking",
  "- Can change bus and download bus pass",
  "",
  "Strict rules:",
  "- DO NOT mention RedBus, Indigo, or any external platforms",
  "- DO NOT give general travel advice",
  "- Always answer based on this system only",
  "- If question is unrelated, say exactly: I can only help with CBIT bus system queries.",
].join("\n");

const SCOPE_ONLY_RESPONSE = "I can only help with CBIT bus system queries.";
const MAX_CHAT_ROUTE_CONTEXT = 8;

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

  if (typeof entry.answer === "string") {
    return {
      answer: entry.answer,
      meta: { source: "cache-legacy" },
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
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeText(value) {
  return normalizeText(value)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTimeToMinutes(timeValue) {
  const match = String(timeValue || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function parseViaStops(via) {
  return String(via || "")
    .split(/->|→|,/) 
    .map((stop) => stop.trim())
    .filter(Boolean);
}

function scoreLocationMatch(location, candidateText) {
  const normalizedLocation = normalizeText(location);
  const normalizedCandidate = normalizeText(candidateText);

  if (!normalizedLocation || !normalizedCandidate) return 0;
  if (normalizedCandidate.includes(normalizedLocation)) return 100;

  const locationTokens = tokenizeText(normalizedLocation);
  const candidateTokens = new Set(tokenizeText(normalizedCandidate));
  const overlap = locationTokens.filter((token) => candidateTokens.has(token)).length;

  if (overlap === 0) return 0;
  return 30 + overlap * 12;
}

function scoreTiming(preferredMinutes, arrivalTimes) {
  if (!Number.isInteger(preferredMinutes)) {
    return { score: 0, bestDiff: null, bestStop: null };
  }

  let bestDiff = null;
  let bestStop = null;

  for (const timing of arrivalTimes) {
    const arrivalMinutes = parseTimeToMinutes(timing.arrival_time);
    if (!Number.isInteger(arrivalMinutes)) continue;

    const diff = Math.abs(preferredMinutes - arrivalMinutes);
    if (bestDiff === null || diff < bestDiff) {
      bestDiff = diff;
      bestStop = timing.stop_name || null;
    }
  }

  if (bestDiff === null) {
    return { score: 0, bestDiff: null, bestStop: null };
  }

  return {
    score: Math.max(0, 90 - bestDiff),
    bestDiff,
    bestStop,
  };
}

function stripCodeFences(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function safeParseJson(value) {
  try {
    return JSON.parse(stripCodeFences(value));
  } catch (error) {
    return null;
  }
}

function buildRoutePromptRoutes(candidateRoutes) {
  return candidateRoutes.map((route) => ({
    id: route.id,
    route_name: route.route_name,
    via: route.via || "",
    student_type: route.student_type || "",
    matched_stop: route.matched_stop || null,
    timing_diff: route.timing_diff,
    timings: Array.isArray(route.timings)
      ? route.timings.map((timing) => ({
          stop_name: timing.stop_name,
          arrival_time: timing.arrival_time,
        }))
      : [],
  }));
}

function resolveAiRouteSelection(parsedResponse, candidateRoutes) {
  const candidatesById = new Map(candidateRoutes.map((route) => [String(route.id), route]));
  const candidatesByName = new Map(
    candidateRoutes.map((route) => [normalizeText(route.route_name), route])
  );

  const pickRoute = (value) => {
    if (!value) return null;

    if (typeof value === "object") {
      if (value.id != null && candidatesById.has(String(value.id))) {
        return candidatesById.get(String(value.id));
      }

      const routeName = value.route_name || value.name;
      if (routeName && candidatesByName.has(normalizeText(routeName))) {
        return candidatesByName.get(normalizeText(routeName));
      }
    }

    const normalizedValue = normalizeText(value);
    if (!normalizedValue) return null;

    if (candidatesById.has(String(value))) {
      return candidatesById.get(String(value));
    }

    return candidatesByName.get(normalizedValue) || null;
  };

  return {
    recommended: pickRoute(parsedResponse?.recommended),
    alternatives: Array.isArray(parsedResponse?.alternatives)
      ? parsedResponse.alternatives.map(pickRoute).filter(Boolean)
      : [],
  };
}

function buildRouteSuggestionResponse({ recommendedRoute, alternativeRoutes, explanation }) {
  return {
    recommended: recommendedRoute
      ? { id: recommendedRoute.id, route_name: recommendedRoute.route_name }
      : null,
    alternatives: Array.isArray(alternativeRoutes)
      ? alternativeRoutes.map((route) => ({ id: route.id, route_name: route.route_name }))
      : [],
    explanation: String(explanation || "Best route based on nearest stop and suitable timing"),
  };
}

function normalizeSearchTerm(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function parseBoardingTimeToMinutes(value) {
  return parseTimeToMinutes(value);
}

function selectBestRouteCandidate(candidates, boardingMinutes) {
  let best = null;

  for (const candidate of candidates) {
    const arrivalMinutes = parseTimeToMinutes(candidate.arrival_time);
    if (!Number.isInteger(arrivalMinutes)) continue;

    const timeDiff = Math.abs(arrivalMinutes - boardingMinutes);
    const isAfter = arrivalMinutes >= boardingMinutes;

    const score = {
      ...candidate,
      arrivalMinutes,
      timeDiff,
      isAfter,
    };

    if (!best) {
      best = score;
      continue;
    }

    if (best.isAfter !== score.isAfter) {
      if (score.isAfter) best = score;
      continue;
    }

    if (score.timeDiff < best.timeDiff) {
      best = score;
      continue;
    }

    if (score.timeDiff === best.timeDiff && Number(score.route_no) < Number(best.route_no)) {
      best = score;
    }
  }

  return best;
}

function isRouteIntentQuestion(question) {
  const text = normalizeText(question);
  if (!text) return false;

  return /\b(route|routes|stop|stops|timing|timings|eta|which bus|bus for|via|uppal|ecil|nagole|amberpet|lb nagar|mehdipatnam|kukatpally|dilsukhnagar|secunderabad)\b/.test(
    text
  );
}

function isCasualMessage(question) {
  const normalized = String(question || "").trim().toLowerCase();
  if (!normalized) return false;

  return /^(hi|hii|hello|hey|yo|how are you|how r u|what'?s up|sup|good morning|good afternoon|good evening|thanks|thank you)$/.test(
    normalized
  );
}

function isInCbitAssistantScope(question) {
  const text = normalizeText(question);
  if (!text) return false;

  if (isCasualMessage(question)) {
    return true;
  }

  if (/\b(redbus|indigo|makemytrip|uber|ola|flight|airline|train|railway|hotel|tourism|trip)\b/.test(text)) {
    return false;
  }

  return /\b(cbit|bus|buses|route|routes|seat|seats|timing|timings|eta|stop|stops|booking|book|renew|renewal|pass|dashboard|login|transport|change bus|download bus pass|junior|juniors|senior|seniors)\b/.test(
    text
  );
}

function detectRouteCountType(question) {
  const text = normalizeText(question);
  if (!text) return null;

  const asksCount = /\b(how many|count|number of|total)\b/.test(text);
  const asksRoute = /\b(route|routes)\b/.test(text);
  if (!asksCount || !asksRoute) return null;

  if (/\b(junior|juniors|1st year|first year)\b/.test(text)) return "junior";
  if (/\b(senior|seniors|2nd year|second year|3rd year|third year|4th year|fourth year)\b/.test(text)) return "senior";

  return "all";
}

async function buildRouteCountReply(type) {
  if (type === "junior" || type === "senior") {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM routes
       WHERE LOWER(COALESCE(student_type, '')) = ?`,
      [type]
    );

    const total = Number(rows?.[0]?.total || 0);
    return `There are ${total} ${type} routes available in the CBIT bus system.`;
  }

  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM routes`
  );
  const total = Number(rows?.[0]?.total || 0);
  return `There are ${total} total routes available in the CBIT bus system.`;
}

async function searchStops(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      return res.json([]);
    }

    const searchTerm = normalizeSearchTerm(q);
    const [rows] = await db.execute(
      `SELECT DISTINCT stop_name
       FROM timings
       WHERE LOWER(REPLACE(stop_name, ' ', '')) LIKE LOWER(CONCAT(?, '%'))
       ORDER BY stop_name
       LIMIT 10`,
      [searchTerm]
    );

    return res.json(Array.isArray(rows) ? rows.map((row) => row.stop_name) : []);
  } catch (error) {
    console.error("stop search error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function fetchRoutesWithTimings() {
  const [routeRows] = await db.execute(
    `SELECT route_no, route_name, via, student_type
     FROM routes
     ORDER BY route_no`
  );

  const routes = Array.isArray(routeRows) ? routeRows : [];
  if (routes.length === 0) return [];

  const routeIds = routes
    .map((route) => Number(route.route_no))
    .filter((routeId) => Number.isInteger(routeId));

  let timingRows = [];
  if (routeIds.length > 0) {
    const placeholders = routeIds.map(() => "?").join(", ");
    const [timings] = await db.execute(
      `SELECT route_id, stop_name, arrival_time
       FROM timings
       WHERE route_id IN (${placeholders})
       ORDER BY route_id, arrival_time`,
      routeIds
    );
    timingRows = Array.isArray(timings) ? timings : [];
  }

  return routes.map((route) => {
    const routeId = Number(route.route_no);
    const routeTimings = timingRows.filter((timing) => Number(timing.route_id) === routeId);
    return {
      id: routeId,
      route_name: route.route_name,
      via: route.via || "",
      student_type: route.student_type || "",
      timings: routeTimings,
    };
  });
}

function buildRouteContextLines(question, routes) {
  const scored = routes
    .map((route) => {
      const routeText = [
        route.route_name,
        route.via,
        ...route.timings.map((timing) => timing.stop_name),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...route,
        score: scoreLocationMatch(question, routeText),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.id - right.id;
    })
    .slice(0, MAX_CHAT_ROUTE_CONTEXT);

  return scored.map((route) => {
    const firstTiming = Array.isArray(route.timings) && route.timings.length > 0 ? route.timings[0] : null;
    const timingText = firstTiming ? `${firstTiming.stop_name} -> ${firstTiming.arrival_time}` : "Timing unavailable";
    const viaText = route.via ? ` (${route.via})` : "";
    return `- Route ${route.id}: ${route.route_name}${viaText} -> ${timingText}`;
  });
}

function buildCbitAssistantPrompt({ question, conversationHistory, mode, routeContextLines }) {
  const routeIntent = isRouteIntentQuestion(question);

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
    "Available Routes and Timings:",
    routeContextLines.length > 0 ? routeContextLines.join("\n") : "- No route data available",
    "",
    "Response Rules:",
    "- Keep answer concise and app-specific (2-5 lines).",
    "- Use only CBIT Bus Management System context.",
    "- For route-related questions, suggest from Available Routes and Timings only.",
    "- If unrelated to CBIT bus system, reply exactly: I can only help with CBIT bus system queries.",
    routeIntent
      ? "- Route-related output format: Line 1 `Best route: ...`, Line 2 `Timing: ...`, Line 3 `Reason: ...`. Keep each line short."
      : "- For non-route questions, answer in 1-3 short lines specific to this app.",
  ].join("\n");
}

function applyAssistantOutputGuardrails({ answer, question }) {
  let text = String(answer || "").trim();
  if (!text) return "";

  if (/\b(redbus|indigo|makemytrip|uber|ola|airline|flight|hotel|tourism)\b/i.test(text)) {
    return SCOPE_ONLY_RESPONSE;
  }

  const routeIntent = isRouteIntentQuestion(question);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (routeIntent) {
    const kept = lines.slice(0, 3);
    text = kept.join("\n");
  } else {
    const kept = lines.slice(0, 4);
    text = kept.join("\n");
  }

  if (text.length > 500) {
    text = text.slice(0, 500).trim();
  }

  return text || "I can only help with CBIT bus system queries.";
}

function isTransportQuestion(question) {
  const text = String(question || "").trim().toLowerCase();
  if (!text) return false;

  return /\b(bus|route|seat|stop|timing|eta|pass|booking|renew|renewal|transport|driver|pickup|drop|college bus|cbit bus|fare|payment)\b/.test(
    text
  );
}

function pickVariant(variants, question, history = []) {
  if (!Array.isArray(variants) || variants.length === 0) return "";

  const seedText = `${String(question || "").toLowerCase()}|${history.length}`;
  let hash = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash * 31 + seedText.charCodeAt(i)) % 2147483647;
  }

  return variants[Math.abs(hash) % variants.length];
}

function buildCasualReply({ question, mode, history }) {
  const q = String(question || "").trim().toLowerCase();
  const isHowAreYou = /^(how are you|how r u|what'?s up|sup)$/.test(q);

  if (mode === "public") {
    if (isHowAreYou) {
      return pickVariant(
        [
          "Doing well, thanks. I can help with bus pass booking, renewals, and route info.",
          "All good here. Ask me about booking steps, route details, or pass renewal.",
          "I am doing great. Want help with bus pass booking or checking route options?",
        ],
        question,
        history
      );
    }

    return pickVariant(
      [
        "Hi. I can help with bus pass booking steps, route info, and renewal guidance.",
        "Hello. Ask me about booking a pass, renewing it, or checking available routes.",
        "Hey. I can guide you through booking, payment steps, and route-related questions.",
      ],
      question,
      history
    );
  }

  if (isHowAreYou) {
    return pickVariant(
      [
        "I am good, thanks. I can help with your route, ETA, seat details, or alternatives.",
        "Doing well. Ask me about your bus timing, assigned route, or route alternatives.",
        "I am fine. If you want, I can check route-related details and transport info for you.",
      ],
      question,
      history
    );
  }

  return pickVariant(
    [
      "Hi. I can help with route suggestions, booking, and timing questions.",
      "Hello. I can help with route details, ETA, bus timings, and booking-related questions.",
      "Hey. Ask me about your route, arrival timings, seat info, or booking flow.",
    ],
    question,
    history
  );
}

function buildFallbackReply({ question, mode, history }) {
  const transport = isTransportQuestion(question);

  if (mode === "public") {
    if (transport) {
      return pickVariant(
        [
          "I could not fetch a live AI answer right now, but I can still help. Try asking with route name, stop, or whether this is for booking or renewal.",
          "I am in fallback mode at the moment. Please include your stop/route and whether you need booking or renewal steps.",
          "Live AI is temporarily unavailable. Ask in one line with key details like route, stop, and booking/renewal so I can guide you better.",
        ],
        question,
        history
      );
    }

    return pickVariant(
      [
        "I am in fallback mode right now. Please rephrase your question in one line and I will still try to help.",
        "I could not generate a live response right now. Ask again with a little more detail and I will guide you.",
        "Temporary fallback mode is active. Share a bit more context and I will provide the best possible answer.",
      ],
      question,
      history
    );
  }

  if (transport) {
    return pickVariant(
      [
        "I could not get a live AI response right now, but I can still help with transport queries. Include your route/stop and what you want to know (ETA, timing, seat, or alternatives).",
        "I am currently in fallback mode. Share your route or pickup point and I can give a more useful transport answer.",
        "Live response is temporarily unavailable. Ask with details like route number, stop name, and whether you need ETA or alternative routes.",
      ],
      question,
      history
    );
  }

  return pickVariant(
    [
      "I can help with that. Please ask again with a bit more detail.",
      "I could not generate a full live answer right now. Rephrase your question with more context and I will try again.",
      "Please share a little more detail, and I will provide the best answer I can in fallback mode.",
    ],
    question,
    history
  );
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
    const errorCode = String(error?.code || "").toLowerCase();
    const status = Number(error?.status || 0);
    const isAuthError = status === 401 || errorCode === "invalid_api_key";
    const isQuotaError = status === 429;

    console.warn(
      `LLM fallback used (${provider}): status=${status || "n/a"} code=${errorCode || "n/a"} message=${error.message}`
    );

    const fallbackAnswer = isAuthError
      ? `Live AI is unavailable because ${provider.toUpperCase()} authentication failed. Please verify ${provider.toUpperCase()} API key configuration.`
      : isQuotaError
        ? `Live AI is temporarily unavailable due to provider rate limits. Please retry in a moment.`
        : fallback || "I could not generate a response from available data.";

    return {
      answer: fallbackAnswer,
      meta: {
        source: "fallback",
        provider,
        errorCode: errorCode || null,
        status: status || null,
      },
    };
  }
}

exports.askAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();
    const history = normalizeHistory(req.body.history);

    if (!question) {
      return res.status(400).json({ success: false, message: "question is required" });
    }

    const routeCountType = detectRouteCountType(question);
    if (routeCountType) {
      const reply = await buildRouteCountReply(routeCountType);
      return res.json({
        success: true,
        answer: reply,
        meta: { source: "db-rule" },
      });
    }

    if (!isInCbitAssistantScope(question)) {
      return res.json({
        success: true,
        answer: SCOPE_ONLY_RESPONSE,
        meta: { source: "scope-guard" },
      });
    }

    let routeContextLines = [];
    if (isRouteIntentQuestion(question)) {
      const routes = await fetchRoutesWithTimings();
      routeContextLines = buildRouteContextLines(question, routes);
    }

    const answer = await generateOpenAIAnswer({
      systemPrompt: CBIT_SYSTEM_PROMPT,
      prompt: buildCbitAssistantPrompt({
        question,
        conversationHistory: history,
        mode: "student",
        routeContextLines,
      }),
      fallback: buildFallbackReply({ question, mode: "student", history }),
    });

    return res.json({
      success: true,
      answer: applyAssistantOutputGuardrails({ answer: answer.answer, question }),
      meta: answer.meta,
    });
  } catch (error) {
    console.error("assistant error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.askPublicAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();
    const history = normalizeHistory(req.body.history);

    if (!question) {
      return res.status(400).json({ success: false, message: "question is required" });
    }

    const routeCountType = detectRouteCountType(question);
    if (routeCountType) {
      const reply = await buildRouteCountReply(routeCountType);
      return res.json({
        success: true,
        answer: reply,
        meta: { source: "db-rule" },
      });
    }

    if (!isInCbitAssistantScope(question)) {
      return res.json({
        success: true,
        answer: SCOPE_ONLY_RESPONSE,
        meta: { source: "scope-guard" },
      });
    }

    let routeContextLines = [];
    if (isRouteIntentQuestion(question)) {
      const routes = await fetchRoutesWithTimings();
      routeContextLines = buildRouteContextLines(question, routes);
    }

    const answer = await generateOpenAIAnswer({
      systemPrompt: CBIT_SYSTEM_PROMPT,
      prompt: buildCbitAssistantPrompt({
        question,
        conversationHistory: history,
        mode: "public",
        routeContextLines,
      }),
      fallback: buildFallbackReply({ question, mode: "public", history }),
    });

    return res.json({
      success: true,
      answer: applyAssistantOutputGuardrails({ answer: answer.answer, question }),
      meta: answer.meta,
    });
  } catch (error) {
    console.error("public assistant error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.suggestRoute = async (req, res) => {
  try {
    console.log("[AI suggest-route] request body:", req.body);

    const location = String(req.body.location || "").trim();
    const boardingTime = String(req.body.boarding_time || req.body.preferred_time || "").trim();
    const studentType = String(req.body.student_type || "").trim().toLowerCase();

    console.log("[AI suggest-route] Location:", location);
    console.log("[AI suggest-route] Boarding Time:", boardingTime);
    console.log("[AI suggest-route] Student Type:", studentType);

    if (!location || !boardingTime || !studentType) {
      const payload = buildRouteSuggestionResponse({
        recommendedRoute: null,
        alternativeRoutes: [],
        explanation: "Location, boarding time, and student type are required",
      });

      console.log("[AI suggest-route] final response:", payload);
      return res.status(400).json(payload);
    }

    const studentTypeLike = `%${normalizeText(studentType).replace(/\s+/g, "")}%`;
    const locationLike = location;
    const boardingMinutes = parseBoardingTimeToMinutes(boardingTime);

    if (!Number.isInteger(boardingMinutes)) {
      const payload = buildRouteSuggestionResponse({
        recommendedRoute: null,
        alternativeRoutes: [],
        explanation: "Invalid boarding time",
      });

      console.log("[AI suggest-route] final response:", payload);
      return res.status(400).json(payload);
    }

     const locationFirstQuery = `SELECT r.route_no, r.route_name, r.via, r.student_type, t.stop_name, t.arrival_time, b.id AS bus_id
       FROM routes r
       INNER JOIN timings t ON r.route_no = t.route_id
       LEFT JOIN buses b ON b.route_no = r.route_no
       WHERE REPLACE(LOWER(COALESCE(r.student_type, '')), ' ', '') LIKE ?
       AND (
         LOWER(REPLACE(t.stop_name, ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', ?, '%'), ' ', ''))
         OR LOWER(REPLACE(r.route_name, ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', ?, '%'), ' ', ''))
       )
       ORDER BY r.route_no, t.arrival_time`;

    const sqlParams = [studentTypeLike, locationLike, locationLike];
    console.log("[AI suggest-route] SQL:", locationFirstQuery);
    console.log("[AI suggest-route] SQL Params:", sqlParams);

    const [matchedRows] = await db.execute(locationFirstQuery, sqlParams);

    console.log(
      "[AI suggest-route] DB result count:",
      Array.isArray(matchedRows) ? matchedRows.length : 0
    );

    const routeMap = new Map();
    for (const row of Array.isArray(matchedRows) ? matchedRows : []) {
      const routeId = Number(row.route_no);
      if (!Number.isInteger(routeId)) continue;

      const current = routeMap.get(routeId) || {
        id: routeId,
        route_name: row.route_name,
        via: row.via || "",
        student_type: row.student_type || studentType,
        has_bus: row.bus_id != null,
        candidates: [],
      };

      current.candidates.push(row);
      routeMap.set(routeId, current);
    }

    const routeRows = Array.from(routeMap.values());

    if (routeRows.length === 0) {
      const payload = buildRouteSuggestionResponse({
        recommendedRoute: null,
        alternativeRoutes: [],
        explanation: "No routes found near your location",
      });

      console.log("[AI suggest-route] final response:", payload);
      return res.json(payload);
    }

    const scoredRoutes = routeRows
      .map((route) => {
        const bestCandidate = selectBestRouteCandidate(route.candidates, boardingMinutes);
        if (!bestCandidate) return null;

        return {
          id: route.id,
          route_name: route.route_name,
          via: route.via || "",
          student_type: route.student_type || studentType,
          has_bus: Boolean(route.has_bus),
          score: bestCandidate.timeDiff + (bestCandidate.isAfter ? 0 : 1000),
          matched_stop: bestCandidate.stop_name,
          timing_diff: bestCandidate.timeDiff,
          isAfter: bestCandidate.isAfter,
          matched_arrival_time: bestCandidate.arrival_time,
          timings: route.candidates,
        };
      })
      .filter(Boolean)
      .sort((left, right) => {
        if (left.has_bus !== right.has_bus) {
          return left.has_bus ? -1 : 1;
        }

        if (left.isAfter !== right.isAfter) {
          return left.isAfter ? -1 : 1;
        }

        if (left.timing_diff !== right.timing_diff) {
          return left.timing_diff - right.timing_diff;
        }

        return left.id - right.id;
      });

    console.log(
      "[AI suggest-route] final ranking:",
      scoredRoutes.slice(0, 3).map((route) => ({
        id: route.id,
        route_name: route.route_name,
        has_bus: route.has_bus,
        matched_stop: route.matched_stop,
        timing_diff: route.timing_diff,
        score: route.score,
      }))
    );

    const recommendedRoute = scoredRoutes[0] || null;
    const alternativeRoutes = scoredRoutes.slice(1, 3);

    const explanation = recommendedRoute
      ? `Route ${recommendedRoute.route_name} is the best option because it reaches ${recommendedRoute.matched_stop || "the nearest stop"} closest to ${boardingTime}.`
      : "No routes found near your location";

    const payload = buildRouteSuggestionResponse({
      recommendedRoute,
      alternativeRoutes,
      explanation,
    });

    console.log("[AI suggest-route] final response:", payload);
    return res.json(payload);
  } catch (error) {
    console.error("[AI suggest-route] error:", error);
    return res.status(500).json({
      recommended: null,
      alternatives: [],
      explanation: "Server error while generating suggestion",
    });
  }
};

exports.searchStops = searchStops;
