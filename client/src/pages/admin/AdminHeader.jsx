import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { logout } = useAuth();

  return (
    <div className="w-full">
      <div className="h-1 bg-gradient-to-r from-green-600 to-green-500 w-full border-b-4 border-brown-600"></div>
      <div className="h-2 bg-green-900 w-full border-b-4 border-brown-600"></div>
      <header className="w-full bg-white shadow-sm px-20 py-6 flex justify-between items-center pl-64">
        <div className="flex flex-col justify-center ml-4">
          <h1 className="text-4xl font-bold text-gray-800 leading-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Control panel</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-md text-base">
            Help
          </button>
          <button onClick={logout} className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition shadow-md font-semibold text-base">
            Logout
          </button>
        </div>
      </header>
      <div className="h-1 bg-green-600 w-full"></div>
    </div>
  );
}
