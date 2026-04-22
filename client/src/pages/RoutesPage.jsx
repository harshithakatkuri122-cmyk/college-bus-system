import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function RoutesPage() {
  const { type = "" } = useParams();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedRouteNo, setExpandedRouteNo] = useState(null);
  const [timingsByRoute, setTimingsByRoute] = useState({});
  const [timingsLoading, setTimingsLoading] = useState({});
  const [timingsError, setTimingsError] = useState({});
  const viewingAllRoutes = !type;

  function normalizeType(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized.startsWith("jun")) return "junior";
    if (normalized.startsWith("sen")) return "senior";
    return normalized;
  }

  function formatTime(value) {
    const raw = String(value || "").trim();
    if (!raw) return "-";

    const [h = "0", m = "0"] = raw.split(":");
    const hours = Number(h);
    const minutes = Number(m);

    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      return raw;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  async function handleRouteClick(routeNo) {
    if (expandedRouteNo === routeNo) {
      setExpandedRouteNo(null);
      return;
    }

    setExpandedRouteNo(routeNo);

    if (timingsByRoute[routeNo]) {
      return;
    }

    try {
      setTimingsLoading((prev) => ({ ...prev, [routeNo]: true }));
      setTimingsError((prev) => ({ ...prev, [routeNo]: "" }));

      const res = await fetch(`/api/routes/${routeNo}/timings`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to load route timings");
      }

      const stops = Array.isArray(data?.stops) ? data.stops : [];
      setTimingsByRoute((prev) => ({ ...prev, [routeNo]: stops }));
    } catch (loadError) {
      setTimingsError((prev) => ({ ...prev, [routeNo]: loadError.message || "Unable to load route timings" }));
    } finally {
      setTimingsLoading((prev) => ({ ...prev, [routeNo]: false }));
    }
  }

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        setError("");

        const endpoint = viewingAllRoutes ? "/api/routes" : `/api/routes/${type}`;
        const res = await fetch(endpoint);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load routes");
        }

        setRoutes(Array.isArray(data) ? data : []);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || "Unable to load routes");
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, [type, viewingAllRoutes]);

  const filteredRoutes = routes.filter((route) => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();

    return (
      String(route.route_name || "").toLowerCase().includes(query) ||
      String(route.route_no || "").toLowerCase().includes(query) ||
      String(route.student_type || "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="px-6 md:px-16 py-10 bg-gray-50 min-h-[70vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-green-700 capitalize">
              {viewingAllRoutes ? "All Routes" : `${type} Routes`}
            </h1>
            <p className="text-gray-600 mt-1">
              {viewingAllRoutes
                ? "Browse all route timings for junior and senior transport"
                : "Available routes fetched from live backend data"}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>

        {viewingAllRoutes && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route name, route number, or student type"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        )}

        {loading && <p className="text-gray-600">Loading routes...</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && viewingAllRoutes && (
          <div className="space-y-4">
            {filteredRoutes.map((route) => {
              const isExpanded = expandedRouteNo === route.route_no;
              const routeType = normalizeType(route.student_type);
              const typeClass = routeType === "junior"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : routeType === "senior"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200";

              return (
                <button
                  type="button"
                  key={route.route_no}
                  onClick={() => handleRouteClick(route.route_no)}
                  className={`w-full text-left rounded-xl border p-5 shadow-sm transition ${
                    isExpanded
                      ? "border-green-500 bg-green-50/40 ring-2 ring-green-100"
                      : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Route No: {route.route_no}</p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">{route.route_name}</h3>
                      <span className={`mt-2 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${typeClass}`}>
                        {String(route.student_type || "N/A").toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-700">{isExpanded ? "Hide Stops" : "View Stops"}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                      {timingsLoading[route.route_no] && <p className="text-sm text-gray-600">Loading stops...</p>}

                      {!timingsLoading[route.route_no] && timingsError[route.route_no] && (
                        <p className="text-sm text-red-600">{timingsError[route.route_no]}</p>
                      )}

                      {!timingsLoading[route.route_no] && !timingsError[route.route_no] && (
                        <ol className="space-y-1 text-sm text-gray-700 list-decimal pl-5">
                          {(timingsByRoute[route.route_no] || []).map((stop) => (
                            <li key={`${route.route_no}-${stop.stop_order}`}>
                              {stop.stop_name} - {formatTime(stop.arrival_time)}
                            </li>
                          ))}
                          {(!timingsByRoute[route.route_no] || timingsByRoute[route.route_no].length === 0) && (
                            <li className="text-gray-500">No stops found for this route.</li>
                          )}
                        </ol>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {filteredRoutes.length === 0 && (
              <p className="text-sm text-gray-500">No routes found</p>
            )}
          </div>
        )}

        {!loading && !error && !viewingAllRoutes && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route.route_no} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-600">
                <h3 className="text-lg font-bold text-gray-800">{route.route_name}</h3>
                <p className="text-sm text-gray-600 mt-2">Via: {route.via || "-"}</p>
                <p className="text-xs text-gray-500 mt-3">Route No: {route.route_no}</p>
              </div>
            ))}
            {routes.length === 0 && <p className="text-gray-500">No routes found.</p>}
          </div>
        )}
      </div>
    </main>
  );
}
