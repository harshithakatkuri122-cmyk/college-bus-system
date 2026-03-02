import React, { useState } from "react";
import RouteSelection from "./RouteSelection";
import SeatSelection from "./SeatSelection";

export default function SeniorChangeBus({ student, setStudent }) {
  const [step, setStep] = useState("selectRoute"); // 'selectRoute' | 'selectSeat' | 'complete'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Step 1: Route selected
  const handleRouteSelected = (route) => {
    setSelectedRoute(route);
    setStep("selectSeat");
  };

  // Step 2: Seat selected
  const handleSeatSelected = (seat) => {
    setSelectedSeat(seat);
    // Immediately update student (NO payment required for mid-year change)
    setStudent((prev) => ({
      ...prev,
      route: selectedRoute,
      busNo: `Bus ${Math.floor(Math.random() * 20) + 1}`,
      seatNo: seat,
    }));
    setStep("complete");
  };

  // Cancel handler
  const handleCancel = () => {
    setStep("selectRoute");
    setSelectedRoute(null);
    setSelectedSeat(null);
  };

  // Step: Select Route
  if (step === "selectRoute") {
    return (
      <RouteSelection
        onSelect={handleRouteSelected}
        onCancel={handleCancel}
      />
    );
  }

  // Step: Select Seat
  if (step === "selectSeat") {
    return (
      <SeatSelection
        onConfirm={handleSeatSelected}
        onCancel={handleCancel}
      />
    );
  }

  // Step: Complete (NO PAYMENT)
  if (step === "complete") {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-8 text-center">
        <i className="fas fa-check-circle text-green-600 text-5xl mb-4"></i>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Bus Change Successful!
        </h3>
        <p className="text-green-800 mb-6">
          Your bus assignment has been updated immediately. No payment required for mid-year changes.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold text-gray-700">New Route:</span>{" "}
              <span className="text-gray-600">{selectedRoute}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">New Bus:</span>{" "}
              <span className="text-gray-600">{`Bus ${Math.floor(Math.random() * 20) + 1}`}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">New Seat:</span>{" "}
              <span className="text-gray-600">{selectedSeat}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Status:</span>{" "}
              <span className="text-green-600 font-bold">Active</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left text-sm text-blue-800">
          <p className="font-semibold mb-2">Important Note:</p>
          <p>
            This is a mid-year bus change which is effective immediately. Your next renewal will be during the next academic year. Please update your transportation details with the hostel and admin office.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
