import { useState, useEffect } from "react";
import SeniorLayout from "./senior/SeniorLayout";
import SeniorTransportDetails from "./senior/SeniorTransportDetails";
import SeniorRenewalOptions from "./senior/SeniorRenewalOptions";
import SeniorBusPass from "./senior/SeniorBusPass";
import SeniorComplaint from "./senior/SeniorComplaint";

export default function SeniorDashboard() {
  const [activeSection, setActiveSection] = useState("details");
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const s = {
      name: "Harshitha Reddy",
      rollNo: "22CSE101",
      paymentStatus: "Pending",
      route: "KPHB - College",
      busNo: "Bus 12",
      seatNo: "15A",
    };
    setTimeout(() => setStudent(s), 300);
  }, []);

  const content = () => {
    if (!student) return <p>Loading transport data...</p>;
    if (activeSection === "details") return <SeniorTransportDetails student={student} setStudent={setStudent} />;
    if (activeSection === "renew") return <SeniorRenewalOptions student={student} setStudent={setStudent} />;
    if (activeSection === "pass") return <SeniorBusPass student={student} />;
    if (activeSection === "complaint") return <SeniorComplaint student={student} />;
    return null;
  };

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

      {content()}
    </div>
  </SeniorLayout>
);
}
