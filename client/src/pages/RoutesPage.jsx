import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function RoutesPage() {
  const { type = "" } = useParams();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoutes() {
      if (!type) {
        setError("Route type is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/routes/${type}`);
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
  }, [type]);

  return (
    <main className="px-6 md:px-16 py-10 bg-gray-50 min-h-[70vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-green-700 capitalize">{type} Routes</h1>
            <p className="text-gray-600 mt-1">Available routes fetched from live backend data</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading routes...</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
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
