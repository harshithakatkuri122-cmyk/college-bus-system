import React from "react";
import SeniorPaymentPending from "./SeniorPaymentPending";
import SeniorBusPass from "./SeniorBusPass";

export default function SeniorTransportDetails({ student, setStudent }) {
  if (!student) return null;

  const {
    name,
    rollNo,
    paymentStatus,
    route,
    busNo,
    seatNo,
  } = student;

  return (
    <div className="space-y-6">
      {paymentStatus === "Active" ? (
        <>
          <p>
            <span className="font-semibold">Name:</span> {name}
          </p>
          <p>
            <span className="font-semibold">Roll No:</span> {rollNo}
          </p>
          <p>
            <span className="font-semibold">Route:</span> {route}
          </p>
          <p>
            <span className="font-semibold">Bus No:</span> {busNo}
          </p>
          <p>
            <span className="font-semibold">Seat No:</span> {seatNo}
          </p>
          <p>
            <span className="font-semibold">Driver Contact:</span> 999‑999‑9999
          </p>
          <SeniorBusPass student={student} />
        </>
      ) : (
        <SeniorPaymentPending setStudent={setStudent} />
      )}
    </div>
  );
}
