import React from "react";

export default function RouteTable({
  routes,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewStops,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Route</th>
            <th className="px-4 py-2">Bus</th>
            <th className="px-4 py-2">Capacity</th>
            <th className="px-4 py-2">Booked</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{r.routeName}</td>
              <td className="px-4 py-2">{r.busNumber}</td>
              <td className="px-4 py-2">{r.capacity}</td>
              <td className="px-4 py-2">{r.bookedSeats}</td>
              <td className="px-4 py-2">{r.status}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onEdit(r)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
                <button
                  onClick={() => onViewStops(r.stops)}
                  className="text-gray-600 hover:underline"
                >
                  Stops
                </button>
                <button
                  onClick={() => onToggleStatus(r.id)}
                  className="text-green-600 hover:underline"
                >
                  {r.status === "Open" ? "Close" : "Open"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
