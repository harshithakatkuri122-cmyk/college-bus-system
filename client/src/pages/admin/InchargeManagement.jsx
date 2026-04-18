import React, { useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";

export default function InchargeManagement({ incharges, routes, refreshIncharges }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);

  async function postWithFallback(urls, options) {
    let lastResponse = null;

    for (const url of urls) {
      const response = await fetch(url, options);
      lastResponse = response;

      if (response.status !== 404) {
        return response;
      }
    }

    return lastResponse;
  }

  const inchargeOptions = (Array.isArray(incharges) ? incharges : []).map((i) => ({
    ...i,
    id: i.id ?? i.user_id,
    label: i.name,
    value: i.user_id,
  }));

  const assign = async () => {
    if (!selectedIncharge || !selectedRoute) {
      setStatus({ type: "error", message: "Please select both incharge and route" });
      return;
    }

    try {
      setSaving(true);
      setStatus({ type: "", message: "" });
      const routeId = Number(
        selectedRoute.routeNo ??
          selectedRoute.route_no ??
          selectedRoute.id ??
          selectedRoute.value
      );
      const userId = Number(selectedIncharge.user_id ?? selectedIncharge.id ?? selectedIncharge.value);

      if (!Number.isInteger(routeId) || !Number.isInteger(userId)) {
        throw new Error("Invalid incharge or route selection");
      }

      const token = localStorage.getItem("token");
      const res = await postWithFallback(["/api/assign-incharge", "/api/admin/assign-incharge"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          route_id: routeId,
          user_id: userId,
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
      setStatus({ type: "success", message: "Incharge assigned successfully." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.message || "Unable to assign incharge" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (incharge) => {
    try {
      setSaving(true);
      setStatus({ type: "", message: "" });
      const token = localStorage.getItem("token");
      const userId = Number(incharge.user_id ?? incharge.id ?? incharge.value);
      if (!Number.isInteger(userId)) {
        throw new Error("Invalid incharge selection");
      }

      const res = await postWithFallback(["/api/assign-incharge", "/api/admin/assign-incharge"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          route_id: null,
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to unassign route");
      }

      if (refreshIncharges) {
        await refreshIncharges();
      }
      setStatus({ type: "success", message: "Route unassigned successfully." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.message || "Unable to remove assignment" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Assign Incharge</h3>
        {status.message && (
          <div
            className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
              status.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status.message}
          </div>
        )}
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
            <button
              onClick={assign}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-xl shadow disabled:bg-gray-300 disabled:text-gray-500"
            >
              {saving ? "Saving..." : "Assign"}
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
                      disabled={saving}
                      className="text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline"
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
