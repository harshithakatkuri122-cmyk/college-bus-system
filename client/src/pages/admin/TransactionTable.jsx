import React, { useState } from "react";
import Badge from "../../components/Badge";

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

  const handleExportCSV = () => {
    const csv = [
      ["Student", "Route", "Amount", "Date", "Status", "Transaction ID"],
      ...filtered.map((t) => [
        t.studentName,
        t.route,
        t.amount,
        t.date,
        t.status,
        t.txnId,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
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
          className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
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
          className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Route</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{t.studentName}</td>
                  <td className="px-6 py-4 text-sm">{t.route}</td>
                  <td className="px-6 py-4 font-semibold">${t.amount}</td>
                  <td className="px-6 py-4 text-sm">{t.date}</td>
                  <td className="px-6 py-4">
                    <Badge text={t.status} type={t.status.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{t.txnId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
