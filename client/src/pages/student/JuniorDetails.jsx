import React from "react";
import { useNavigate } from "react-router-dom";
import SeniorTransportDetails from "./senior/SeniorTransportDetails";
import { useAuth } from "../../context/AuthContext";

export default function JuniorDetails() {
  const navigate = useNavigate();
  const { student, setStudent } = useAuth();

  if (!student) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">Loading student data...</p>
      </div>
    );
  }

  const canView = student.hasBookedBus && student.hasPaidFees;

  if (!canView) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Transport Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please book a bus and complete payment to view transport details.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/student/junior/book')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Book a Bus
          </button>
        </div>
      </div>
    );
  }

  // Reuse senior transport details UI
  return <SeniorTransportDetails student={student} setStudent={setStudent} />;
}
