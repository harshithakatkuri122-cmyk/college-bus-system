import React, { useState, useEffect } from "react";

// generate seat ids based on layout description
function buildSeats() {
  const seats = [];
  // rows 1-9
  for (let r = 1; r <= 9; r++) {
    seats.push({ id: `L${r}1`, label: `${r}A` });
    seats.push({ id: `L${r}2`, label: `${r}B` });
    seats.push({ id: `R${r}1`, label: `${r}C` });
    seats.push({ id: `R${r}2`, label: `${r}D` });
    seats.push({ id: `R${r}3`, label: `${r}E` });
  }
  // row 10 seven seats
  for (let i = 1; i <= 7; i++) {
    seats.push({ id: `F10${i}`, label: `10${String.fromCharCode(64 + i)}` });
  }
  return seats;
}

export default function SeniorSeatSelection({ onConfirm }) {
  const allSeats = buildSeats();
  const [occupied, setOccupied] = useState(new Set());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // simulate some occupied seats
    const occ = new Set();
    const sample = ["L11", "R22", "R33", "F10A", "F10C"];
    sample.forEach((s) => occ.add(s));
    setOccupied(occ);
  }, []);

  const handleClick = (seatId) => {
    if (occupied.has(seatId)) return;
    setSelected((prev) => (prev === seatId ? null : seatId));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a seat</h2>
      <div className="space-y-2">
        {/* simplified grid */}
        {allSeats.map((s) => {
          const isOcc = occupied.has(s.id);
          const isSel = selected === s.id;
          return (
            <button
              key={s.id}
              disabled={isOcc}
              onClick={() => handleClick(s.id)}
              className={`inline-block w-14 h-14 m-1 text-sm border rounded-lg flex items-center justify-center
                ${isOcc ? "bg-gray-400 cursor-not-allowed" : isSel ? "bg-green-400" : "bg-white hover:bg-gray-100"}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <button
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          Confirm Seat &amp; Continue to Payment
        </button>
      </div>
      <div className="mt-4 text-sm">
        <span className="inline-block w-4 h-4 bg-white border mr-1 align-middle"></span>
        Available
        <span className="inline-block w-4 h-4 bg-green-400 border ml-4 mr-1 align-middle"></span>
        Selected
        <span className="inline-block w-4 h-4 bg-gray-400 border ml-4 mr-1 align-middle"></span>
        Occupied
      </div>
    </div>
  );
}
