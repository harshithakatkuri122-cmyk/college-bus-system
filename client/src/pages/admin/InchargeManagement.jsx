import React, { useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";

export default function InchargeManagement({ incharges, routes, refreshIncharges }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedIncharge, setSelectedIncharge] = useState(null);

  const inchargeOptions = (Array.isArray(incharges) ? incharges : []).map((i) => ({
    ...i,
    id: i.id ?? i.user_id,
    label: i.name,
    value: i.user_id,
  }));

  const assign = async () => {
    if (selectedIncharge && selectedRoute) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/assign-incharge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            route_id: selectedRoute.routeNo,
            user_id: selectedIncharge.user_id ?? selectedIncharge.value,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to assign incharge");
        }

        setSelectedRoute("");
        setSelectedIncharge(null);
        if (refreshIncharges) {
          await refreshIncharges();
        }
      } catch (error) {
        console.error(error);
        alert(error.message || "Unable to assign incharge");
      }
    }
  };

  const remove = async (incharge) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/assign-incharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          route_id: null,
          user_id: incharge.user_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to unassign route");
      }

      if (refreshIncharges) {
        await refreshIncharges();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to remove assignment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Assign Incharge</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Select Incharge</label>
            <SearchableSelect
              items={inchargeOptions}
              placeholder="Search incharge..."
              value={selectedIncharge}
              onSelect={(v) => setSelectedIncharge(v)}
              renderItem={(it) => `${it.label || it.name} (${it.designation || "-"})`}
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
              <tr key={i.user_id ?? i.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-4">{i.name}</td>
                <td className="px-6 py-4">{i.route_name ? <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{i.route_name}</span> : <span className="text-sm text-gray-400">Unassigned</span>}</td>
                <td className="px-6 py-4">{i.designation || "-"}</td>
                <td className="px-6 py-4">
                  {i.route_name && (
                    <button
                      onClick={() => remove(i)}
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
