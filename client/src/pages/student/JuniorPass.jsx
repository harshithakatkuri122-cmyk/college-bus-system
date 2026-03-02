import React from "react";
import SeniorBusPass from "./senior/SeniorBusPass";
import { useAuth } from "../../context/AuthContext";

export default function JuniorPass() {
  const { student } = useAuth();

  if (!student) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold">No booking found</h3>
        <p className="text-sm text-gray-600">Please book a bus first to get a bus pass.</p>
      </div>
    );
  }

  return <SeniorBusPass student={student} />;
}
