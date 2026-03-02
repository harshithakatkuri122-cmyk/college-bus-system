import { useState, useEffect } from "react";
import SeniorLayout from "./senior/SeniorLayout";
import SeniorTransportDetails from "./senior/SeniorTransportDetails";
import SeniorRenewalOptions from "./senior/SeniorRenewalOptions";
import SeniorBusPass from "./senior/SeniorBusPass";
import SeniorComplaint from "./senior/SeniorComplaint";
import SeniorChangeBus from "./senior/SeniorChangeBus";
import SeniorNotices from "./senior/SeniorNotices";

export default function SeniorDashboard() {
  const [activeSection, setActiveSection] = useState("details");
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const s = {
      name: "Harshitha Reddy",
      rollNo: "22CSE101",
      paymentStatus: "Active", // Changed to 'Active' to enable bus pass preview
      route: "KPHB - College",
      busNo: "Bus 12",
      seatNo: "15A",
    };
    setTimeout(() => {
      setStudent(s);
      console.log("Demo student data loaded:", s);
    }, 300);
  }, []);

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
    <SeniorLayout
      student={student}
      active={activeSection}
      onSelect={setActiveSection}
    >
    <div className="space-y-6">

      {activeSection === "details" && (
        <h1 className="text-2xl font-bold text-green-700">
          Transport Details
        </h1>
      )}

      {activeSection === "renew" && (
        <h1 className="text-2xl font-bold text-green-700">
          Renewal Options
        </h1>
      )}

      {activeSection === "pass" && (
        <h1 className="text-2xl font-bold text-green-700">
          Bus Pass
        </h1>
      )}

      {activeSection === "complaint" && (
        <h1 className="text-2xl font-bold text-green-700">
          Raise Complaint
        </h1>
      )}

      {(activeSection === "changeBus" || activeSection === "change") && (
        <h1 className="text-2xl font-bold text-green-700">
          Change Bus
        </h1>
      )}

      {activeSection === "notices" && (
        <h1 className="text-2xl font-bold text-green-700">
          Notices
        </h1>
      )}

      {content()}
    </div>
  </SeniorLayout>
);
}
