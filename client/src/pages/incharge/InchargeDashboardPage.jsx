import React from "react";

export default function InchargeDashboardPage({ incharge }) {
  const notices = Array.isArray(incharge?.notices) ? incharge.notices : [];
  const students = Array.isArray(incharge?.students) ? incharge.students : [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bus Incharge Overview & Quick Actions</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-700">{students.length}</p>
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

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-1">Total Notices</p>
              <p className="text-3xl font-bold text-green-700">{notices.length}</p>
            </div>
            <i className="fas fa-bell text-green-300 text-4xl"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
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
                    <p className="text-xs text-gray-500 whitespace-nowrap ml-2">{new Date(notice.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-sm text-gray-500">No notices available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
