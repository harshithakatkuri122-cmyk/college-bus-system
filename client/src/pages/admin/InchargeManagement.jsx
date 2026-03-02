import React, { useState } from "react";

export default function InchargeManagement({ incharges, routes, setIncharges }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedIncharge, setSelectedIncharge] = useState("");

  const assign = () => {
    if (selectedIncharge && selectedRoute) {
      setIncharges((prev) =>
        prev.map((i) =>
          i.id === Number(selectedIncharge)
            ? { ...i, route: selectedRoute }
            : i
        )
      );
      setSelectedRoute("");
      setSelectedIncharge("");
    }
  };

  const remove = (id) => {
    setIncharges((prev) => prev.map((i) => (i.id === id ? { ...i, route: "" } : i)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Assign Incharge</h3>
        <div className="flex gap-4">
          <select
            className="border rounded p-2"
            value={selectedIncharge}
            onChange={(e) => setSelectedIncharge(e.target.value)}
          >
            <option value="">Select incharge</option>
            {incharges.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="">Select route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.routeName}>
                {r.routeName}
              </option>
            ))}
          </select>
          <button
            onClick={assign}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Assign
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Assigned Route</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incharges.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-2">{i.name}</td>
                <td className="px-4 py-2">{i.route || "-"}</td>
                <td className="px-4 py-2">{i.contact || "-"}</td>
                <td className="px-4 py-2">
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
