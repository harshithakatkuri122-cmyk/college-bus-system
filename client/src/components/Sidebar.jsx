import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = {
  "student-junior": [
    { label: "Book Bus", to: "/student/junior/book", icon: "fas fa-chair" },
    { label: "Change Bus", to: "/student/junior/change", icon: "fas fa-exchange-alt" },
    { label: "View / Download Bus Pass", to: "/student/junior/pass", icon: "fas fa-id-badge" },
    { label: "Raise Complaint", to: "/student/junior/complaint", icon: "fas fa-comment-dots" },
    { label: "View Bus Timetable", to: "/student/junior/timetable", icon: "fas fa-clock" },
  ],
  "student-senior": [
    { label: "Renewal", to: "/student/senior/renewal", icon: "fas fa-redo" },
    { label: "Change Bus", to: "/student/senior/change", icon: "fas fa-exchange-alt" },
    { label: "View / Download Bus Pass", to: "/student/senior/pass", icon: "fas fa-id-badge" },
    { label: "Raise Complaint", to: "/student/senior/complaint", icon: "fas fa-comment-dots" },
    { label: "View Bus Timetable", to: "/student/senior/timetable", icon: "fas fa-clock" },
  ],
  faculty: [
    { label: "View Bus Pass", to: "/faculty/pass", icon: "fas fa-id-card" },
    { label: "Raise Complaint", to: "/faculty/complaint", icon: "fas fa-comment-dots" },
    { label: "View Bus Timetable", to: "/faculty/timetable", icon: "fas fa-clock" },
  ],
  "bus-incharge": [
    { label: "Assigned Bus Details", to: "/incharge/assigned", icon: "fas fa-bus" },
    { label: "Student List", to: "/incharge/students", icon: "fas fa-users" },
    { label: "Bus Timetable", to: "/incharge/timetable", icon: "fas fa-clock" },
  ],
  "transport-admin": [
    { label: "Manage Routes", to: "/admin/routes", icon: "fas fa-route" },
    { label: "Switch Academic Year", to: "/admin/year", icon: "fas fa-calendar-alt" },
    { label: "Assign Bus Incharges", to: "/admin/assign", icon: "fas fa-user-tag" },
    { label: "View Students", to: "/admin/students", icon: "fas fa-users" },
    { label: "Manage Complaints", to: "/admin/complaints", icon: "fas fa-exclamation-circle" },
  ],
};

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const items = menuItems[role] || [];

  return (
    <aside className="w-64 bg-white shadow-lg border-r">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-green-700">Dashboard</h2>
      </div>
      <nav className="flex flex-col space-y-1 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors duration-200 $`
                + (isActive ? "bg-green-200 font-semibold" : "text-gray-700")
            }
          >
            <i className={`${item.icon} w-5`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <button
          onClick={logout}
          className="w-full text-left text-red-600 hover:text-red-800"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      </div>
    </aside>
  );
}
