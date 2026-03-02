import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import SeniorSidebar from "./senior/SeniorSidebar";
import SeniorNavbar from "./senior/SeniorNavbar";
import SeniorTransportDetails from "./senior/SeniorTransportDetails";
import SeniorRenewalOptions from "./senior/SeniorRenewalOptions";
import SeniorBusPass from "./senior/SeniorBusPass";
import SeniorComplaint from "./senior/SeniorComplaint";
import SeniorChangeBus from "./senior/SeniorChangeBus";
import SeniorNotices from "./senior/SeniorNotices";

export default function SeniorDashboard() {
  const [activeSection, setActiveSection] = useState("details");
  const { student, setStudent } = useAuth();
  const [localStudent, setLocalStudent] = useState(student || null);

  useEffect(() => {
    setLocalStudent(student || null);
  }, [student]);

  const content = () => {
    if (!student) return <p>Loading transport data...</p>;
    switch (activeSection) {
      case "details":
        return <SeniorTransportDetails student={student} setStudent={setStudent} />;
      case "renew":
        return <SeniorRenewalOptions student={student} setStudent={setStudent} />;
      case "pass":
        return <SeniorBusPass student={student} />;
      case "complaint":
        return <SeniorComplaint student={student} />;
      case "changeBus":
        return <SeniorChangeBus student={student} setStudent={setStudent} />;
      case "notices":
        return <SeniorNotices student={student} />;
      default:
        return null;
    }
  }; // end of content()

  return (
    <StudentDashboard
      student={student}
      active={activeSection}
      onSelect={setActiveSection}
      Sidebar={SeniorSidebar}
      Navbar={SeniorNavbar}
    >
      <div className="space-y-6">

        {/* Feature cards removed — sidebar provides navigation */}

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
