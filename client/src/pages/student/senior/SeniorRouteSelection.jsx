import React from "react";
import RouteSelection from "./RouteSelection";

export default function SeniorRouteSelection({ student, onSelect, onCancel }) {
  return <RouteSelection student={student} onSelect={onSelect} onCancel={onCancel} />;
}
