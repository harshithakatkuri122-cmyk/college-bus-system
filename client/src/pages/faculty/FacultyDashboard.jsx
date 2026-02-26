import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function FacultyDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="faculty" />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Faculty Dashboard
        </h1>
        <Outlet />
      </main>
    </div>
  );
}
