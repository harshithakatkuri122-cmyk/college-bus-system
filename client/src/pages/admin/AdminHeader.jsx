import React from "react";

export default function AdminHeader() {
  return (
    <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Logout
      </button>
    </header>
  );
}
