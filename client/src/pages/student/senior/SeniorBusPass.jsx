import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../images/justlogo.jpg";

const PAY_ENDPOINT = "/api/student/pay";
const STATUS_ENDPOINT = "/api/student/my-status";

export default function SeniorBusPass({ student, setStudent }) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const name = student?.name || "-";
  const rollNo = student?.roll_no || student?.rollNo || "-";
  const busNo = student?.bus_no || student?.busNo;
  const seatNo = student?.seat_no || student?.seatNo;
  const route = student?.route || "-";
  const paymentStatus = student?.payment_status || student?.paymentStatus || "Inactive";
  const bookPath = Number(student?.year) === 1 ? "/student/junior/book" : "/student/senior";

  async function handlePayNow() {
    const token = localStorage.getItem("token");

    if (!token) {
      setPayError("Please login again to continue payment.");
      return;
    }

    try {
      setPaying(true);
      setPayError("");

      const payRes = await fetch(PAY_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.message || "Payment failed");
      }

      const statusRes = await fetch(STATUS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        throw new Error(statusData.message || "Failed to refresh status");
      }

      if (setStudent) {
        setStudent((prev) => ({
          ...(prev || {}),
          ...statusData,
          hasBookedBus: Boolean(statusData.bus_no),
          hasPaidFees: statusData.payment_status === "Active",
        }));
      }

      window.dispatchEvent(new Event("student-status-refresh"));
    } catch (error) {
      console.error(error);
      setPayError(error.message || "Unable to complete payment");
    } finally {
      setPaying(false);
    }
  }

  try {
    if (!student) {
      return (
        <div className="flex items-center justify-center min-h-80">
          <div className="text-center">
            <div className="inline-block">
              <i className="fas fa-spinner fa-spin text-emerald-700 text-4xl mb-4"></i>
            </div>
            <p className="text-gray-600 font-medium">Loading bus pass information...</p>
          </div>
        </div>
      );
    }

    if (!busNo || !seatNo) {
      return (
        <div className="flex items-center justify-center min-h-80">
          <div className="w-full max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-blue-100 rounded-full">
                  <i className="fas fa-bus text-blue-700 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Book Bus</h3>
                <p className="text-sm text-blue-800 mb-5">
                  No seat is assigned yet. Book your bus seat to continue.
                </p>
                <button
                  onClick={() => navigate(bookPath)}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
                >
                  Book Bus
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentStatus === "Pending") {
      return (
        <div className="flex items-center justify-center min-h-80">
          <div className="w-full max-w-md">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-amber-100 rounded-full">
                  <i className="fas fa-exclamation-circle text-amber-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Payment Required</h3>
                <p className="text-sm text-amber-800 mb-1">
                  Your seat is booked. Complete payment to activate your bus pass.
                </p>
                <p className="text-xs text-amber-700 font-mono mt-3">
                  Current Status: <span className="font-semibold">{paymentStatus}</span>
                </p>
                {payError && <p className="text-sm text-red-600 mt-3">{payError}</p>}
                <button
                  onClick={handlePayNow}
                  disabled={paying}
                  className="mt-5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-60"
                >
                  {paying ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentStatus !== "Active") {
      return (
        <div className="flex items-center justify-center min-h-80">
          <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bus Pass Unavailable</h3>
            <p className="text-sm text-gray-700">Current status: {paymentStatus}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-12 px-4">
        {/* Smart Card - Horizontal Rectangle */}
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-emerald-700 px-8 py-5 flex items-center justify-between">
              {/* Left: Logo */}
              <img
                src={logo}
                alt="CBIT Logo"
                className="h-20 w-20 object-contain"
              />
              
              {/* Center: Authority Name */}
              <div className="text-center flex-1">
                <h3 className="text-xs font-bold tracking-widest uppercase text-white opacity-90 mb-0.5">
                  CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY
                </h3>
                <h2 className="text-base font-bold tracking-wide uppercase text-white">
                  Student Bus Pass
                </h2>
              </div>

              {/* Right: Status Badge */}
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-xs font-semibold text-white">{paymentStatus}</span>
              </div>
            </div>

            {/* Main Content - 3 Column Grid */}
            <div className="grid grid-cols-3 gap-6 p-8">
              {/* Left Column: Student Photo & Name */}
              <div className="flex flex-col items-center">
                {/* Student Photo Placeholder */}
                <div className="mb-4 h-32 w-28 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                  <i className="fas fa-user text-4xl text-gray-400"></i>
                </div>
                
                {/* Student Name */}
                <h3 className="text-center font-bold text-lg text-gray-900 leading-tight">
                  {name}
                </h3>
              </div>

              {/* Center Column: Details */}
              <div className="space-y-4">
                {/* Roll Number */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Roll Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900 font-mono tracking-wide">
                    {rollNo}
                  </p>
                </div>

                {/* Bus Number */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Bus Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {busNo}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Seat Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {seatNo}
                  </p>
                </div>

                {/* Route */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Route
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {route}
                  </p>
                </div>

                {/* Validity */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Validity
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    2025 - 2026
                  </p>
                </div>
              </div>

              {/* Right Column: QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 h-28 w-28 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-qrcode text-4xl text-gray-300 mb-1 block"></i>
                    <p className="text-[11px] text-gray-400 font-medium">QR Code</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 font-medium">
                  Scan for Verification
                </p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="border-t border-gray-200 px-8 py-4 flex items-center justify-between">
              {/* Left: Issue Date */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Issue Date
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString("en-IN", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  })}
                </p>
              </div>

              {/* Center: Divider */}
              <div className="flex-1"></div>

              {/* Right: Authorized Signatory */}
              <div className="text-right">
                <div className="h-12 w-20 bg-gray-100 border border-gray-300 rounded mb-2 flex items-center justify-center">
                  <i className="fas fa-pen text-gray-300 text-xl"></i>
                </div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-4xl mt-8 flex gap-4">
          {/* Download Button */}
          <button
            onClick={() => window.print()}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-download"></i>
            <span>Download Pass</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-print"></i>
            <span>Print Pass</span>
          </button>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              background: white;
              margin: 0;
              padding: 0;
            }

            .no-print,
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error("Error rendering SeniorBusPass:", error);
    return (
      <div className="flex items-center justify-center min-h-80">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-red-100 rounded-full">
                <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Bus Pass</h3>
              <p className="text-sm text-red-800">
                There was an issue loading your bus pass. Please refresh the page and try again.
              </p>
              {process.env.NODE_ENV === "development" && (
                <p className="mt-4 text-xs text-red-600 font-mono bg-red-100 rounded p-2 w-full overflow-auto">
                  {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}