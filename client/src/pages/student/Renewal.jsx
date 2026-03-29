import { useState } from "react";
import SeatLayout from "../../components/SeatLayout";
import { useAuth } from "../../context/AuthContext";

export default function Renewal() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const booked = [4, 8, 20];
  const { student } = useAuth();

  const routeName = student?.route_name || "Not assigned";
  const routeVia = student?.via || "Not available";
  const currentSeat = student?.seat_no || "-";

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Renewal</h2>
      <p className="mb-1">Current route: {routeName}</p>
      <p className="mb-2 text-sm text-gray-600">Via: {routeVia} | Seat: {currentSeat}</p>
      <h3 className="font-semibold">Select new seat if you want to change</h3>
      <div className="my-4">
        <SeatLayout
          rows={10}
          cols={4}
          bookedSeats={booked}
          onSelectionChange={setSelectedSeat}
        />
      </div>
      <button
        disabled={!selectedSeat}
        className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
      >
        Renew Pass
      </button>
    </div>
  );
}
