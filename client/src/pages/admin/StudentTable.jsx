import React, { useState } from "react";
import Badge from "../../components/Badge";

const ITEMS_PER_PAGE = 10;

export default function StudentTable({ students, routes = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewError, setViewError] = useState("");

  const fetchStudentDetails = async (student) => {
    const userId = Number(student?.user_id ?? student?.id);

    if (!Number.isInteger(userId)) {
      setViewError("Invalid student id.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setViewLoadingId(userId);
      setViewError("");

      const response = await fetch(`/api/admin/students/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        console.error("Failed to fetch student details");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch student details");
      }

      setSelectedStudent(data);
    } catch (error) {
      console.error(error);
      setViewError(error.message || "Unable to fetch student details");
    } finally {
      setViewLoadingId(null);
    }
  };

  const filtered = students.filter((s) => {
    const rollNo = s.roll_no || s.rollNo || "";
    const routeName = s.route_name || "Not Assigned";
    const paymentStatus = s.payment_status || s.paymentStatus || "";

    if (search && !(`${s.name || ""}${rollNo}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (routeFilter && routeName !== routeFilter) return false;
    if (paymentFilter && paymentStatus !== paymentFilter) return false;
    return true;
  });

  const routeOptions = Array.from(
    new Set([
      ...routes.map((route) => route.routeName).filter(Boolean),
      ...students.map((student) => student.route_name || "Not Assigned").filter(Boolean),
    ])
  );
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
          {routeOptions.map((r) => (
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
                <tr key={s.roll_no || s.rollNo || s.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.roll_no || s.rollNo || "-"}</td>
                  <td className="px-6 py-4 text-sm">{s.route_name || "Not Assigned"}</td>
                  <td className="px-6 py-4 text-sm font-mono">{s.bus_no || s.busNo || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge
                      text={s.payment_status || s.paymentStatus || "Pending"}
                      type={String(s.payment_status || s.paymentStatus || "pending").toLowerCase()}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.contact || "-"}</td>
                  <td className="px-6 py-4 space-x-1">
                    <button
                      onClick={() => fetchStudentDetails(s)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition"
                    >
                      {viewLoadingId === Number(s.user_id ?? s.id) ? "Loading..." : "View"}
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

      {viewError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {viewError}
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Student Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-6 text-sm text-gray-700 md:grid-cols-2">
              <p><span className="font-semibold">Name:</span> {selectedStudent.name || "-"}</p>
              <p><span className="font-semibold">Roll No:</span> {selectedStudent.roll_no || "-"}</p>
              <p><span className="font-semibold">Route:</span> {selectedStudent.route_name || "Not Assigned"}</p>
              <p><span className="font-semibold">Bus:</span> {selectedStudent.bus_no || "-"}</p>
              <p><span className="font-semibold">Seat:</span> {selectedStudent.seat_no || "-"}</p>
              <p><span className="font-semibold">Payment:</span> {selectedStudent.payment_status || "Pending"}</p>
              <p><span className="font-semibold">Contact:</span> {selectedStudent.contact || "-"}</p>
              <p><span className="font-semibold">Gender:</span> {selectedStudent.gender || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
