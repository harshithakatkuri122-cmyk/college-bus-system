import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const BOOKING_ENDPOINT = (bookingId) => `/api/student/booking/${bookingId}`;
const STATUS_ENDPOINT = "/api/student/my-status";

export default function BusPassPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    async function loadBooking() {
      const token = localStorage.getItem("token");

      if (!bookingId) {
        setError("Missing booking id.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Please login again to view your bus pass.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        if (!bookingId) {
          const statusRes = await fetch(STATUS_ENDPOINT, { headers });
          const statusData = await statusRes.json();

          if (!statusRes.ok) {
            throw new Error(statusData.message || "Unable to load bus pass");
          }

          const paid = String(statusData.payment_status || "").trim().toLowerCase() === "active";
          if (!paid) {
            navigate("/payment", { replace: true });
            return;
          }

          setBooking({
            student_name: statusData.name,
            route_no: statusData.route_no,
            route_name: statusData.route_name,
            bus_no: statusData.bus_no,
            seat_no: statusData.seat_no,
            payment_status: "paid",
          });
          return;
        }

        const res = await fetch(BOOKING_ENDPOINT(bookingId), { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load bus pass");
        }

        if (String(data.payment_status || "").toLowerCase() !== "paid") {
          navigate(`/payment?booking_id=${bookingId}`, { replace: true });
          return;
        }

        setBooking(data);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || "Unable to load bus pass");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId, navigate]);

  const successMessage = location.state?.successMessage;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
          <p className="text-gray-600">Loading bus pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl border-t-4 border-emerald-500 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bus Pass</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your pass is ready after successful payment.
          </p>
        </div>

        {successMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : booking ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold">Student Name:</span> {booking.student_name || "-"}</p>
            <p><span className="font-semibold">Route:</span> {booking.route_no} - {booking.route_name || "-"}</p>
            <p><span className="font-semibold">Bus Number:</span> {booking.bus_no || "-"}</p>
            <p><span className="font-semibold">Seat Number:</span> {booking.seat_no || "-"}</p>
            <p><span className="font-semibold">Payment Status:</span> {booking.payment_status || "not_paid"}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
