import React, { useState } from "react";

export default function RouteForm({ initialData, onSave, onCancel }) {
  const [routeName, setRouteName] = useState(initialData?.routeName || "");
  const [busNumber, setBusNumber] = useState(initialData?.busNumber || "");
  const [capacity, setCapacity] = useState(initialData?.capacity || "");
  const [status, setStatus] = useState(initialData?.status || "Open");
  const [stops, setStops] = useState(
    initialData?.stops || [{ stopName: "", pickupTime: "" }]
  );

  const addStop = () => setStops([...stops, { stopName: "", pickupTime: "" }]);
  const updateStop = (idx, field, value) => {
    const arr = [...stops];
    arr[idx][field] = value;
    setStops(arr);
  };
  const removeStop = (idx) => setStops(stops.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now(),
      routeName,
      busNumber,
      capacity: Number(capacity),
      bookedSeats: initialData?.bookedSeats || 0,
      status,
      stops,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{initialData ? "Edit Route" : "Add New Route"}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
              <input
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g., KPHB - College"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
              <input
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g., Bus 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Open</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Stops</h3>
            <div className="space-y-3">
              {stops.map((stop, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <input
                    placeholder="Stop name"
                    className="border rounded-lg p-2 flex-1 focus:ring focus:ring-blue-200"
                    value={stop.stopName}
                    onChange={(e) => updateStop(idx, "stopName", e.target.value)}
                  />
                  <input
                    type="time"
                    className="border rounded-lg p-2 focus:ring focus:ring-blue-200"
                    value={stop.pickupTime}
                    onChange={(e) => updateStop(idx, "pickupTime", e.target.value)}
                  />
                  {stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(idx)}
                      className="text-red-600 hover:text-red-800 font-bold px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addStop}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Stop
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
