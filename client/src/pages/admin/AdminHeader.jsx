import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Welcome header bar */}
      <div className="mt-12 w-full pl-64 bg-white shadow-sm px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👋</span>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Welcome back, Admin!</h2>
            <p className="text-sm text-gray-500 mt-1">Ready to manage your transport system</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="border-2 border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition font-medium"
        >
          Logout
        </button>
      </div>
    </>
  );
}
