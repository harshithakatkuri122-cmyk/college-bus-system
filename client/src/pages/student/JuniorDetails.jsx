import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function JuniorDetails() {
  const navigate = useNavigate();
  const { setStudent } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedRouteName, setResolvedRouteName] = useState("");
  const [resolvedVia, setResolvedVia] = useState("");

  useEffect(() => {
    async function loadStatus() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/student/my-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load status");
        }

        const booked = Boolean(data.booked ?? data.bus_no);
        const normalized = {
          ...data,
          booked,
        };

        setStatus(normalized);
        setStudent((prev) => ({
          ...(prev || {}),
          ...normalized,
          hasBookedBus: booked,
          hasPaidFees: normalized.payment_status === "Active",
        }));
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || "Unable to fetch transport details");
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [setStudent]);

  useEffect(() => {
    async function resolveRouteName() {
      if (!status || status.route_name || !status.route) return;

      try {
        const res = await fetch("/api/routes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;

        const matched = data.find((route) => Number(route.route_no) === Number(status.route));
        if (matched) {
          setResolvedRouteName(matched.route_name || "");
          setResolvedVia(matched.via || "");
        }
      } catch (resolveError) {
        console.error(resolveError);
      }
    }

    resolveRouteName();
  }, [status]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">Loading transport details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!status || !status.booked) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Transport Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          You have not booked a seat yet.
        </p>
        <button
          onClick={() => navigate("/student/junior/book")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Book a Bus
        </button>
      </div>
    );
  }

  const routeName = status.route_name || resolvedRouteName || "Not assigned";
  const routeVia = status.via || resolvedVia || "Not available";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Transport Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
          <p className="text-lg font-semibold text-gray-800">{status.name || "-"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Roll</p>
          <p className="text-lg font-semibold text-gray-800">{status.roll_no || "-"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
          <p className="text-lg font-semibold text-gray-800">{routeName}</p>
          <p className="text-sm text-gray-600 mt-1">Via: {routeVia}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Bus No</p>
          <p className="text-lg font-semibold text-gray-800">{status.bus_no || "-"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Seat No</p>
          <p className="text-lg font-semibold text-gray-800">{status.seat_no || "-"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</p>
          <p className="text-lg font-semibold text-gray-800">{status.payment_status || "-"}</p>
        </div>
      </div>
    </div>
  );
}
