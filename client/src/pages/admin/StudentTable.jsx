import React, { useState } from "react";

export default function StudentTable({ students }) {
  const [routeFilter, setRouteFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const filtered = students.filter((s) => {
    if (routeFilter && s.route !== routeFilter) return false;
    if (paymentFilter && s.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const routes = Array.from(new Set(students.map((s) => s.route)));

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All routes</option>
          {routes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All payment statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Roll No</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Bus</th>
              <th className="px-4 py-2">Payment Status</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.rollNo || s.id} className="border-t">
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.rollNo}</td>
                <td className="px-4 py-2">{s.route}</td>
                <td className="px-4 py-2">{s.busNo}</td>
                <td className="px-4 py-2">{s.paymentStatus}</td>
                <td className="px-4 py-2">{s.contact}</td>
                <td className="px-4 py-2 space-x-1">
                  <button className="text-blue-600 hover:underline">View</button>
                  <button className="text-red-600 hover:underline">Disable</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
