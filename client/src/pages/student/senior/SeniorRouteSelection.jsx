import React from "react";

const dummyRoutes = [
  "KPHB - College",
  "Miyapur - College",
  "LB Nagar - College",
  "Maheshwaram - College",
];

export default function SeniorRouteSelection({ onSelect }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Choose a new route</h2>
      <ul className="space-y-2">
        {dummyRoutes.map((r) => (
          <li key={r}>
            <button
              onClick={() => onSelect(r)}
              className="w-full text-left px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {r}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
