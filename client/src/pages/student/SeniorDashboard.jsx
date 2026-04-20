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

  const content = () => {
    if (!student) return <p>Loading transport data...</p>;
    switch (activeSection) {
      case "details":
        return <SeniorTransportDetails student={student} setStudent={setStudent} />;
      case "renew":
        return (
          <SeniorRenewalOptions
            student={student}
            setStudent={setStudent}
            onGoToChangeBus={() => setActiveSection("changeBus")}
          />
        );
      case "pass":
        return <SeniorBusPass student={student} setStudent={setStudent} />;
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
      Sidebar={(props) => (
        <SeniorSidebar
          {...props}
          hideRenew={Boolean(student?.has_renewed_current_year)}
        />
      )}
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
