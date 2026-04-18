import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

function parseAssistantSections(content) {
  const text = String(content || "").trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    sections.push({
      title: current.title,
      lines: current.lines.filter(Boolean),
    });
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (current) current.lines.push("");
      continue;
    }

    const headingMatch = line.match(/^(Route Details|ETA|Alternative Routes|Timings|Notes|Bus Details|Current Route)\s*[:\-]?\s*(.*)$/i);
    if (headingMatch) {
      flush();
      current = {
        title: headingMatch[1],
        lines: headingMatch[2] ? [headingMatch[2]] : [],
      };
      continue;
    }

    if (!current) {
      current = {
        title: "Answer",
        lines: [],
      };
    }

    current.lines.push(line);
  }

  flush();

  if (sections.length <= 1 && sections[0]?.title === "Answer") {
    return [{ title: "Answer", lines: [text] }];
  }

  return sections;
}

function buildSummaryBadges(sections) {
  const badges = [];
  const allText = sections
    .flatMap((section) => section.lines)
    .join(" ")
    .toLowerCase();

  const routeSection = sections.find((section) => /route details|current route|bus details/i.test(section.title));
  const etaSection = sections.find((section) => /^eta$/i.test(section.title));
  const altSection = sections.find((section) => /alternative routes/i.test(section.title));
  const timingsSection = sections.find((section) => /^timings$/i.test(section.title));

  if (routeSection) {
    badges.push("Route found");
  }

  if (etaSection) {
    badges.push("ETA available");
  }

  if (altSection) {
    const altCount = altSection.lines.filter((line) => line.trim().startsWith("•")).length;
    badges.push(altCount > 0 ? `${altCount} alternatives` : "No alternatives");
  }

  if (timingsSection) {
    badges.push("Timings available");
  }

  if (!badges.length) {
    if (/not found|not assigned|unavailable|not available/.test(allText)) {
      badges.push("Data missing");
    } else {
      badges.push("Answer ready");
    }
  }

  return badges;
}

export default function AssistantChat({ mode = "student" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistantMeta, setAssistantMeta] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        mode === "public"
          ? "Hi, I am the CBIT Bus Assistant. Ask how to book a bus, renew a pass, or check routes."
          : "Hi, I am your CBIT Bus Assistant. Ask about your route, ETA, bus details, or alternative routes.",
    },
  ]);

  const exampleQuestions =
    mode === "public"
      ? [
          "How do I book a bus pass?",
          "How do I renew my bus pass?",
          "What are the steps after selecting a route?",
          "How do I contact the transport office?",
        ]
      : [
          "What is my current bus route and seat?",
          "Are there any alternative routes from my start point?",
          "What time will my bus reach CBIT?",
          "Does my route go via Amberpet?",
        ];

  if (mode !== "public" && user && user.role && user.role !== "student") {
    return null;
  }

  const canSend = useMemo(() => {
    if (mode === "public") {
      return !loading && input.trim().length > 0;
    }

    return !loading && input.trim().length > 0 && Boolean(user && user.id);
  }, [loading, input, user, mode]);

  const statusSource = assistantMeta && assistantMeta.source ? assistantMeta.source : "idle";
  const isLiveLlm = statusSource === "llm";
  const isFallbackState = statusSource === "fallback" || statusSource === "rule" || statusSource === "cache-legacy";
  const providerLabel = assistantMeta && assistantMeta.provider
    ? String(assistantMeta.provider).toUpperCase()
    : "AI";

  const statusLabel = loading
    ? "THINKING"
    : isLiveLlm
      ? `${providerLabel} LIVE`
      : isFallbackState
        ? "FALLBACK"
        : "READY";

  const statusClassName = loading
    ? "bg-sky-100 text-sky-800 border-sky-200"
    : isLiveLlm
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : isFallbackState
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-white/15 text-white border-white/30";

  async function sendMessage() {
    const question = input.trim();
    if (!question) return;

    const isPublicMode = mode === "public";
    const token = isPublicMode ? null : localStorage.getItem("token");
    const endpoint = isPublicMode ? "/api/assistant/public" : "/api/assistant";

    if (!isPublicMode && (!user || !user.id)) return;

    if (!isPublicMode && !token) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Please login again to use the assistant." },
      ]);
      return;
    }

    const history = [...messages, { role: "user", content: question }]
      .filter((message, index) => {
        // Skip the initial greeting because it does not help follow-up reasoning.
        if (index === 0 && message.role === "assistant") return false;
        return message.role === "user" || message.role === "assistant";
      })
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: String(message.content || ""),
      }));

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question,
          history,
          ...(isPublicMode ? {} : { studentId: user.id }),
        }),
      });

      let data;
      const contentType = String(res.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = {
          success: false,
          message: text || "Unexpected server response",
        };
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to get assistant response");
      }

      setAssistantMeta(data.meta || null);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "No answer available." },
      ]);
    } catch (error) {
      console.error(error);
      setAssistantMeta({ source: "fallback" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Unable to process your request right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        sendMessage();
      }
    }
  }

  function renderAssistantMessage(content) {
    const sections = parseAssistantSections(content);
    const badges = buildSummaryBadges(sections);

    if (!sections.length) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200"
            >
              {badge}
            </span>
          ))}
        </div>

        {sections.map((section) => {
          const isSingleValue = section.lines.length === 1 && !section.lines[0]?.includes("\n");
          const isListSection = section.lines.some((line) => line.startsWith("-") || line.startsWith("•"));

          return (
            <div
              key={section.title}
              className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              {section.title !== "Answer" && (
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {section.title}
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              )}

              {isSingleValue && !isListSection ? (
                <div className="text-sm font-medium text-gray-800 whitespace-pre-wrap">
                  {section.lines[0]}
                </div>
              ) : (
                <div className="space-y-2">
                  {section.lines.map((line, index) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    const bullet = trimmed.startsWith("-") || trimmed.startsWith("•");
                    return (
                      <div
                        key={`${section.title}-${index}`}
                        className={`flex gap-2 rounded-lg px-3 py-2 text-sm ${
                          bullet ? "bg-emerald-50/70 text-gray-800" : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-none" />
                        <span className="whitespace-pre-wrap">
                          {bullet ? trimmed.replace(/^[-•]\s*/, "") : trimmed}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-[360px] max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-green-700 text-white flex items-center justify-between">
            <div>
              <h3 className="font-semibold">CBIT Bus Assistant</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-green-100">Smart assistant mode</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusClassName}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white"
              aria-label="Close assistant"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div className="rounded-xl border border-green-100 bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-800 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setInput(question)}
                    className="text-left text-xs px-3 py-2 rounded-full bg-white border border-green-200 text-green-800 hover:bg-green-100 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-green-600 text-white"
                    : "mr-auto bg-transparent border-0 p-0 text-gray-800"
                }`}
              >
                {message.role === "assistant" ? renderAssistantMessage(message.content) : message.content}
              </div>
            ))}

            {loading && (
              <div className="mr-auto bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm">
                <i className="fas fa-spinner fa-spin mr-2" />
                Thinking...
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Ask about route alternatives, ETA, stops..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="ml-auto w-14 h-14 rounded-full bg-green-700 hover:bg-green-800 text-white shadow-xl flex items-center justify-center"
        aria-label="Toggle assistant"
      >
        <i className={`fas ${open ? "fa-comment-slash" : "fa-robot"} text-xl`} />
      </button>
    </div>
  );
}
