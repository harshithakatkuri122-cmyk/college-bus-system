import React from "react";

export default function AdminSidebar({ active, onSelect }) {
  const menu = [
    { key: "overview", label: "Dashboard Overview", icon: "fas fa-tachometer-alt" },
    { key: "routes", label: "Manage Routes", icon: "fas fa-route" },
    { key: "students", label: "Student Management", icon: "fas fa-users" },
    { key: "incharges", label: "Bus Incharge Management", icon: "fas fa-user-tag" },
    { key: "transactions", label: "Transactions", icon: "fas fa-receipt" },
    { key: "notices", label: "Notices", icon: "fas fa-bell" },
    { key: "academic", label: "Academic Year & Booking", icon: "fas fa-calendar-alt" },
    { key: "reports", label: "Reports / Analytics", icon: "fas fa-chart-bar" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 fixed h-full shadow-xl top-0 left-0">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-cog"></i>
          Admin Panel
        </h2>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition duration-200 ${
              active === item.key
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <i className={`${item.icon} w-5`} />
            <span className="ml-3 text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
