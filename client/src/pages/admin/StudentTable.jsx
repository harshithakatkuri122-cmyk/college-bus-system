import React, { useState } from "react";
import Badge from "../../components/Badge";

const ITEMS_PER_PAGE = 10;

export default function StudentTable({ students }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const filtered = students.filter((s) => {
    if (search && !(`${s.name}${s.rollNo}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (routeFilter && s.route !== routeFilter) return false;
    if (paymentFilter && s.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const routes = Array.from(new Set(students.map((s) => s.route)));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paged = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Search by name or roll no..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
        />
        <select
          value={routeFilter}
          onChange={(e) => {
            setRouteFilter(e.target.value);
            setPage(1);
          }}
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
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
        >
          <option value="">All payment statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Roll No</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Route</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Seat</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Payment Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <tr key={s.rollNo || s.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.rollNo}</td>
                  <td className="px-6 py-4 text-sm">{s.route}</td>
                  <td className="px-6 py-4 text-sm font-mono">{s.busNo}</td>
                  <td className="px-6 py-4">
                    <Badge text={s.paymentStatus} type={s.paymentStatus.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.contact}</td>
                  <td className="px-6 py-4 space-x-1">
                    <button className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition">
                      View
                    </button>
                    <button className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition">
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {start + 1} to {Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded transition ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
