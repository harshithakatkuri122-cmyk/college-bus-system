import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopBar() {
  const { logout } = useAuth();

  return (
    <div className="w-full">
      <div className="h-2 bg-green-900 w-full border-b-4 border-brown-600"></div>
      <div className="h-16 bg-gradient-to-r from-green-600 to-green-500 w-full flex items-center justify-end px-8 border-b-4 border-brown-600">
        <button 
          onClick={logout} 
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-md font-semibold text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
