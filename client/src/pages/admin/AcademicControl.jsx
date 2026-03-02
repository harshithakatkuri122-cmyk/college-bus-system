import React from "react";
import Badge from "../../components/Badge";

export default function AcademicControl({
  academicYear,
  setAcademicYear,
  globalBookingOpen,
  setGlobalBookingOpen,
  routes,
  toggleRouteBooking,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Global Booking Status</label>
            <button
              onClick={() => setGlobalBookingOpen((o) => !o)}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium transition ${
                globalBookingOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {globalBookingOpen ? "✓ Bookings Open" : "✗ Bookings Closed"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Route Booking Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{r.routeName}</h4>
                  <p className="text-xs text-gray-500 mt-1">{r.busNumber}</p>
                </div>
                <Badge text={r.status} type={r.status.toLowerCase()} />
              </div>
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">
                  {r.bookedSeats} / {r.capacity} seats
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(r.bookedSeats / r.capacity) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => toggleRouteBooking(r.id)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${
                  r.status === "Open"
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {r.status === "Open" ? "Close Booking" : "Open Booking"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
