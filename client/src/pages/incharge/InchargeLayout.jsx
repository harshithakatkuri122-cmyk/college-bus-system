import React from "react";
import InchargeSidebar from "./InchargeSidebar";
import InchargeNavbar from "./InchargeNavbar";

export default function InchargeLayout({ incharge, children, active, onSelect }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP GREEN STRIPE */}
      <div className="fixed top-0 left-0 w-full h-12 bg-green-700 border-b-4 border-amber-900 z-40"></div>

      {/* Sidebar */}
      <InchargeSidebar active={active} onSelect={onSelect} />

      {/* Main Area */}
      <div className="ml-64 pt-20 px-10 pb-10">
        {/* Navbar */}
        <div className="mb-6">
          <InchargeNavbar incharge={incharge} />
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
