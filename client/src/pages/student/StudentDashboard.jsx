import React from "react";

export default function StudentDashboard({
  student,
  children,
  active,
  onSelect,
  Sidebar,
  Navbar,
}) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP GREEN STRIPE */}
      <div className="fixed top-0 left-0 w-full h-12 bg-green-700 border-b-4 border-amber-900 z-40"></div>

      {/* Sidebar (injected) */}
      {Sidebar && <Sidebar active={active} onSelect={onSelect} />}

      {/* Main Area */}
      <div className="ml-64 pt-20 px-10 pb-10">

        {/* Navbar (injected) */}
        <div className="mb-6">{Navbar && <Navbar student={student} />}</div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">{children}</div>

      </div>

    </div>
  );
}
