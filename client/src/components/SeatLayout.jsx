import { useState } from "react";

// seatStatuses: 'available','booked','selected','disabled'
export default function SeatLayout({
  rows = 10,
  cols = 4,
  bookedSeats = [],
  disabledSeats = [],
  onSelectionChange,
}) {
  const totalSeats = rows * cols;
  const [selected, setSelected] = useState(null);

  function toggleSeat(number) {
    if (bookedSeats.includes(number) || disabledSeats.includes(number)) return;
    setSelected((prev) => {
      const newSelected = prev === number ? null : number;
      if (onSelectionChange) onSelectionChange(newSelected);
      return newSelected;
    });
  }

  const renderSeat = (number) => {
    const isBooked = bookedSeats.includes(number);
    const isDisabled = disabledSeats.includes(number);
    const isSelected = selected === number;
    let bgClass = "";
    let cursor = "cursor-pointer";
    let title = `Seat ${number}`;
    if (isBooked) {
      bgClass = "bg-red-500 text-white";
      cursor = "cursor-not-allowed";
      title += " (booked)";
    } else if (isSelected) {
      bgClass = "bg-yellow-400";
    } else if (isDisabled) {
      bgClass = "bg-gray-300";
      cursor = "cursor-not-allowed";
      title += " (unavailable)";
    } else {
      bgClass = "bg-green-400 hover:bg-green-500";
    }

    return (
      <div
        key={number}
        title={title}
        onClick={() => toggleSeat(number)}
        className={`w-10 h-10 m-1 flex items-center justify-center text-sm font-semibold rounded transition-all duration-150 ${bgClass} ${cursor}`}
      >
        {number}
      </div>
    );
  };

  const gridRows = [];
  let counter = 1;
  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      rowSeats.push(renderSeat(counter));
      counter++;
    }
    gridRows.push(
      <div key={r} className="flex justify-center">
        {/* add a spacer (aisle) after 2 seats */}
        {rowSeats.slice(0, 2)}
        <div className="w-8"></div>
        {rowSeats.slice(2)}
      </div>
    );
  }

  return <div className="flex flex-col items-center">{gridRows}</div>;
}
