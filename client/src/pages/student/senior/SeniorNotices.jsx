import React, { useState, useEffect } from "react";

// Dummy data for notices
const dummyNotices = [
  {
    id: 1,
    title: "Bus Timing Changed",
    message: "Bus 12 timing changed to 8:10 AM",
    date: "12 Feb 2026",
    sender: "Admin",
    route: "KPHB - College",
  },
  {
    id: 2,
    title: "Route Maintenance",
    message: "Route maintenance on LB Nagar will cause delays of 10 mins.",
    date: "20 Jan 2026",
    sender: "Incharge",
    route: "LB Nagar - College",
  },
  {
    id: 3,
    title: "Festival Notice",
    message: "No buses will run on 1st March due to Holi celebrations.",
    date: "25 Feb 2026",
    sender: "Admin",
    route: null, // global notice
  },
];

export default function SeniorNotices({ student }) {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (!student) return;
    const filtered = dummyNotices.filter(
      (n) => !n.route || n.route === student.route
    );
    setNotices(filtered);
  }, [student]);

  if (!student) {
    return <p className="text-center text-gray-600">Loading notices...</p>;
  }

  if (notices.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-8">
        You have no notices at the moment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((n) => (
        <div
          key={n.id}
          className="bg-white shadow-md border-l-4 border-green-500 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">{n.title}</h3>
            <span className="text-sm text-gray-500">{n.date}</span>
          </div>
          <p className="mt-2 text-gray-700 leading-relaxed">{n.message}</p>
          <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-4">
            <span>Sender: {n.sender}</span>
            <span>{n.route ? `Route: ${n.route}` : "Global"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
