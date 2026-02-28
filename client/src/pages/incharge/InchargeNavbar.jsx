import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function InchargeNavbar({ incharge }) {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-white shadow-sm rounded-lg px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">Welcome,</h2>
        <div className="text-gray-700 font-medium">{incharge?.name || user?.id}</div>
      </div>
      <div>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
