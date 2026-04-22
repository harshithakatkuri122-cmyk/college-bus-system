import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAYMENT_ENDPOINT = "/api/student/payment";
const LEGACY_PAYMENT_ENDPOINT = "/api/student/pay";
const BOOKING_ENDPOINT = (bookingId) => `/api/student/booking/${bookingId}`;
const STATUS_ENDPOINT = "/api/student/my-status";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  async function resolveTransportDetailsPath(token) {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok || !data?.user || data.user.role !== "student") {
        return "/student/junior/details";
      }

      return Number(data?.profile?.year) === 1 ? "/student/junior/details" : "/student/senior";
    } catch {
      return "/student/junior/details";
    }
  }

  useEffect(() => {
    async function loadBooking() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again to continue.");
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
            throw new Error(statusData.message || "Unable to load booking");
          }

          setBooking({
            student_name: statusData.name,
            roll_no: statusData.roll_no,
            route_no: statusData.route_no,
            route_name: statusData.route_name,
            bus_no: statusData.bus_no,
            seat_no: statusData.seat_no,
            payment_status:
              String(statusData.payment_status || "").trim().toLowerCase() === "active"
                ? "paid"
                : "not_paid",
          });

          if (String(statusData.payment_status || "").trim().toLowerCase() === "active") {
            const detailsPath = await resolveTransportDetailsPath(token);
            navigate(detailsPath, { replace: true });
          }
          return;
        }

        const res = await fetch(BOOKING_ENDPOINT(bookingId), { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load booking");
        }

        setBooking(data);

        if (String(data.payment_status || "").toLowerCase() === "paid") {
          const detailsPath = await resolveTransportDetailsPath(token);
          navigate(detailsPath, { replace: true });
        }
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.message || "Unable to load booking");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId, navigate]);

  async function handlePayNow() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again to continue payment.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const payload = bookingId ? { booking_id: Number(bookingId) } : {};

      let res = await fetch(PAYMENT_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      let data = await res.json();

      const looksLikeMissingEndpoint =
        res.status === 404 && String(data?.message || "").trim().toLowerCase() === "route not found";

      if (looksLikeMissingEndpoint) {
        res = await fetch(LEGACY_PAYMENT_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      window.dispatchEvent(new Event("student-status-refresh"));
      const detailsPath = await resolveTransportDetailsPath(token);
      navigate(detailsPath, { replace: true });
    } catch (payError) {
      console.error(payError);
      setError(payError.message || "Unable to complete payment");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border-t-4 border-emerald-500 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete payment to activate your bus pass.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {booking && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">Student:</span> {booking.student_name || booking.roll_no || "-"}</p>
            <p><span className="font-semibold">Route:</span> {booking.route_no} - {booking.route_name || "-"}</p>
            <p><span className="font-semibold">Bus Number:</span> {booking.bus_no || "-"}</p>
            <p><span className="font-semibold">Seat Number:</span> {booking.seat_no || "-"}</p>
            <p><span className="font-semibold">Payment Status:</span> {booking.payment_status || "not_paid"}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handlePayNow}
          disabled={paying}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {paying ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
