import React from "react";

export default function SeniorPaymentPending({ setStudent }) {
  const handlePay = () => {
    setStudent((prev) => ({ ...prev, paymentStatus: "Active" }));
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
      <p className="text-yellow-800 font-semibold">
        Complete payment to activate transport
      </p>
      <button
        onClick={handlePay}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Pay Now
      </button>
    </div>
  );
}
