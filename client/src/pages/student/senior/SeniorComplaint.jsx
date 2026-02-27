import React, { useState } from "react";

export default function SeniorComplaint({ student }) {
  const [type, setType] = useState("Delay");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // simulate submit
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Raise Transport Complaint</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>Delay</option>
              <option>Behavior</option>
              <option>Seat Issue</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
            <input type="text" value={student?.busNo || ""} readOnly className="w-full bg-gray-50 border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full border rounded px-3 py-2"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Optional File</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0] || null)} className="w-full" />
          </div>

          <div className="flex items-center space-x-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
            {submitted && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Submitted</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
