import React from "react";
import cbitLogo from "../../../images/cbitlogo.png";
import { QRCodeSVG } from "qrcode.react";

export default function SeniorBusPass({ student }) {
  // always render something; differentiate loading vs payment warning
  if (!student) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-center text-gray-600">Loading bus pass information...</p>
      </div>
    );
  }

  if (student.paymentStatus !== "Active") {
    // Show payment warning prominently
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6 max-w-xl">
          <div className="flex gap-3">
            <i className="fas fa-exclamation-circle text-yellow-600 text-xl mt-1"></i>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Payment Required</h3>
              <p className="text-sm text-yellow-800">
                Complete payment to activate and download your bus pass. Your payment status must be "Active" to use the bus service.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                (current status: {student.paymentStatus})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { name, rollNo, busNo, route, seatNo, paymentStatus } = student;

  // QR code data containing student info
  const qrData = JSON.stringify({
    name: name,
    rollNo: rollNo,
    bus: busNo,
    route: route,
    seat: seatNo,
    validity: "2025-2026",
  });

  return (
    <div className="mt-10 flex flex-col items-center pb-20">
      <p className="text-xs text-gray-500 mb-2">Payment Status: {paymentStatus}</p>
      {/* Bus Pass Card - 85.6mm x 54mm */}
      <div
        className="printable relative bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{
          width: "85.6mm",
          height: "54mm",
          borderRadius: "8px",
        }}
      >
        {/* Top Green Stripe */}
        <div className="h-8 bg-gradient-to-r from-green-600 to-emerald-600"></div>

        {/* Small Brown Border Below Stripe */}
        <div className="h-1 bg-amber-900"></div>

        {/* Main Content Area */}
        <div className="flex-1 flex px-3 py-2 gap-2 bg-white">
          {/* Left Section: Logo + College Name */}
          <div className="flex flex-col items-center justify-center w-20 shrink-0">
            <img
              src={cbitLogo}
              alt="College Logo"
              className="w-12 h-12 object-contain mb-0.5"
            />
            <p className="text-[6px] font-bold text-gray-800 text-center leading-tight">
              CBIT
            </p>
          </div>

          {/* Middle Section: Student Details + Title */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[7px] font-bold text-green-700 text-center mb-0.5">
                COLLEGE TRANSPORT BUS PASS
              </p>
            </div>

            <div className="text-center space-y-0.5">
              <p className="text-[9px] font-bold text-gray-800 truncate">
                {name}
              </p>
              <p className="text-[7px] text-gray-600 font-mono">
                {rollNo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[6px] text-gray-700">
              <div>
                <span className="font-bold">Bus:</span> {busNo}
              </div>
              <div>
                <span className="font-bold">Seat:</span> {seatNo}
              </div>
              <div className="col-span-2">
                <span className="font-bold">Route:</span> {route}
              </div>
            </div>
          </div>

          {/* Right Section: QR Code */}
          <div className="w-16 h-full flex items-center justify-center bg-gray-50 rounded-sm border border-gray-200 shrink-0 p-1">
            <QRCodeSVG
              value={qrData}
              size={56}
              level="L"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="h-1 bg-amber-900"></div>
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-green-600"></div>
      </div>

      {/* Download / Print Button */}
      <button
        onClick={() => window.print()}
        className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-md"
      >
        <i className="fas fa-download"></i>
        Download / Print Bus Pass
      </button>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          .printable {
            position: fixed !important;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 1px solid #ddd;
            margin: 0;
            padding: 0;
          }

          @page {
            size: 85.6mm 54mm;
            margin: 0;
          }

          button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}