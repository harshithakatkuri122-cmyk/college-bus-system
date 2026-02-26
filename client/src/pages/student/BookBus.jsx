import { useState } from "react";
import SeatLayout from "../../components/SeatLayout";

export default function BookBus() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const booked = [3, 5, 12, 15]; // mock data

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Bus</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Step 1: Select Route</label>
        <select className="border border-gray-300 rounded p-2 w-1/2">
          <option>Route A</option>
          <option>Route B</option>
          <option>Route C</option>
        </select>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Step 2: Choose Seat</h3>
        {selectedSeat && (
          <p className="text-green-700 font-semibold">
            Selected seat: {selectedSeat}
          </p>
        )}
        <div className="my-4">
          <SeatLayout
            rows={10}
            cols={4}
            bookedSeats={booked}
            onSelectionChange={setSelectedSeat}
          />
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-green-400 inline-block rounded-sm border"></span>
            <span className="text-sm">Available</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-red-500 inline-block rounded-sm border"></span>
            <span className="text-sm">Booked</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-yellow-400 inline-block rounded-sm border"></span>
            <span className="text-sm">Selected</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-gray-300 inline-block rounded-sm border"></span>
            <span className="text-sm">Disabled</span>
          </span>
        </div>
        <button
          disabled={!selectedSeat}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
