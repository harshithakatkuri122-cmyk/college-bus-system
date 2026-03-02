import React from "react";
import Badge from "../../components/Badge";

export default function RouteTable({
  routes,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewStops,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {routes.map((r) => {
        const occupancyPercent = Math.round((r.bookedSeats / r.capacity) * 100);
        return (
          <div key={r.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{r.routeName}</h3>
                <p className="text-sm text-gray-500">{r.busNumber}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {r.stops.length} Stops • {r.stops[0]?.pickupTime || "N/A"} - {r.stops[r.stops.length - 1]?.pickupTime || "N/A"}
                </div>
              </div>
              <Badge text={r.status} type={r.status.toLowerCase()} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Occupancy</span>
                <span className="font-semibold text-gray-800">{occupancyPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {r.bookedSeats} / {r.capacity} seats booked
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => onViewStops(r.stops)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                Stops
              </button>
              <button
                onClick={() => onEdit(r)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(r.id)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  r.status === "Open"
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {r.status === "Open" ? "Close" : "Open"}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
