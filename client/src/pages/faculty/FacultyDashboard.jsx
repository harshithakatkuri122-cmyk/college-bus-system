import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentDashboard from "../student/StudentDashboard";
import SeniorSidebar from "../student/senior/SeniorSidebar";
import SeniorNavbar from "../student/senior/SeniorNavbar";
import SeniorTransportDetails from "../student/senior/SeniorTransportDetails";
import SeniorRenewalOptions from "../student/senior/SeniorRenewalOptions";
import SeniorBusPass from "../student/senior/SeniorBusPass";
import SeniorComplaint from "../student/senior/SeniorComplaint";
import SeniorChangeBus from "../student/senior/SeniorChangeBus";
import SeniorNotices from "../student/senior/SeniorNotices";

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState("details");
  const { faculty, setFaculty } = useAuth();
  const [localFaculty, setLocalFaculty] = useState(faculty || null);
  const location = useLocation();

  useEffect(() => {
    setLocalFaculty(faculty || null);
  }, [faculty]);

  // update section when URL changes (support generic sidebar links)
  useEffect(() => {
    const parts = location.pathname.split("/");
    const sec = parts[2] || ""; // e.g. "faculty/details"
    let mapped = sec;
    if (sec === "change") mapped = "changeBus";
    if (["details", "renew", "pass", "complaint", "changeBus", "notices"].includes(mapped)) {
      setActiveSection(mapped);
    }
  }, [location.pathname]);

  const content = () => {
    if (!faculty) return <p>Loading transport data...</p>;
    switch (activeSection) {
      case "details":
        return <SeniorTransportDetails student={faculty} setStudent={setFaculty} />;
      case "renew":
        return <SeniorRenewalOptions student={faculty} setStudent={setFaculty} />;
      case "pass":
        return <SeniorBusPass student={faculty} />;
      case "complaint":
        return <SeniorComplaint student={faculty} />;
      case "changeBus":
        return <SeniorChangeBus student={faculty} setStudent={setFaculty} />;
      case "notices":
        return <SeniorNotices student={faculty} />;
      default:
        return null;
    }
  };

  return (
    <StudentDashboard
      student={faculty}
      active={activeSection}
      onSelect={setActiveSection}
      Sidebar={SeniorSidebar}
      Navbar={SeniorNavbar}
    >
      <div className="space-y-6">
        {activeSection === "details" && (
          <h1 className="text-2xl font-bold text-green-700">Transport Details</h1>
        )}
        {activeSection === "renew" && (
          <h1 className="text-2xl font-bold text-green-700">Renewal Options</h1>
        )}
        {activeSection === "pass" && (
          <h1 className="text-2xl font-bold text-green-700">Bus Pass</h1>
        )}
        {activeSection === "complaint" && (
          <h1 className="text-2xl font-bold text-green-700">Raise Complaint</h1>
        )}
        {(activeSection === "changeBus" || activeSection === "change") && (
          <h1 className="text-2xl font-bold text-green-700">Change Bus</h1>
        )}
        {activeSection === "notices" && (
          <h1 className="text-2xl font-bold text-green-700">Notices</h1>
        )}

        {content()}
      </div>
    </StudentDashboard>
  );
}
