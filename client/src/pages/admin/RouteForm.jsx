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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Route Name</label>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bus Number</label>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Capacity</label>
        <input
          type="number"
          className="mt-1 block w-full border rounded p-2"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          className="mt-1 block w-full border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Stops</h4>
        {stops.map((stop, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              placeholder="Stop name"
              className="border rounded p-2 flex-1"
              value={stop.stopName}
              onChange={(e) => updateStop(idx, "stopName", e.target.value)}
            />
            <input
              type="time"
              className="border rounded p-2"
              value={stop.pickupTime}
              onChange={(e) => updateStop(idx, "pickupTime", e.target.value)}
            />
            {stops.length > 1 && (
              <button
                type="button"
                onClick={() => removeStop(idx)}
                className="text-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStop}
          className="text-blue-600 underline text-sm"
        >
          + Add Stop
        </button>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Save
        </button>
      </div>
    </form>
  );
}
