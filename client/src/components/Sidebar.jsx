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
    { label: "Transport Details", to: "/faculty/details", icon: "fas fa-info-circle" },
    { label: "Renew Bus", to: "/faculty/renew", icon: "fas fa-retweet" },
    { label: "Change Bus", to: "/faculty/change", icon: "fas fa-exchange-alt" },
    { label: "Download Bus Pass", to: "/faculty/pass", icon: "fas fa-id-card" },
    { label: "Raise Complaint", to: "/faculty/complaint", icon: "fas fa-comment-dots" },
    { label: "View Bus Timetable", to: "/faculty/timetable", icon: "fas fa-clock" },
    { label: "Notices", to: "/faculty/notices", icon: "fas fa-bell" },
  ],
  "bus-incharge": [
    { label: "Assigned Bus Details", to: "/incharge/assigned", icon: "fas fa-bus" },
    { label: "Student List", to: "/incharge/students", icon: "fas fa-users" },
    { label: "Bus Timetable", to: "/incharge/timetable", icon: "fas fa-clock" },
  ],
  "transport-admin": [
    { label: "Dashboard Overview", to: "/admin/overview", icon: "fas fa-tachometer-alt" },
    { label: "Manage Routes", to: "/admin/routes", icon: "fas fa-route" },
    { label: "Student Management", to: "/admin/students", icon: "fas fa-users" },
    { label: "Bus Incharge Management", to: "/admin/incharges", icon: "fas fa-user-tag" },
    { label: "Transactions", to: "/admin/transactions", icon: "fas fa-receipt" },
    { label: "Notices", to: "/admin/notices", icon: "fas fa-bell" },
    { label: "Academic Year & Booking", to: "/admin/academic", icon: "fas fa-calendar-alt" },
    { label: "Reports / Analytics", to: "/admin/reports", icon: "fas fa-chart-bar" },
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
