import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SeatLayout from "../../components/SeatLayout";
import { useAuth } from "../../context/AuthContext";

export default function BookBus() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState("Route A");
  const booked = [3, 5, 12, 15]; // mock data
  const navigate = useNavigate();
  const { student: ctxStudent, setStudent } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Bus</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Step 1: Select Route</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/2"
        >
          <option>Route A</option>
          <option>Route B</option>
          <option>Route C</option>
        </select>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Step 2: Choose Seat</h3>
        {selectedSeat && (
          <p className="text-green-700 font-semibold">
            Selected seat: {selectedSeat}
          </p>
        )}
        <div className="my-4">
          <SeatLayout
            rows={10}
            cols={4}
            bookedSeats={booked}
            onSelectionChange={setSelectedSeat}
          />
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-green-400 inline-block rounded-sm border"></span>
            <span className="text-sm">Available</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-red-500 inline-block rounded-sm border"></span>
            <span className="text-sm">Booked</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-yellow-400 inline-block rounded-sm border"></span>
            <span className="text-sm">Selected</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-4 h-4 bg-gray-300 inline-block rounded-sm border"></span>
            <span className="text-sm">Disabled</span>
          </span>
        </div>
        <button
          disabled={!selectedSeat}
          onClick={() => setShowPaymentModal(true)}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
        >
          Continue to Payment
        </button>

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowPaymentModal(false)} />
            <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Mock Payment</h3>
              <p className="text-sm text-gray-600 mb-4">This is a mock payment flow for demo purposes. Confirm payment to complete booking and activate your bus pass.</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">{selectedRoute}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seat</p>
                  <p className="font-medium">{selectedSeat}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹500</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const studentData = {
                      name: (ctxStudent && ctxStudent.name) || "Demo Junior",
                      rollNo: (ctxStudent && ctxStudent.rollNo) || "23CSE201",
                      year: (ctxStudent && ctxStudent.year) || 1,
                      hasBookedBus: true,
                      hasPaidFees: true,
                      paymentStatus: "Active",
                      route: selectedRoute,
                      busNo: "Bus 7",
                      seatNo: selectedSeat,
                    };
                    setStudent(studentData);
                    setShowPaymentModal(false);
                    navigate("/student/junior/details");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
