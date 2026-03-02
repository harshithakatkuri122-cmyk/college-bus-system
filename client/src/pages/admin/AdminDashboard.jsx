import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardOverview from "./DashboardOverview";
import RouteForm from "./RouteForm";
import RouteTable from "./RouteTable";
import StudentTable from "./StudentTable";
import InchargeManagement from "./InchargeManagement";
import TransactionTable from "./TransactionTable";
import NoticeForm from "./NoticeForm";
import ReportsSection from "./ReportsSection";
import AcademicControl from "./AcademicControl";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  // dummy / mock state
  const [routes, setRoutes] = useState([
    {
      id: 1,
      routeName: "KPHB - College",
      busNumber: "Bus 5",
      capacity: 50,
      bookedSeats: 30,
      status: "Open",
      stops: [
        { stopName: "KPHB", pickupTime: "08:00" },
        { stopName: "College", pickupTime: "09:00" },
      ],
    },
    {
      id: 2,
      routeName: "Miyapur - College",
      busNumber: "Bus 12",
      capacity: 40,
      bookedSeats: 35,
      status: "Closed",
      stops: [
        { stopName: "Miyapur", pickupTime: "07:30" },
        { stopName: "College", pickupTime: "08:30" },
      ],
    },
  ]);

  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Alice Kumar",
      rollNo: "22CSE101",
      route: "KPHB - College",
      busNo: "Bus 5",
      paymentStatus: "Active",
      contact: "9876501234",
    },
    {
      id: 2,
      name: "Bob Sharma",
      rollNo: "22CSE102",
      route: "Miyapur - College",
      busNo: "Bus 12",
      paymentStatus: "Pending",
      contact: "9876505678",
    },
  ]);

  const [incharges, setIncharges] = useState([
    { id: 1, name: "Mr. Rao", contact: "9000000001", route: "KPHB - College" },
    { id: 2, name: "Ms. Meena", contact: "9000000002", route: "" },
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      studentName: "Alice Kumar",
      route: "KPHB - College",
      amount: 500,
      date: "2025-01-15",
      status: "Success",
      txnId: "TXN001",
    },
    {
      id: 2,
      studentName: "Bob Sharma",
      route: "Miyapur - College",
      amount: 500,
      date: "2025-02-10",
      status: "Pending",
      txnId: "TXN002",
    },
  ]);

  const [notices, setNotices] = useState([]);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [globalBookingOpen, setGlobalBookingOpen] = useState(true);

  // route form helpers
  const [editingRoute, setEditingRoute] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);

  const addOrUpdateRoute = (route) => {
    setRoutes((prev) => {
      const exists = prev.find((r) => r.id === route.id);
      if (exists) {
        return prev.map((r) => (r.id === route.id ? route : r));
      }
      return [...prev, route];
    });
    setShowRouteForm(false);
  };

  const deleteRoute = (id) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const viewStops = (stops) => {
    alert(JSON.stringify(stops, null, 2));
  };

  const toggleRouteBooking = (id) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Open" ? "Closed" : "Open" }
          : r
      )
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <DashboardOverview
            routes={routes}
            students={students}
            transactions={transactions}
          />
        );
      case "routes":
        return (
          <>
            {showRouteForm ? (
              <RouteForm
                initialData={editingRoute}
                onSave={addOrUpdateRoute}
                onCancel={() => setShowRouteForm(false)}
              />
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingRoute(null);
                    setShowRouteForm(true);
                  }}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
                >
                  + Add Route
                </button>
                <RouteTable
                  routes={routes}
                  onEdit={(r) => {
                    setEditingRoute(r);
                    setShowRouteForm(true);
                  }}
                  onDelete={deleteRoute}
                  onToggleStatus={toggleRouteBooking}
                  onViewStops={viewStops}
                />
              </>
            )}
          </>
        );
      case "students":
        return <StudentTable students={students} />;
      case "incharges":
        return (
          <InchargeManagement
            incharges={incharges}
            routes={routes}
            setIncharges={setIncharges}
          />
        );
      case "transactions":
        return <TransactionTable transactions={transactions} />;
      case "notices":
        return <NoticeForm notices={notices} setNotices={setNotices} />;
      case "academic":
        return (
          <AcademicControl
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            globalBookingOpen={globalBookingOpen}
            setGlobalBookingOpen={setGlobalBookingOpen}
            routes={routes}
            toggleRouteBooking={toggleRouteBooking}
          />
        );
      case "reports":
        return (
          <ReportsSection
            routes={routes}
            students={students}
            transactions={transactions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <AdminSidebar active={activeSection} onSelect={setActiveSection} />
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        <main className="p-6 bg-gray-50 flex-1 overflow-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
