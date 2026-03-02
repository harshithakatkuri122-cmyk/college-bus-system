import React from "react";
import { useAuth } from "../../context/AuthContext";
import SeniorNotices from "./senior/SeniorNotices";

export default function JuniorNotices() {
  const { student } = useAuth();
  return <SeniorNotices student={student} />;
}
