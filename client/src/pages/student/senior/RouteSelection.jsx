import React, { useEffect, useState } from "react";

export default function RouteSelection({ student, onSelect, onCancel }) {
  const [routes, setRoutes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentType = Number(student?.year) === 1 ? "junior" : "senior";

  useEffect(() => {
    async function fetchRoutesAndAvailability() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const routesRes = await fetch(`/api/student/routes/${studentType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const routesData = await routesRes.json();

        if (!routesRes.ok) {
          throw new Error(routesData.message || "Failed to load routes");
        }

        const routeList = Array.isArray(routesData) ? routesData : [];
        setRoutes(routeList);

        const availabilityEntries = await Promise.all(
          routeList.map(async (route) => {
            try {
              const seatsRes = await fetch(`/api/student/seats/${route.route_no}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const seatsData = await seatsRes.json();

              const seats = Array.isArray(seatsData?.seats) ? seatsData.seats : [];
              const restricted = Array.isArray(seatsData?.restrictedSeats)
                ? seatsData.restrictedSeats.map((seatNo) => Number(seatNo))
                : [];
              const restrictedSet = new Set(restricted);

              if (!seatsRes.ok || !Array.isArray(seats)) {
                return [route.route_no, 0];
              }

              const available = seats.filter((seat) => {
                const seatNo = Number(seat.seat_no);
                const isBooked = Number(seat.is_booked) === 1;
                return !isBooked && !restrictedSet.has(seatNo);
              }).length;
              return [route.route_no, available];
            } catch {
              return [route.route_no, 0];
            }
          })
        );

        setAvailability(Object.fromEntries(availabilityEntries));
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.message || "Unable to load routes");
      } finally {
        setLoading(false);
      }
    }

    fetchRoutesAndAvailability();
  }, [studentType]);

  function formatRouteLabel(route) {
    const via = route?.via ? ` (${route.via})` : "";
    return `${route.route_no} - ${route.route_name}${via}`;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-map-marker-alt text-green-600 mr-3"></i>
        Select a Route
      </h2>

      <p className="text-gray-600 mb-6">
        Choose from available bus routes for the next academic year
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading && <p className="text-gray-600 mb-4">Loading routes...</p>}

      <div className="space-y-3">
        {!loading && routes.map((route) => (
          <button
            key={route.route_no}
            onClick={() => onSelect(route)}
            className="w-full text-left px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700">
                  {formatRouteLabel(route)}
                </p>
                <p className="text-sm text-gray-600">
                  {availability[route.route_no] ?? 0} seats available
                </p>
              </div>
              <i className="fas fa-chevron-right text-gray-400 group-hover:text-green-600"></i>
            </div>
          </button>
        ))}

        {!loading && routes.length === 0 && !error && (
          <p className="text-sm text-gray-500">No routes available right now.</p>
        )}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
