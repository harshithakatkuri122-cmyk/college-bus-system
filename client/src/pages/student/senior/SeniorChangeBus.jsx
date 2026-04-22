import React, { useEffect, useState } from "react";
import RouteSelection from "./RouteSelection";
import SeatSelection from "./SeatSelection";

export default function SeniorChangeBus({ student, setStudent }) {
  const [step, setStep] = useState("selectRoute"); // 'selectRoute' | 'selectSeat' | 'complete'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(true);
  const [transportStatus, setTransportStatus] = useState(null);

  useEffect(() => {
    async function fetchTransportStatus() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login again to continue.");
        setStatusLoading(false);
        return;
      }

      try {
        setStatusLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        let response = await fetch("/api/student/status", { headers });
        let data = await response.json();

        if (!response.ok) {
          response = await fetch("/api/student/my-status", { headers });
          data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to check transport status");
          }
        }

        const normalized = String(data.payment_status || "").trim().toLowerCase();
        setTransportStatus(normalized === "active" || normalized === "paid" ? "paid" : "not_paid");
      } catch (statusError) {
        console.error(statusError);
        setError(statusError.message || "Unable to check transport status");
      } finally {
        setStatusLoading(false);
      }
    }

    fetchTransportStatus();
  }, []);

  // Step 1: Route selected
  const handleRouteSelected = (route) => {
    setError("");
    setSelectedRoute(route);
    setStep("selectSeat");
  };

  // Step 2: Seat selected
  const handleSeatSelected = async (seat) => {
    const token = localStorage.getItem("token");
    if (!token || !selectedRoute?.route_no) {
      setError("Unable to change bus. Please login again and reselect route.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSelectedSeat(seat);

      const response = await fetch("/api/student/change-bus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          route_no: Number(selectedRoute.route_no),
          seat_no: Number(seat),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change bus");
      }

      const statusRes = await fetch("/api/student/my-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        throw new Error(statusData.message || "Failed to refresh student status");
      }

      setStudent((prev) => ({
        ...(prev || {}),
        ...statusData,
        hasBookedBus: Boolean(statusData.bus_no),
        hasPaidFees: statusData.payment_status === "Active",
      }));

      window.dispatchEvent(new Event("student-status-refresh"));
      setStep("complete");
    } catch (changeError) {
      console.error(changeError);
      setError(changeError.message || "Unable to change bus");
    } finally {
      setSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setStep("selectRoute");
    setSelectedRoute(null);
    setSelectedSeat(null);
    setError("");
  };

  if (statusLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
        <p className="text-gray-600">Checking transport status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (transportStatus !== "paid") {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          You have not booked transport yet. Please book a bus first to enable bus change.
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
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <SeatSelection
          route={selectedRoute}
          onConfirm={handleSeatSelected}
          onCancel={handleCancel}
        />
        {saving && <p className="text-sm text-gray-600">Updating your bus assignment...</p>}
      </div>
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
          Your bus assignment has been updated immediately. Booking history is preserved for this academic year.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold text-gray-700">New Route:</span>{" "}
              <span className="text-gray-600">
                {selectedRoute?.route_no} - {selectedRoute?.route_name}
                {selectedRoute?.via ? ` (${selectedRoute.via})` : ""}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">New Bus:</span>{" "}
              <span className="text-gray-600">{selectedRoute?.route_no || "-"}</span>
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
