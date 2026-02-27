import React from "react";
import SeniorSidebar from "./SeniorSidebar";
import SeniorNavbar from "./SeniorNavbar";

export default function SeniorLayout({ student, children, active, onSelect }) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP GREEN STRIPE */}
      <div className="fixed top-0 left-0 w-full h-16 bg-green-700 border-b-4 border-amber-900 z-40"></div>

      {/* Sidebar */}
      <SeniorSidebar active={active} onSelect={onSelect} />

      {/* Main Area */}
      <div className="ml-64 pt-20 px-10 pb-10">

        {/* Navbar */}
        <div className="mb-6">
          <SeniorNavbar student={student} />
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {children}
        </div>

      </div>

    </div>
  );
}