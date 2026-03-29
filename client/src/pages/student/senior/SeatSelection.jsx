import React, { useState, useEffect } from "react";

export default function SeatSelection({ route, onConfirm, onCancel }) {
  const [seats, setSeats] = useState([]);
  const [restrictedSeats, setRestrictedSeats] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadSeats() {
      const token = localStorage.getItem("token");
      if (!token || !route?.route_no) {
        setError("Route not selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSelected(null);

        const res = await fetch(`/api/student/seats/${route.route_no}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const seatsData = Array.isArray(data?.seats) ? data.seats : [];
        const apiRestricted = Array.isArray(data?.restrictedSeats) ? data.restrictedSeats : [];

        if (!res.ok) {
          throw new Error(data.message || "Failed to load seats");
        }

        const seatMap = new Map(
          seatsData.map((seat) => [Number(seat.seat_no), Number(seat.is_booked) === 1])
        );

        const normalized = Array.from({ length: 40 }, (_, index) => {
          const seatNo = index + 1;
          return {
            seat_no: seatNo,
            is_booked: seatMap.get(seatNo) ? 1 : 0,
          };
        });

        setSeats(normalized);
        setRestrictedSeats(new Set(apiRestricted.map((seatNo) => Number(seatNo))));
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || "Unable to load seats");
      } finally {
        setLoading(false);
      }
    }

    loadSeats();
  }, [route?.route_no]);

  const handleSeatClick = (seatNo, isDisabled) => {
    if (isDisabled) return;
    setSelected((prev) => (prev === seatNo ? null : seatNo));
  };

  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  const getSeatColor = (seat) => {
    const seatNo = Number(seat.seat_no);
    if (Number(seat.is_booked) === 1) {
      return "bg-red-500 cursor-not-allowed border-red-600 text-white";
    }
    if (restrictedSeats.has(seatNo)) {
      return "bg-amber-500 cursor-not-allowed border-amber-600 text-white";
    }
    if (selected === seatNo) {
      return "bg-blue-500 text-white border-blue-600";
    }
    return "bg-green-500 hover:bg-green-600 border-green-600 text-white cursor-pointer";
  };

  function formatRouteLabel() {
    if (!route) return "-";
    const via = route.via ? ` (${route.via})` : "";
    return `${route.route_no} - ${route.route_name}${via}`;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        <i className="fas fa-chair text-green-600 mr-3"></i>
        Select Your Seat
      </h2>
      <p className="text-gray-600 mb-8">
        Choose one available seat for your route: <span className="font-semibold">{formatRouteLabel()}</span>
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-600 mb-4">Loading seats...</p>}

      {/* Seat Grid */}
      {!loading && (
      <div className="bg-gray-50 p-8 rounded-xl mb-6 border-2 border-gray-200 inline-block">
        <div className="text-center mb-4 text-sm text-gray-600 font-semibold">
          ↑ Front of Bus ↑
        </div>
        <div className="space-y-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center items-center">
              <button
                onClick={() => handleSeatClick(Number(row[0]?.seat_no), Number(row[0]?.is_booked) === 1 || restrictedSeats.has(Number(row[0]?.seat_no)))}
                disabled={Number(row[0]?.is_booked) === 1 || restrictedSeats.has(Number(row[0]?.seat_no))}
                className={`w-12 h-12 rounded-lg border-2 font-bold transition-all flex items-center justify-center text-sm ${getSeatColor(row[0])}`}
              >
                {row[0]?.seat_no}
              </button>
              <button
                onClick={() => handleSeatClick(Number(row[1]?.seat_no), Number(row[1]?.is_booked) === 1 || restrictedSeats.has(Number(row[1]?.seat_no)))}
                disabled={Number(row[1]?.is_booked) === 1 || restrictedSeats.has(Number(row[1]?.seat_no))}
                className={`w-12 h-12 rounded-lg border-2 font-bold transition-all flex items-center justify-center text-sm ${getSeatColor(row[1])}`}
              >
                {row[1]?.seat_no}
              </button>
              <div className="w-8"></div>
              <button
                onClick={() => handleSeatClick(Number(row[2]?.seat_no), Number(row[2]?.is_booked) === 1 || restrictedSeats.has(Number(row[2]?.seat_no)))}
                disabled={Number(row[2]?.is_booked) === 1 || restrictedSeats.has(Number(row[2]?.seat_no))}
                className={`w-12 h-12 rounded-lg border-2 font-bold transition-all flex items-center justify-center text-sm ${getSeatColor(row[2])}`}
              >
                {row[2]?.seat_no}
              </button>
              <button
                onClick={() => handleSeatClick(Number(row[3]?.seat_no), Number(row[3]?.is_booked) === 1 || restrictedSeats.has(Number(row[3]?.seat_no)))}
                disabled={Number(row[3]?.is_booked) === 1 || restrictedSeats.has(Number(row[3]?.seat_no))}
                className={`w-12 h-12 rounded-lg border-2 font-bold transition-all flex items-center justify-center text-sm ${getSeatColor(row[3])}`}
              >
                {row[3]?.seat_no}
              </button>
            </div>
          ))}
        </div>

      </div>
      )}

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-600"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-600"></div>
          <span className="text-sm text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded border-2 border-amber-600"></div>
          <span className="text-sm text-gray-700">Restricted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded border-2 border-blue-600"></div>
          <span className="text-sm text-gray-700">Selected</span>
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
          disabled={!selected || loading}
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
