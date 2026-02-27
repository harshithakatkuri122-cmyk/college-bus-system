import React from "react";

export default function SeniorBusPass({ student }) {
  if (!student || student.paymentStatus !== "Active") return null;

  const {
    name,
    rollNo,
    busNo,
    route,
    seatNo,
  } = student;

  return (
    <div className="mt-6 printable">
      <div className="mx-auto shadow-lg rounded-lg overflow-hidden" style={{ width: "85.6mm", height: "54mm", borderRadius: 12 }}>
        <div className="bg-green-700 p-2 text-white flex items-center justify-between">
          <div className="w-16 h-12 bg-gray-300 flex items-center justify-center rounded">Logo</div>
          <div className="text-center font-bold">College Transport Bus Pass</div>
          <div className="w-16 h-12 bg-gray-300 flex items-center justify-center rounded">Photo</div>
        </div>
        <div className="p-4 text-gray-800 h-[calc(54mm-48px)] flex flex-col justify-between">
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Name:</span> {name}</p>
            <p><span className="font-semibold">Roll No:</span> {rollNo}</p>
            <p><span className="font-semibold">Bus No:</span> {busNo}</p>
            <p><span className="font-semibold">Route:</span> {route}</p>
            <p><span className="font-semibold">Pickup:</span> {route.split(" - ")[0]}</p>
            <p><span className="font-semibold">Seat No:</span> {seatNo}</p>
            <p><span className="font-semibold">Valid Till:</span> 31 Dec 2026</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="w-20 h-20 bg-gray-300 flex items-center justify-center">QR</div>
            <div className="text-xs text-gray-600">Authorized Signature</div>
          </div>
        </div>
      </div>

      <button onClick={() => window.print()} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Download / Print</button>

      <style>{`@media print {
          @page { size: 85.6mm 54mm; margin: 0; }
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; }
        }`}</style>
    </div>
  );
}
