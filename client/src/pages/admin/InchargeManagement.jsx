import React, { useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";

export default function InchargeManagement({ incharges, routes, setIncharges }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedIncharge, setSelectedIncharge] = useState(null);

  const assign = () => {
    if (selectedIncharge && selectedRoute) {
      setIncharges((prev) =>
        prev.map((i) =>
          i.id === selectedIncharge.id
            ? { ...i, route: selectedRoute.routeName }
            : i
        )
      );
      setSelectedRoute("");
      setSelectedIncharge(null);
    }
  };

  const remove = (id) => {
    setIncharges((prev) => prev.map((i) => (i.id === id ? { ...i, route: "" } : i)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Assign Incharge</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Select Incharge</label>
            <SearchableSelect
              items={incharges}
              placeholder="Search incharge..."
              value={selectedIncharge}
              onSelect={(v) => setSelectedIncharge(v)}
              renderItem={(it) => `${it.name} (${it.contact || "-"})`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Select Route</label>
            <SearchableSelect
              items={routes}
              placeholder="Search route..."
              value={selectedRoute}
              onSelect={(v) => setSelectedRoute(v)}
              renderItem={(it) => `${it.routeName} — ${it.busNumber}`}
            />
          </div>
          <div className="flex items-end">
            <button onClick={assign} className="bg-green-600 text-white px-4 py-2 rounded-xl shadow">
              Assign
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm text-gray-500">Assigned Route</th>
              <th className="px-6 py-3 text-left text-sm text-gray-500">Contact</th>
              <th className="px-6 py-3 text-left text-sm text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incharges.map((i) => (
              <tr key={i.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-4">{i.name}</td>
                <td className="px-6 py-4">{i.route ? <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{i.route}</span> : <span className="text-sm text-gray-400">Unassigned</span>}</td>
                <td className="px-6 py-4">{i.contact || "-"}</td>
                <td className="px-6 py-4">
                  {i.route && (
                    <button
                      onClick={() => remove(i.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
