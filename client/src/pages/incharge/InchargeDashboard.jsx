import { useState, useEffect } from "react";
import InchargeLayout from "./InchargeLayout";
import InchargeDashboardPage from "./InchargeDashboardPage";
import InchargeStudents from "./InchargeStudents";
import InchargeAttendance from "./InchargeAttendance";
import InchargeNotices from "./InchargeNotices";

// Mock student data
const mockStudents = [
  {
    id: 1,
    name: "Akshay Kumar",
    collegeId: "22CSE001",
    contact: "9876543210",
    emergency: "9876543211",
    department: "CSE",
    year: "III Year",
    presentToday: true
  },
  {
    id: 2,
    name: "Priya Sharma",
    collegeId: "22CSE002",
    contact: "8765432109",
    emergency: "8765432108",
    department: "CSE",
    year: "III Year",
    presentToday: false
  },
  {
    id: 3,
    name: "Rajesh Singh",
    collegeId: "22ECE101",
    contact: "9123456789",
    emergency: "9123456788",
    department: "ECE",
    year: "II Year",
    presentToday: true
  },
  {
    id: 4,
    name: "Neha Patel",
    collegeId: "22CSE003",
    contact: "8234567890",
    emergency: "8234567891",
    department: "CSE",
    year: "IV Year",
    presentToday: true
  },
  {
    id: 5,
    name: "Arjun Reddy",
    collegeId: "22ECE102",
    contact: "9456789012",
    emergency: "9456789011",
    department: "ECE",
    year: "III Year",
    presentToday: false
  },
  {
    id: 6,
    name: "Divya Menon",
    collegeId: "22IT101",
    contact: "8567890123",
    emergency: "8567890122",
    department: "IT",
    year: "II Year",
    presentToday: true
  },
  {
    id: 7,
    name: "Karan Verma",
    collegeId: "22CSE004",
    contact: "9234567890",
    emergency: "9234567889",
    department: "CSE",
    year: "I Year",
    presentToday: false
  },
  {
    id: 8,
    name: "Sneha Gupta",
    collegeId: "22ECE103",
    contact: "8123456789",
    emergency: "8123456788",
    department: "ECE",
    year: "I Year",
    presentToday: true
  },
  {
    id: 9,
    name: "Ravi Kumar",
    collegeId: "22IT102",
    contact: "9567890123",
    emergency: "9567890122",
    department: "IT",
    year: "IV Year",
    presentToday: true
  },
  {
    id: 10,
    name: "Isha Dixit",
    collegeId: "22CSE005",
    contact: "8678901234",
    emergency: "8678901233",
    department: "CSE",
    year: "II Year",
    presentToday: false
  },
  {
    id: 11,
    name: "Vikram Singh",
    collegeId: "22ECE104",
    contact: "9789012345",
    emergency: "9789012344",
    department: "ECE",
    year: "III Year",
    presentToday: true
  },
  {
    id: 12,
    name: "Pooja Sharma",
    collegeId: "22IT103",
    contact: "8890123456",
    emergency: "8890123455",
    department: "IT",
    year: "I Year",
    presentToday: false
  },
];

// Mock incharge data
const mockIncharge = {
  id: "INC001",
  name: "Ramesh Kumar",
  busNo: "Bus 7",
  route: "Madhapur - KPHB - College",
  driver: "Mohammad Ali",
  status: "On Time",
  students: mockStudents,
  busNumber: "HK 09 AB 7777",
  contactNumber: "9876543200"
};

export default function InchargeDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [incharge, setIncharge] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setIncharge(mockIncharge), 300);
  }, []);

  const content = () => {
    if (!incharge) return <p className="text-center py-8 text-gray-500">Loading incharge data...</p>;
    
    if (activeSection === "dashboard") return <InchargeDashboardPage incharge={incharge} onAttendanceClick={() => setActiveSection("attendance")} />;
    if (activeSection === "students") return <InchargeStudents incharge={incharge} />;
    if (activeSection === "attendance") return <InchargeAttendance incharge={incharge} />;
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
