import React, { useState, useMemo } from "react";

export default function InchargeStudents({ incharge }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Filter students by search term and year
  const filteredStudents = useMemo(() => {
    let filtered = incharge?.students || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          String(student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(student.roll_no || student.collegeId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(student.contact || "").includes(searchTerm) ||
          String(student.emergency || "").includes(searchTerm)
      );
    }

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter((student) => String(student.year || "") === selectedYear.replace(" Year", ""));
    }

    return filtered;
  }, [incharge?.students, searchTerm, selectedYear]);

  const years = ["I Year", "II Year", "III Year", "IV Year"];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Students</h1>
        <p className="text-gray-600">Manage students in your bus route</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        {/* Search Input */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-green-700">{filteredStudents.length}</span> student(s)
        </p>
        {(searchTerm || selectedYear) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedYear("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-md">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Student Name</th>
              <th className="px-6 py-4 text-left font-semibold">College ID</th>
              <th className="px-6 py-4 text-left font-semibold">Contact Number</th>
              <th className="px-6 py-4 text-left font-semibold">Emergency Contact</th>
              <th className="px-6 py-4 text-left font-semibold">Department</th>
              <th className="px-6 py-4 text-center font-semibold">Year</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-t border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-50 transition`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {String(student.name || "-").charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{student.name || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{student.roll_no || student.collegeId || "-"}</td>
                  <td className="px-6 py-4 text-gray-700">{student.contact || "-"}</td>
                  <td className="px-6 py-4 text-gray-700">{student.emergency || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {student.department || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {student.year ? `${student.year} Year` : "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <i className="fas fa-search text-3xl mb-3 block text-gray-300"></i>
                  <p>No students found matching your criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
