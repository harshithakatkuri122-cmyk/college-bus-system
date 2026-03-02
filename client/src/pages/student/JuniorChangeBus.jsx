import React from "react";
import { useAuth } from "../../context/AuthContext";
import SeniorChangeBus from "./senior/SeniorChangeBus";

export default function JuniorChangeBus() {
  const { student, setStudent } = useAuth();
  return <SeniorChangeBus student={student} setStudent={setStudent} />;
}
