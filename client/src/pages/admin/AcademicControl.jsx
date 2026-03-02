import React from "react";

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
      <div className="bg-white p-6 rounded shadow flex items-center space-x-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Academic Year
          </label>
          <input
            className="mt-1 border rounded p-2"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
        <div>
          <span className="font-medium">Global Booking</span>
          <button
            onClick={() => setGlobalBookingOpen((o) => !o)}
            className={`ml-2 px-4 py-2 rounded ${
              globalBookingOpen ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {globalBookingOpen ? "Open" : "Closed"}
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Route Booking Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((r) => (
            <div
              key={r.id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <span>{r.routeName}</span>
              <button
                onClick={() => toggleRouteBooking(r.id)}
                className={`px-3 py-1 rounded text-white ${
                  r.status === "Open" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {r.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
