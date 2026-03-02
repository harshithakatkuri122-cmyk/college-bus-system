import React, { useState } from "react";

export default function TransactionTable({ transactions }) {
  const [routeFilter, setRouteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = transactions.filter((t) => {
    if (routeFilter && t.route !== routeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (dateFilter && t.date !== dateFilter) return false;
    return true;
  });

  const routes = Array.from(new Set(transactions.map((t) => t.route)));
  const statuses = Array.from(new Set(transactions.map((t) => t.status)));

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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded p-2"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.studentName}</td>
                <td className="px-4 py-2">{t.route}</td>
                <td className="px-4 py-2">${t.amount}</td>
                <td className="px-4 py-2">{t.date}</td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.txnId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
