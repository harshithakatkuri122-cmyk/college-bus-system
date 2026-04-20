import React, { useState } from "react";

export default function SeniorRenewalOptions({ student, setStudent, onGoToChangeBus }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasRenewed = Boolean(student?.has_renewed_current_year);

  const renew = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/student/renewal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "You have already renewed your bus for this academic year."
        );
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
        has_renewed_current_year: true,
      }));

      setMessage("Renewal completed successfully. You can now use Change Bus if needed.");
      window.dispatchEvent(new Event("student-status-refresh"));
    } catch (renewalError) {
      console.error(renewalError);
      setError(
        renewalError.message ||
          "You have already renewed your bus for this academic year."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4">
          <p className="text-sm text-emerald-700">{message}</p>
        </div>
      )}

      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
        <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
          <i className="fas fa-sync-alt"></i>
          Bus Renewal
        </h3>
        <p className="text-sm text-green-800">
          Renewal uses your previous academic year bus assignment automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!hasRenewed && (
          <button
            onClick={renew}
            disabled={loading}
            className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-100 transition text-left disabled:opacity-70"
          >
            <div className="flex items-start gap-3">
              <i className="fas fa-check-circle text-blue-600 text-xl mt-1"></i>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Renewal</h3>
                <p className="text-sm text-blue-800 mb-3">
                  {loading
                    ? "Processing renewal..."
                    : "Use previous year bus automatically"}
                </p>
                <div className="text-xs text-blue-700 bg-white bg-opacity-50 p-2 rounded">
                  <span className="font-semibold">Current:</span>{" "}
                  {student?.route_name || student?.route || "Not assigned"}
                </div>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={onGoToChangeBus}
          className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-100 transition text-left"
        >
          <div className="flex items-start gap-3">
            <i className="fas fa-exchange-alt text-purple-600 text-xl mt-1"></i>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Change Bus</h3>
              <p className="text-sm text-purple-800 mb-3">
                Select a different route and seat while preserving booking history
              </p>
              <div className="text-xs text-purple-700 bg-white bg-opacity-50 p-2 rounded">
                <span className="font-semibold">Action:</span> Open Change Bus
              </div>
            </div>
          </div>
        </button>
      </div>

      {hasRenewed && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            You have already renewed your bus for this academic year.
          </p>
        </div>
      )}
    </div>
  );
}
