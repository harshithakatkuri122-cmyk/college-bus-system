import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import InchargeLayout from "./InchargeLayout";
import InchargeDashboardPage from "./InchargeDashboardPage";
import InchargeStudents from "./InchargeStudents";
import InchargeNotices from "./InchargeNotices";

export default function InchargeDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [incharge, setIncharge] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadInchargeData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [meRes, studentsRes, noticesRes] = await Promise.all([
          fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          user?.id
            ? fetch(`/api/notices/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ ok: true, json: async () => [] }),
        ]);

        const meData = await meRes.json();
        const studentsData = await studentsRes.json();
        const noticesData = await noticesRes.json();

        if (!meRes.ok || !studentsRes.ok || !noticesRes.ok) {
          throw new Error("Failed to load incharge dashboard");
        }

        setIncharge({
          name: meData?.profile?.name || meData?.user?.college_id || "Incharge",
          route: meData?.profile?.route_name || "Not assigned",
          driver: meData?.profile?.driver_name || "Not assigned",
          students: Array.isArray(studentsData) ? studentsData : [],
          notices: Array.isArray(noticesData) ? noticesData : [],
        });
      } catch (error) {
        console.error(error);
        setIncharge({
          name: "Incharge",
          route: "Not assigned",
          driver: "Not assigned",
          students: [],
          notices: [],
        });
      }
    }

    loadInchargeData();
  }, [user?.id]);

  const content = () => {
    if (!incharge) return <p className="text-center py-8 text-gray-500">Loading incharge data...</p>;
    
    if (activeSection === "dashboard") return <InchargeDashboardPage incharge={incharge} />;
    if (activeSection === "students") return <InchargeStudents incharge={incharge} />;
    if (activeSection === "notices") return <InchargeNotices incharge={incharge} />;
    return null;
  };

  return (
    <InchargeLayout
      incharge={incharge}
      active={activeSection}
      onSelect={setActiveSection}
    >
      <div className="space-y-6">
        {content()}
      </div>
    </InchargeLayout>
  );
}
