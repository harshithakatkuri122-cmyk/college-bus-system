import React, { useState } from "react";

export default function PaymentSection({ onPaymentSuccess, onCancel, route, seat }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        <i className="fas fa-credit-card text-green-600 mr-3"></i>
        Complete Payment
      </h2>
      <p className="text-gray-600 mb-8">
        Finalize your bus pass subscription for the academic year
      </p>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 border-l-4 border-green-500">
        <h3 className="font-semibold text-gray-800 mb-4">Journey Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Route:</span>
            <span className="font-semibold text-gray-800">{route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seat:</span>
            <span className="font-semibold text-gray-800">{seat}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Validity:</span>
            <span className="font-semibold text-gray-800">12 Months</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Total Amount:</span>
            <span className="text-green-600">₹5,000</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span className="ml-3 flex items-center">
              <i className="fas fa-credit-card text-blue-600 mr-2"></i>
              Debit / Credit Card
            </span>
          </label>

          <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span className="ml-3 flex items-center">
              <i className="fas fa-mobile-alt text-violet-600 mr-2"></i>
              UPI Payment
            </span>
          </label>

          <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
            <input
              type="radio"
              name="payment"
              value="netbanking"
              checked={paymentMethod === "netbanking"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span className="ml-3 flex items-center">
              <i className="fas fa-bank text-indigo-600 mr-2"></i>
              Net Banking
            </span>
          </label>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded">
        <p className="text-sm text-yellow-800">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          <span className="font-semibold">Important:</span> Your bus pass will be activated immediately after successful payment. Keep your pass details safe for verification.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-lock mr-2"></i>
              Pay ₹5,000
            </>
          )}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Security Badge */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <i className="fas fa-shield-alt text-green-600 mr-2"></i>
        Secure Payment Gateway | All transactions are encrypted
      </div>
    </div>
  );
}
