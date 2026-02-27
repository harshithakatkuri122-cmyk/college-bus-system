import React, { useState } from "react";
import SeniorRouteSelection from "./SeniorRouteSelection";
import SeniorSeatSelection from "./SeniorSeatSelection";

export default function SeniorRenewalOptions({ student, setStudent, onDone }) {
  const [mode, setMode] = useState(null); // 'same' | 'change'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [seatConfirmed, setSeatConfirmed] = useState(false);

  const handleSame = () => setMode("same");
  const handleChange = () => setMode("change");

  const finishPayment = () => {
    setStudent((prev) => ({ ...prev, paymentStatus: "Active" }));
    setSeatConfirmed(true);
  };

  const handleRouteSelected = (route) => {
    setSelectedRoute(route);
  };

  const confirmSeat = (seat) => {
    // update student with new route / bus / seat
    setStudent((prev) => ({
      ...prev,
      route: selectedRoute,
      busNo: `Bus ${Math.floor(Math.random() * 20) + 1}`,
      seatNo: seat,
      paymentStatus: "Active",
    }));
    setSeatConfirmed(true);
  };

  if (mode === "same") {
    return (
      <div className="space-y-4">
        <p>
          <span className="font-semibold">Current Route:</span> {student.route}
        </p>
        <p>
          <span className="font-semibold">Bus No:</span> {student.busNo}
        </p>
        <button
          onClick={finishPayment}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Continue to Payment
        </button>
        {seatConfirmed && (
          <p className="text-green-700 font-semibold">
            Renewal successful! Transport is active.
          </p>
        )}
      </div>
    );
  }

  if (mode === "change") {
    if (!selectedRoute) {
      return <SeniorRouteSelection onSelect={handleRouteSelected} />;
    }
    if (selectedRoute && !seatConfirmed) {
      return <SeniorSeatSelection onConfirm={confirmSeat} />;
    }
    return (
      <p className="text-green-700 font-semibold">
        Route changed and payment complete. You're all set!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleSame}
        className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Renew for Same Route
      </button>
      <button
        onClick={handleChange}
        className="w-full bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
      >
        Change Route
      </button>
    </div>
  );
}
