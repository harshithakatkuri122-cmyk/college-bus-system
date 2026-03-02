import React, { useState } from "react";

export default function NoticeForm({ notices, setNotices }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All");
  const [route, setRoute] = useState("");

  const handleSend = () => {
    setNotices((prev) => [
      ...prev,
      { id: Date.now(), title, message, audience, route, date: new Date().toISOString() },
    ]);
    setTitle("");
    setMessage("");
    setAudience("All");
    setRoute("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h3 className="font-semibold">Send Notice</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="mt-1 block w-full border rounded p-2"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Audience</label>
            <select
              className="mt-1 block w-full border rounded p-2"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option>All</option>
              <option>Route</option>
              <option>Bus Incharges</option>
              <option>Faculty</option>
            </select>
          </div>
          {audience === "Route" && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Route</label>
              <input
                className="mt-1 block w-full border rounded p-2"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Sent Notices</h3>
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n.id} className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{n.title}</span>
                <span className="text-xs text-gray-500">
                  {new Date(n.date).toLocaleString()}
                </span>
              </div>
              <div>
                <small className="text-gray-600">{n.audience}{n.route ? ` (route: ${n.route})` : ""}</small>
              </div>
              <p>{n.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
