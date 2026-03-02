import React from "react";

const items = [
  { key: "details", label: "Transport Details", icon: "fas fa-info-circle" },
  // Renewal intentionally omitted for juniors
  { key: "changeBus", label: "Change Bus", icon: "fas fa-exchange-alt" },
  { key: "notices", label: "Notices", icon: "fas fa-bell" },
  { key: "pass", label: "Download Bus Pass", icon: "fas fa-download" },
  { key: "complaint", label: "Complaint", icon: "fas fa-exclamation-circle" },
];

export default function JuniorFeatures({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onSelect(it.key)}
          className="text-left p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl text-green-600">
              <i className={it.icon} />
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-800">{it.label}</div>
              <div className="text-sm text-gray-500">Quick access</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
