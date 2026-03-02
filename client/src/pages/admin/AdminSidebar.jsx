import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ active, onSelect }) {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="mt-12 p-6 border-b border-gray-700 relative">
        <h2 className="text-2xl font-bold text-white flex items-center gap-5">
          <i className="fas fa-chart-line text-blue-400 text-xl flex-shrink-0"></i>
          <span>Admin Panel</span>
        </h2>
        {/* user/profile menu button */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="absolute top-6 right-6 text-gray-300 hover:text-white focus:outline-none"
        >
          <i className="fas fa-user-circle fa-lg" />
        </button>
        {menuOpen && (
          <div className="absolute top-16 right-6 bg-gray-800 rounded shadow-lg w-40">
            <div className="px-4 py-2 text-sm text-gray-200">
              {user?.name || user?.id || "Admin"}
            </div>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-gray-100 hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        )}
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
