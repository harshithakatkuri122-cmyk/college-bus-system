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

function isCasualMessage(question) {
  const normalized = String(question || "").trim().toLowerCase();
  if (!normalized) return false;

  return /^(hi|hii|hello|hey|yo|how are you|how r u|what'?s up|sup|good morning|good afternoon|good evening)$/.test(
    normalized
  );
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

exports.askAssistant = async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();
    const history = normalizeHistory(req.body.history);

    if (!question) {
      return res.status(400).json({ success: false, message: "question is required" });
    }

    if (isCasualMessage(question)) {
      return res.json({
        success: true,
        answer: "Hi. I can help with route suggestions, booking, and timing questions.",
        meta: { source: "rule" },
      });
    }

    const answer = await generateOpenAIAnswer({
      systemPrompt: GENERAL_SYSTEM_PROMPT,
      prompt: buildGeneralPrompt({
        question,
        conversationHistory: history,
        mode: "student",
      }),
      fallback: "I can help with that. Please ask your question again with a bit more detail.",
    });

    return res.json({ success: true, answer: answer.answer, meta: answer.meta });
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

    if (isCasualMessage(question)) {
      return res.json({
        success: true,
        answer: "Hi. I can help with bus pass booking steps, route info, and renewal guidance.",
        meta: { source: "rule" },
      });
    }

    const answer = await generateOpenAIAnswer({
      systemPrompt: GENERAL_SYSTEM_PROMPT,
      prompt: buildGeneralPrompt({
        question,
        conversationHistory: history,
        mode: "public",
      }),
      fallback: "I can help with that. Please ask your question again with a bit more detail.",
    });

    return res.json({ success: true, answer: answer.answer, meta: answer.meta });
  } catch (error) {
    console.error("public assistant error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.suggestRoute = async (req, res) => {
  try {
    console.log("[AI suggest-route] request body:", req.body);

    const location = String(req.body.location || "").trim();
    const preferredTime = String(req.body.preferred_time || "").trim();
    const studentType = String(req.body.student_type || "").trim().toLowerCase();

    if (!location || !preferredTime || !studentType) {
      const payload = buildRouteSuggestionResponse({
        recommendedRoute: null,
        alternativeRoutes: [],
        explanation: "Location, preferred time, and student type are required",
      });

      console.log("[AI suggest-route] final response:", payload);
      return res.status(400).json(payload);
    }

    const studentTypeLike = `%${normalizeText(studentType).replace(/\s+/g, "")}%`;

    const [typedRouteRows] = await db.execute(
      `SELECT route_no, route_name, via, student_type
       FROM routes
       WHERE REPLACE(LOWER(COALESCE(student_type, '')), ' ', '') LIKE ?
       ORDER BY route_no`,
      [studentTypeLike]
    );

    console.log(
      "[AI suggest-route] DB result count:",
      Array.isArray(typedRouteRows) ? typedRouteRows.length : 0
    );

    let routeRows = Array.isArray(typedRouteRows) ? typedRouteRows : [];

    if (routeRows.length === 0) {
      const [allRoutes] = await db.execute(
        `SELECT route_no, route_name, via, student_type
         FROM routes
         ORDER BY route_no`
      );

      routeRows = Array.isArray(allRoutes) ? allRoutes : [];
      console.log(
        "[AI suggest-route] student-type fallback empty; using all-routes fallback count:",
        routeRows.length
      );
    }

    if (routeRows.length === 0) {
      const payload = buildRouteSuggestionResponse({
        recommendedRoute: null,
        alternativeRoutes: [],
        explanation: "No routes available",
      });

      console.log("[AI suggest-route] final response:", payload);
      return res.json(payload);
    }

    const routeIds = routeRows
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

    console.log("[AI suggest-route] timing rows count:", timingRows.length);

    const preferredMinutes = parseTimeToMinutes(preferredTime);
    const locationTokens = tokenizeText(location);

    const scoredRoutes = routeRows.map((route) => {
      const routeId = Number(route.route_no);
      const routeTimings = timingRows.filter((timing) => Number(timing.route_id) === routeId);
      const routeStops = parseViaStops(route.via);
      const routeText = [route.route_name, route.via, ...routeStops, ...routeTimings.map((timing) => timing.stop_name)]
        .filter(Boolean)
        .join(" ");

      const locationScore = scoreLocationMatch(location, routeText);
      const timingScoreData = scoreTiming(preferredMinutes, routeTimings);
      const typeBonus = normalizeValue(route.student_type) === normalizeValue(studentType) ? 10 : 0;
      const timingPriority = timingScoreData.score * 5;
      const stopBonus = locationTokens.some((token) => normalizeText(routeText).includes(token)) ? 15 : 0;

      return {
        id: routeId,
        route_name: route.route_name,
        via: route.via || "",
        student_type: route.student_type || studentType,
        score: timingPriority + stopBonus + locationScore + typeBonus,
        matched_stop: timingScoreData.bestStop,
        timing_diff: timingScoreData.bestDiff,
        timings: routeTimings,
      };
    });

    scoredRoutes.sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.id - right.id;
    });

    console.log(
      "[AI suggest-route] final ranking:",
      scoredRoutes.slice(0, 3).map((route) => ({
        id: route.id,
        route_name: route.route_name,
        matched_stop: route.matched_stop,
        timing_diff: route.timing_diff,
        score: route.score,
      }))
    );

    let payload;

    try {
      const llmResponse = await generateOpenAIAnswer({
        systemPrompt:
          "You are a CBIT bus route suggestion assistant. Choose only from the provided routes. Return strict JSON only with keys recommended, alternatives, and explanation. recommended must be one of the provided routes, alternatives must contain exactly two routes from the provided routes, and explanation should be one short sentence.",
        prompt: [
          `User location: ${location}, preferred time: ${preferredTime}.`,
          `From these routes: ${JSON.stringify(buildRoutePromptRoutes(scoredRoutes.slice(0, 8)), null, 2)},`,
          "select best route and 2 alternatives based on nearest stop and timing.",
          "Return JSON in this exact shape:",
          '{"recommended":{"id":1,"route_name":"Route Name"},"alternatives":[{"id":2,"route_name":"Route Name"},{"id":3,"route_name":"Route Name"}],"explanation":"Short reason here"}',
        ].join("\n"),
        fallback: "",
      });

      const parsedResponse = safeParseJson(llmResponse.answer);
      const resolvedSelection = resolveAiRouteSelection(parsedResponse, scoredRoutes);

      const fallbackRecommended = scoredRoutes[0] || null;
      const fallbackAlternatives = scoredRoutes.slice(1, 3);

      const recommendedRoute = resolvedSelection.recommended || fallbackRecommended;
      const alternativeRoutes = (resolvedSelection.alternatives.length > 0
        ? resolvedSelection.alternatives
        : fallbackAlternatives
      )
        .filter((route) => !recommendedRoute || Number(route.id) !== Number(recommendedRoute.id))
        .slice(0, 2);

      const explanation =
        (parsedResponse && typeof parsedResponse.explanation === "string"
          ? parsedResponse.explanation.trim()
          : "") || "Best route based on nearest stop and suitable timing";

      payload = buildRouteSuggestionResponse({
        recommendedRoute,
        alternativeRoutes,
        explanation,
      });
    } catch (groqError) {
      console.warn("[AI suggest-route] Groq fallback used:", groqError.message);
      payload = buildRouteSuggestionResponse({
        recommendedRoute: scoredRoutes[0] || null,
        alternativeRoutes: scoredRoutes.slice(1, 3),
        explanation: "Best route based on nearest stop and suitable timing",
      });
    }

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
