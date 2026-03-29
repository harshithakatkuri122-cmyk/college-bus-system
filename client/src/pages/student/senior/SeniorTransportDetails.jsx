import React, { useCallback, useEffect, useState } from "react";

const STATUS_ENDPOINT = "/api/student/my-status";

export default function SeniorTransportDetails({ student, setStudent }) {
  const [studentData, setStudentData] = useState(student || null);
  const [resolvedRoute, setResolvedRoute] = useState({ route_name: "", via: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again to view transport details.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(STATUS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load transport details");
      }

      setStudentData(data);

      if (setStudent) {
        setStudent((prev) => ({
          ...(prev || {}),
          name: data.name,
          roll_no: data.roll_no,
          route: data.route_no ?? data.route,
          route_no: data.route_no,
          route_name: data.route_name,
          via: data.via,
          bus_no: data.bus_no,
          seat_no: data.seat_no,
          payment_status: data.payment_status ?? prev?.payment_status,
          driver_contact: data.driver_contact,
          hasBookedBus: Boolean(data.bus_no),
          hasPaidFees:
            data.payment_status
              ? data.payment_status === "Active"
              : (prev?.hasPaidFees ?? Boolean(data.bus_no)),
        }));
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError.message || "Unable to fetch transport details");
    } finally {
      setLoading(false);
    }
  }, [setStudent]);

  useEffect(() => {
    fetchStudentStatus();
  }, [fetchStudentStatus]);

  useEffect(() => {
    async function resolveRouteName() {
      if (!studentData || studentData.route_name || !studentData.route) return;

      try {
        const res = await fetch("/api/routes");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;

        const matched = data.find((route) => Number(route.route_no) === Number(studentData.route));
        if (matched) {
          setResolvedRoute({
            route_name: matched.route_name || "",
            via: matched.via || "",
          });
        }
      } catch (resolveError) {
        console.error(resolveError);
      }
    }

    resolveRouteName();
  }, [studentData]);

  useEffect(() => {
    const onStatusRefresh = () => fetchStudentStatus();
    window.addEventListener("student-status-refresh", onStatusRefresh);

    return () => {
      window.removeEventListener("student-status-refresh", onStatusRefresh);
    };
  }, [fetchStudentStatus]);

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

  if (!studentData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">No transport details found.</p>
      </div>
    );
  }

  const {
    name,
    roll_no,
    route_name,
    via,
    bus_no,
    seat_no,
    driver_contact,
  } = studentData;
  const routeDisplay = route_name || resolvedRoute.route_name || "Not assigned";
  const viaDisplay = via || resolvedRoute.via || "Not available";

  return (
    <div className="space-y-8">
      {/* Information Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md p-8 border-t-4 border-green-600">
        <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
          <i className="fas fa-bus text-green-600"></i>
          Your Current Bus Assignment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</p>
              <p className="text-2xl font-bold text-gray-800">{name}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Roll Number
              </p>
              <p className="text-2xl font-bold text-gray-800">{roll_no || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Bus Number</p>
              <p className="text-lg font-bold text-green-700">{bus_no || "Not assigned"}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Route</p>
              <p className="text-lg font-semibold text-gray-800">{routeDisplay}</p>
              <p className="text-sm text-gray-600 mt-1">Via: {viaDisplay}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Seat Number</p>
              <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-lg">
                {seat_no || "-"}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Contact</p>
              <p className="text-lg font-mono text-gray-800">{driver_contact || "Not available"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex gap-4">
          <i className="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">About Your Assignment</h3>
            <p className="text-sm text-blue-800">
              Your bus route and seat have been assigned from the previous academic year. These details will remain active until you renew or change your route for the next academic year. Your payment status must be "Active" to avail the bus service.
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only Badge */}
      <div className="text-center text-sm text-gray-500">
        <i className="fas fa-lock text-gray-400 mr-2"></i>
        This is your current bus assignment (Read-only)
      </div>
    </div>
  );
}
