import React from "react";
import { useAuth } from "../../context/AuthContext";
import SeniorComplaint from "./senior/SeniorComplaint";

export default function JuniorComplaint() {
  const { student } = useAuth();
  return <SeniorComplaint student={student} />;
}
