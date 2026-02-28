import React, { useState, useEffect } from "react";

// Generate 4x10 grid (40 seats) with realistic layout
function buildSeats() {
  const seats = [];
  for (let row = 1; row <= 10; row++) {
    seats.push({ id: `${row}A`, label: `${row}A`, status: "available" });
    seats.push({ id: `${row}B`, label: `${row}B`, status: "available" });
    seats.push({ id: `${row}C`, label: `${row}C`, status: "available" });
    seats.push({ id: `${row}D`, label: `${row}D`, status: "available" });
  }
  return seats;
}

export default function SeatSelection({ onConfirm, onCancel }) {
  const allSeats = buildSeats();
  const [occupied, setOccupied] = useState(new Set());
  const [selected, setSelected] = useState(null);

  // Simulate occupied seats
  useEffect(() => {
    const occ = new Set([
      "1A", "2B", "3C", "4A", "5D", "6B", "7A", "8C", "9B", "10D"
    ]);
    setOccupied(occ);
  }, []);

  const handleSeatClick = (seatId) => {
    if (occupied.has(seatId)) return; // Cannot select occupied seat
    setSelected(selected === seatId ? null : seatId); // Toggle selection
  };

  // Group seats into rows for better layout
  const rows = [];
  for (let i = 0; i < allSeats.length; i += 4) {
    rows.push(allSeats.slice(i, i + 4));
  }

  const getSeatColor = (seatId) => {
    if (occupied.has(seatId)) {
      return "bg-red-400 cursor-not-allowed border-red-500"; // Occupied = Red
    }
    if (selected === seatId) {
      return "bg-gray-500 text-white border-gray-600"; // Selected = Grey
    }
    return "bg-green-400 hover:bg-green-500 border-green-500 cursor-pointer"; // Available = Green
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        <i className="fas fa-chair text-green-600 mr-3"></i>
        Select Your Seat
      </h2>
      <p className="text-gray-600 mb-8">
        Choose one available seat for your bus journey
      </p>

      {/* Seat Grid */}
      <div className="bg-gray-50 p-8 rounded-xl mb-6 border-2 border-gray-200 inline-block">
        <div className="space-y-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {row.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id)}
                  disabled={occupied.has(seat.id)}
                  className={`
                    w-12 h-12 rounded-lg border-2 font-bold transition-all
                    flex items-center justify-center text-sm
                    ${getSeatColor(seat.id)}
                  `}
                >
                  {seat.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Front of bus indicator */}
        <div className="text-center mt-6 text-sm text-gray-600 font-semibold">
          ↑ Front of Bus ↑
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded border-2 border-green-500"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-500 rounded border-2 border-gray-600"></div>
          <span className="text-sm text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-400 rounded border-2 border-red-500"></div>
          <span className="text-sm text-gray-700">Booked</span>
        </div>
      </div>

      {/* Selected seat info */}
      {selected && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-blue-800">
            <span className="font-bold">Selected Seat:</span> {selected}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
        >
          <i className="fas fa-check mr-2"></i>
          Confirm Seat
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
