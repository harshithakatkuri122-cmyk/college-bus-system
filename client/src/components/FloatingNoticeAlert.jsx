import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getNoticeRoute(user, studentYear) {
  if (!user) return "/login";

  if (user.role === "student") {
    if (Number(studentYear) === 1) {
      return "/student/junior/timetable";
    }
    return "/student/senior";
  }

  if (user.role === "faculty") return "/faculty";
  if (user.role === "transport-admin") return "/admin";
  if (user.role === "bus-incharge") return "/incharge";

  return "/";
}

export default function FloatingNoticeAlert() {
  const navigate = useNavigate();
  const { user, student } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notices, setNotices] = useState([]);

  const userId = user?.id || user?.user_id;

  useEffect(() => {
    let isMounted = true;

    async function loadNotices() {
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        if (isMounted) {
          setNotices([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        let res = await fetch(`/api/student/notices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          res = await fetch(`/api/notices/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (res.status === 404) {
          res = await fetch(`/api/notice/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load notices");
        }

        if (isMounted) {
          setNotices(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load notices");
          setNotices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNotices();

    const intervalId = setInterval(loadNotices, 45000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId]);

  const unreadNotices = useMemo(
    () => notices.filter((notice) => !Boolean(notice.is_read)),
    [notices]
  );

  const unreadCount = unreadNotices.length;
  const latestNotice = unreadNotices[0] || notices[0] || null;
  const hasAlert = unreadCount > 0;

  const badgeLabel = hasAlert
    ? `${unreadCount} New Notice${unreadCount > 1 ? "s" : ""}`
    : "No new notices";

  const containerStateClasses = hasAlert
    ? "bg-red-600 text-white border-red-300 notice-alert-glow"
    : "bg-gray-700 text-gray-100 border-gray-500";

  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  function handleGoToNotices() {
    const route = getNoticeRoute(user, student?.year);
    navigate(route);
  }

  return (
    <div className="fixed left-4 top-2 sm:left-6 sm:top-3 z-[1300]">
      <button
        type="button"
        onClick={handleToggle}
        className={`group flex items-center gap-3 rounded-full border px-4 py-3 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${containerStateClasses}`}
        aria-expanded={expanded}
        aria-label={hasAlert ? "Open new notices alert" : "Open notices panel"}
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/20">
          <i className="fas fa-bell text-base" aria-hidden="true"></i>
          {hasAlert && (
            <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              {unreadCount}
            </span>
          )}
        </span>

        <span className="hidden sm:block text-left leading-tight">
          <span className="block text-xs opacity-90">Notice Center</span>
          <span className="block text-sm font-semibold">
            {hasAlert ? "You have a new notice!" : "No active alerts"}
          </span>
        </span>
      </button>

      {expanded && (
        <div
          className={`mt-3 w-[min(92vw,24rem)] rounded-2xl border p-4 shadow-2xl backdrop-blur-sm ${
            hasAlert
              ? "border-red-300 bg-red-50/95"
              : "border-gray-200 bg-white/95"
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Live Notice Status</p>
              <h3 className={`text-base font-bold ${hasAlert ? "text-red-700" : "text-gray-800"}`}>
                {hasAlert ? "Red Alert" : "Idle"}
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                hasAlert ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {badgeLabel}
            </span>
          </div>

          {loading && (
            <p className="text-sm text-gray-600">Checking latest notices...</p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && latestNotice && (
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-sm font-semibold text-gray-900">{latestNotice.title || "Notice"}</p>
              <p className="mt-1 line-clamp-3 text-sm text-gray-700">{latestNotice.message}</p>
              <p className="mt-2 text-xs text-gray-500">
                {latestNotice.created_at
                  ? new Date(latestNotice.created_at).toLocaleString()
                  : "Just now"}
              </p>
            </div>
          )}

          {!loading && !error && !latestNotice && (
            <p className="text-sm text-gray-600">
              No notices yet. This alert will turn red when a new notice is sent.
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToNotices}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                hasAlert
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-800 text-white hover:bg-black"
              }`}
            >
              Open Notices
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
