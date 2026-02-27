import React from "react";

const menuItems = [
  { key: "details", label: "Transport Details", icon: "fas fa-info-circle" },
  { key: "renew", label: "Renew Bus", icon: "fas fa-retweet" },
  { key: "pass", label: "Download Bus Pass", icon: "fas fa-download" },
  { key: "complaint", label: "Complaint", icon: "fas fa-exclamation-circle" },
];

export default function SeniorSidebar({ active, onSelect }) {
  return (
    <aside
      className="fixed left-0 top-16 w-64 bg-slate-900 text-white shadow-xl flex flex-col"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-700">
        <h3 className="text-lg font-bold tracking-wide">
          Student Menu
        </h3>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
              ${
                active === item.key
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
          >
            <i className={`${item.icon} w-5`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
        CBIT Transport
      </div>
    </aside>
  );
}