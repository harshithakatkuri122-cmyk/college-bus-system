import React from "react";

const dummyRoutes = [
  { id: 1, name: "KPHB - College", buses: 5 },
  { id: 2, name: "Miyapur - College", buses: 3 },
  { id: 3, name: "LB Nagar - College", buses: 4 },
  { id: 4, name: "Maheshwaram - College", buses: 2 },
  { id: 5, name: "Secunderabad - College", buses: 6 },
];

export default function RouteSelection({ onSelect, onCancel }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-map-marker-alt text-green-600 mr-3"></i>
        Select a Route
      </h2>

      <p className="text-gray-600 mb-6">
        Choose from available bus routes for the next academic year
      </p>

      <div className="space-y-3">
        {dummyRoutes.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelect(route.name)}
            className="w-full text-left px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700">
                  {route.name}
                </p>
                <p className="text-sm text-gray-600">
                  {route.buses} buses available
                </p>
              </div>
              <i className="fas fa-chevron-right text-gray-400 group-hover:text-green-600"></i>
            </div>
          </button>
        ))}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
