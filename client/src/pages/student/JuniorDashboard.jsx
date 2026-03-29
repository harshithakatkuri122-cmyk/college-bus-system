import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import JuniorDetails from "./JuniorDetails";
import { useAuth } from "../../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import SeniorSidebar from "./senior/SeniorSidebar";
import SeniorNavbar from "./senior/SeniorNavbar";

export default function JuniorDashboard() {
  const [activeSection, setActiveSection] = useState("details");
  const [studentState, setStudentState] = useState(null);
  const navigate = useNavigate();

  const { student, setStudent } = useAuth();
  const location = useLocation();

  useEffect(() => {
    async function refreshStudentStatus() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/student/my-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) return;

        setStudent((prev) => ({
          ...(prev || {}),
          ...data,
          hasBookedBus: Boolean(data.bus_no),
          hasPaidFees: data.payment_status === "Active",
        }));
      } catch (error) {
        console.error(error);
      }
    }

    refreshStudentStatus();
  }, [setStudent]);

  useEffect(() => {
    // sync local view state with AuthContext student
    setStudentState(student || null);
  }, [student]);

  useEffect(() => {
    // keep activeSection in sync with the current route so direct navigations
    // (like navigate('/student/junior/book')) show the correct view
    const path = location.pathname || "";
    if (path.includes("/student/junior/book")) setActiveSection("book");
    else if (path.includes("/student/junior/details")) setActiveSection("details");
    else if (path.includes("/student/junior/change")) setActiveSection("changeBus");
    else if (path.includes("/student/junior/timetable")) setActiveSection("notices");
    else if (path.includes("/student/junior/pass")) setActiveSection("pass");
    else if (path.includes("/student/junior/complaint")) setActiveSection("complaint");
  }, [location]);

  const handleSelect = (key) => {
    setActiveSection(key);
    const map = {
      details: "/student/junior/details",
      changeBus: "/student/junior/change",
      notices: "/student/junior/timetable",
      pass: "/student/junior/pass",
      complaint: "/student/junior/complaint",
    };
    const to = map[key];
    if (to) navigate(to);
  };

  // no localStorage events — rely on AuthContext updates

  return (
    <StudentDashboard
      student={student}
      active={activeSection}
      onSelect={handleSelect}
      Sidebar={(props) => <SeniorSidebar {...props} hideRenew={true} />}
      Navbar={SeniorNavbar}
    >
      <div className="space-y-6">
        {/* Feature cards removed — sidebar provides navigation */}

        {/* show details inline so juniors see the message first (no immediate redirect to booking) */}
        {activeSection === "details" ? (
          <JuniorDetails />
        ) : (
          <Outlet context={{ student, setStudent }} />
        )}
      </div>
    </StudentDashboard>
  );
}
