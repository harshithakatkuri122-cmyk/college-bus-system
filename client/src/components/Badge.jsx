import React from "react";

const statusColors = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  open: "bg-blue-100 text-blue-700",
  closed: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
};

export default function Badge({ text, type = "info" }) {
  const color = statusColors[type] || statusColors.inactive;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {text}
    </span>
  );
}
