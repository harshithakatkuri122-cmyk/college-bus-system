import React, { useState } from "react";
import RouteSelection from "./RouteSelection";
import SeatSelection from "./SeatSelection";
import PaymentSection from "./PaymentSection";

export default function SeniorRenewalOptions({ student, setStudent }) {
  const [step, setStep] = useState("choice"); // 'choice' | 'selectRoute' | 'selectSeat' | 'payment' | 'complete'
  const [renewalType, setRenewalType] = useState(null); // 'same' | 'change'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [renewalError, setRenewalError] = useState("");
  const [bookingSeat, setBookingSeat] = useState(false);

  // Step 1: Choose renewal type
  const handleSameRoute = () => {
    setRenewalError("");

    if (!student?.bus_no || !student?.seat_no) {
      setRenewalType("change");
      setStep("selectRoute");
      setRenewalError("No current seat found. Please select route and seat to continue renewal.");
      return;
    }

    setRenewalType("same");
    setStep("payment");
  };

  const handleChangeRoute = () => {
    setRenewalError("");
    setRenewalType("change");
    setStep("selectRoute");
  };

  // Step 2: Route selected (change route flow only)
  const handleRouteSelected = (route) => {
    setRenewalError("");
    setSelectedRoute(route);
    setStep("selectSeat");
  };

  // Step 3: Seat selected
  const handleSeatSelected = async (seat) => {
    setRenewalError("");
    setSelectedSeat(seat);

    if (renewalType !== "change") {
      setStep("payment");
      return;
    }

    const token = localStorage.getItem("token");
    const rollNo = student?.roll_no;
    const routeNo = selectedRoute?.route_no;

    if (!token || !rollNo || !routeNo) {
      setRenewalError("Unable to continue renewal. Please login again and reselect route.");
      return;
    }

    try {
      setBookingSeat(true);
      const res = await fetch("/api/student/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roll_no: rollNo,
          route_no: Number(routeNo),
          seat_no: Number(seat),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Seat booking failed");
      }

      setStudent((prev) => ({
        ...(prev || {}),
        route_no: Number(routeNo),
        route: Number(routeNo),
        route_name: selectedRoute?.route_name || prev?.route_name,
        via: selectedRoute?.via || prev?.via,
        seat_no: Number(seat),
        bus_no: data.bus_no || prev?.bus_no,
        payment_status: data.payment_status || "Pending",
        hasBookedBus: true,
      }));

      window.dispatchEvent(new Event("student-status-refresh"));
      setStep("payment");
    } catch (error) {
      console.error(error);
      setRenewalError(error.message || "Unable to book selected seat");
    } finally {
      setBookingSeat(false);
    }
  };

  // Step 4: Payment successful
  const handlePaymentSuccess = (statusData) => {
    setStudent((prev) => ({
      ...(prev || {}),
      ...(statusData || {}),
      hasBookedBus: Boolean(statusData?.bus_no ?? prev?.bus_no),
      hasPaidFees: (statusData?.payment_status || prev?.payment_status) === "Active",
    }));

    window.dispatchEvent(new Event("student-status-refresh"));
    setStep("complete");
  };

  // Cancel handler
  const handleCancel = () => {
    setStep("choice");
    setRenewalType(null);
    setSelectedRoute(null);
    setSelectedSeat(null);
    setRenewalError("");
  };

  // Step: Choice
  if (step === "choice") {
    return (
      <div className="space-y-4">
        {renewalError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-700">{renewalError}</p>
          </div>
        )}

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
            <i className="fas fa-sync-alt"></i>
            Bus Renewal
          </h3>
          <p className="text-sm text-green-800">
            You can renew your bus pass for the next academic year. Choose whether to keep the same route or change to a different one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Renew Same Route */}
          <button
            onClick={handleSameRoute}
            className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-100 transition text-left"
          >
            <div className="flex items-start gap-3">
              <i className="fas fa-check-circle text-blue-600 text-xl mt-1"></i>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Renew Same Route</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Keep your current route and proceed to payment
                </p>
                <div className="text-xs text-blue-700 bg-white bg-opacity-50 p-2 rounded">
                  <span className="font-semibold">Current:</span> {student.route_name || student.route || "Not assigned"}
                </div>
              </div>
            </div>
          </button>

          {/* Change Route */}
          <button
            onClick={handleChangeRoute}
            className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-100 transition text-left"
          >
            <div className="flex items-start gap-3">
              <i className="fas fa-exchange-alt text-purple-600 text-xl mt-1"></i>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">Change Route</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Select a new route and seat for the next year
                </p>
                <div className="text-xs text-purple-700 bg-white bg-opacity-50 p-2 rounded">
                  <span className="font-semibold">Select:</span> New route & seat
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step: Select Route
  if (step === "selectRoute") {
    return (
      <RouteSelection
        student={student}
        onSelect={handleRouteSelected}
        onCancel={handleCancel}
      />
    );
  }

  // Step: Select Seat
  if (step === "selectSeat") {
    return (
      <div className="space-y-4">
        {renewalError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-700">{renewalError}</p>
          </div>
        )}
        <SeatSelection
          route={selectedRoute}
          onConfirm={handleSeatSelected}
          onCancel={handleCancel}
        />
        {bookingSeat && (
          <p className="text-sm text-gray-600">Booking selected seat...</p>
        )}
      </div>
    );
  }

  // Step: Payment
  if (step === "payment") {
    const changeRouteLabel = selectedRoute
      ? `${selectedRoute.route_no} - ${selectedRoute.route_name}`
      : "-";
    const displayRoute =
      renewalType === "same" ? (student.route_name || student.route || "-") : changeRouteLabel;
    const displaySeat = renewalType === "same" ? (student.seat_no || student.seatNo || "-") : selectedSeat;

    return (
      <PaymentSection
        route={displayRoute}
        seat={displaySeat}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Step: Complete
  if (step === "complete") {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-8 text-center">
        <i className="fas fa-check-circle text-green-600 text-5xl mb-4"></i>
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Renewal Successful!
        </h3>
        <p className="text-green-800 mb-6">
          Your bus pass has been renewed and is now active. You're ready to board your bus!
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold text-gray-700">Route:</span>{" "}
              <span className="text-gray-600">
                  {renewalType === "same"
                    ? (student.route_name || student.route || "-")
                    : (selectedRoute ? `${selectedRoute.route_no} - ${selectedRoute.route_name}` : "-")}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Bus:</span>{" "}
              <span className="text-gray-600">
                  {student.bus_no || student.busNo || "-"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Seat:</span>{" "}
              <span className="text-gray-600">
                  {renewalType === "same" ? (student.seat_no || student.seatNo || "-") : selectedSeat}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Status:</span>{" "}
              <span className="text-green-600 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
