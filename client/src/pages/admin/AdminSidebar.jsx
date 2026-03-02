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
    <aside className="w-64 bg-gray-800 text-gray-100 fixed h-full shadow-lg">
      <div className="p-6 text-2xl font-bold">Admin Panel</div>
      <nav className="mt-6">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center px-4 py-3 hover:bg-gray-700 transition ${
              active === item.key ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            <i className={`${item.icon} w-5`} />
            <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
