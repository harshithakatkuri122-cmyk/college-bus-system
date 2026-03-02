import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopBar() {
  const { logout } = useAuth();

  return (
    <>
      {/* Top bar with logout aligned right */}
      <div className="mt-12 w-full pl-64 bg-white shadow-sm px-8 py-4 flex justify-end">
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
