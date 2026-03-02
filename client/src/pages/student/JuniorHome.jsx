import React from "react";
import { Navigate } from "react-router-dom";

export default function JuniorHome() {
  // Redirect junior index to booking page; sidebar provides navigation
  return <Navigate to="book" replace />;
}
