import React from "react";

export default function SeniorTransportDetails({ student }) {
  if (!student) return null;

  const {
    name,
    rollNo,
    route,
    busNo,
    seatNo,
  } = student;

  // Mock driver contact
  const driverContact = "9876543210";

  return (
    <div className="space-y-8">
      {/* Information Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md p-8 border-t-4 border-green-600">
        <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <i className="fas fa-bus text-green-600"></i>
          Your Current Bus Assignment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</p>
              <p className="text-2xl font-bold text-gray-800">{name}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Roll Number</p>
              <p className="text-lg font-mono text-gray-800">{rollNo}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Bus Number</p>
              <p className="text-lg font-bold text-green-700">{busNo}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Route</p>
              <p className="text-lg font-semibold text-gray-800">{route}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Seat Number</p>
              <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-lg">
                {seatNo}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Contact</p>
              <p className="text-lg font-mono text-gray-800">{driverContact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex gap-4">
          <i className="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">About Your Assignment</h3>
            <p className="text-sm text-blue-800">
              Your bus route and seat have been assigned from the previous academic year. These details will remain active until you renew or change your route for the next academic year. Your payment status must be "Active" to avail the bus service.
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only Badge */}
      <div className="text-center text-sm text-gray-500">
        <i className="fas fa-lock text-gray-400 mr-2"></i>
        This is your current bus assignment (Read-only)
      </div>
    </div>
  );
}
