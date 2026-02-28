import React, { useState } from "react";

export default function InchargeDashboardPage({ incharge, onAttendanceClick }) {
  const [notices] = useState([
    { id: 1, date: "2026-02-28", title: "Route Change", message: "Bus 7 route changed due to construction" },
    { id: 2, date: "2026-02-27", title: "Schedule Update", message: "New pickup time: 7:00 AM" },
    { id: 3, date: "2026-02-26", title: "Maintenance Notice", message: "Bus will be under maintenance on March 1st" },
  ]);

  // Calculate today's attendance
  const todayAttendance = incharge?.students?.filter(s => s.presentToday).length || 0;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bus Incharge Overview & Quick Actions</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-700">{incharge?.students?.length || 0}</p>
            </div>
            <i className="fas fa-users text-blue-300 text-4xl"></i>
          </div>
        </div>

        {/* Bus Route */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Bus Route</p>
              <p className="text-xl font-bold text-purple-700">{incharge?.route || "N/A"}</p>
            </div>
            <i className="fas fa-map-marker-alt text-purple-300 text-4xl"></i>
          </div>
        </div>

        {/* Driver Name */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Driver Name</p>
              <p className="text-lg font-bold text-orange-700">{incharge?.driver || "N/A"}</p>
            </div>
            <i className="fas fa-user-tie text-orange-300 text-4xl"></i>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Present Today</p>
              <p className="text-3xl font-bold text-green-700">{todayAttendance}</p>
            </div>
            <i className="fas fa-check-circle text-green-300 text-4xl"></i>
          </div>
        </div>

        {/* Bus Status */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Bus Status</p>
              <p className="text-lg font-bold text-red-700">{incharge?.status || "On Time"}</p>
            </div>
            <i className="fas fa-bus text-red-300 text-4xl"></i>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="fas fa-bell text-green-600"></i>
              Recent Notices
            </h2>
            <p className="text-sm text-gray-500 mb-4">Latest updates for your bus</p>
            
            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{notice.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notice.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap ml-2">{notice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-emerald-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-emerald-600"></i>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={onAttendanceClick}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition shadow-md"
              >
                <i className="fas fa-clipboard-check mr-2"></i>
                Mark Attendance
              </button>
              
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition shadow-md"
              >
                <i className="fas fa-users mr-2"></i>
                View Students
              </button>
              
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-md"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send Notice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
