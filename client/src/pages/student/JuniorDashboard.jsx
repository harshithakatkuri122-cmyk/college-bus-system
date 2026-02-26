import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function JuniorDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student-junior" />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Junior Student Dashboard
        </h1>
        {/* Nested routes will render here */}
        <Outlet />
      </main>
    </div>
  );
}
