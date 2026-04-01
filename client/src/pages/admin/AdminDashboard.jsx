import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminTopBar from "./AdminTopBar";
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

  const [routes, setRoutes] = useState([]);

  const [students, setStudents] = useState([]);

  const [incharges, setIncharges] = useState([]);

  const [transactions, setTransactions] = useState([]);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [globalBookingOpen, setGlobalBookingOpen] = useState(true);

  // route form helpers
  const [editingRoute, setEditingRoute] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);

  async function loadIncharges(token) {
    try {
      const res = await fetch("/api/incharges", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load incharges");
      }

      const normalized = (Array.isArray(data) ? data : []).map((item, index) => ({
        id: Number(item.id ?? item.user_id ?? index + 1),
        user_id: Number(item.user_id ?? item.id ?? 0),
        name: String(item.name || item.full_name || "").trim(),
        designation: String(item.designation || "Bus Incharge").trim(),
        route_id: item.route_id == null ? null : Number(item.route_id),
        route_name: item.route_name || null,
      }));

      setIncharges(normalized);
    } catch (error) {
      console.error(error);
      setIncharges([]);
    }
  }

  async function loadTransactions(token) {
    try {
      const res = await fetch("/api/transactions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      const mappedTransactions = (Array.isArray(data) ? data : []).map((transaction) => ({
        id: transaction.id,
        studentName: transaction.student_name || transaction.student || `Student ${transaction.student_id || "-"}`,
        route: transaction.route_name || "Not Assigned",
        amount: Number(transaction.amount || 0),
        date: transaction.date || (transaction.created_at ? String(transaction.created_at).slice(0, 10) : "-"),
        status: transaction.status || "Pending",
        txnId: transaction.txn_ref || transaction.txn_id || `TXN-${transaction.id}`,
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error(error);
      setTransactions([]);
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      const token = localStorage.getItem("token");

      try {
        const [routesRes, busesRes, studentsRes] = await Promise.allSettled([
          fetch("/api/routes"),
          fetch("/api/buses"),
          fetch("/api/students", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const routesData =
          routesRes.status === "fulfilled" && routesRes.value.ok
            ? await routesRes.value.json()
            : [];
        const busesData =
          busesRes.status === "fulfilled" && busesRes.value.ok
            ? await busesRes.value.json()
            : [];
        const studentsData =
          studentsRes.status === "fulfilled" && studentsRes.value.ok
            ? await studentsRes.value.json()
            : [];
        const studentsList = Array.isArray(studentsData) ? studentsData : [];
        const buses = Array.isArray(busesData) ? busesData : [];
        const mappedRoutes = (Array.isArray(routesData) ? routesData : []).map((route) => {
          const bus = buses.find((item) => Number(item.route_no) === Number(route.route_no));
          const viaStops = String(route.via || "")
            .split(/->|→/)
            .map((stop) => stop.trim())
            .filter(Boolean)
            .map((stopName, index) => ({
              stopName,
              pickupTime: `Stop ${index + 1}`,
            }));

          const capacity = Number(bus?.total_seats) || 40;
          const bookedSeats = studentsList.filter((student) => Number(student.route_no) === Number(route.route_no) && student.seat_no).length;

          return {
            id: Number(route.route_no),
            routeNo: Number(route.route_no),
            routeName: route.route_name,
            busNumber: bus?.bus_no ? String(bus.bus_no) : "Not assigned",
            capacity,
            bookedSeats,
            status: "Open",
            stops: viaStops,
          };
        });

        setRoutes(mappedRoutes);
        setStudents(studentsList);
        await Promise.all([loadIncharges(token), loadTransactions(token)]);
      } catch (error) {
        console.error(error);
      }
    }

    loadDashboardData();
  }, []);

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
    alert(`Stops:\n${stops.map((s) => `${s.stopName} @ ${s.pickupTime}`).join("\n")}`);
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
        return {
          title: "Dashboard Overview",
          content: (
            <DashboardOverview
              routes={routes}
              students={students}
              transactions={transactions}
            />
          ),
        };
      case "routes":
        return {
          title: "Manage Routes",
          content: (
            <>
              {showRouteForm ? (
                <RouteForm
                  initialData={editingRoute}
                  onSave={addOrUpdateRoute}
                  onCancel={() => setShowRouteForm(false)}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Route Management</h2>
                      <p className="text-sm text-gray-500 mt-1">Create and manage all bus routes</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingRoute(null);
                        setShowRouteForm(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <i className="fas fa-plus mr-2"></i> Add Route
                    </button>
                  </div>
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
          ),
        };
      case "students":
        return {
          title: "Student Management",
          content: <StudentTable students={students} routes={routes} />,
        };
      case "incharges":
        return {
          title: "Bus Incharge Management",
          content: (
            <InchargeManagement
              incharges={incharges}
              routes={routes}
              refreshIncharges={() => loadIncharges(localStorage.getItem("token"))}
            />
          ),
        };
      case "transactions":
        return {
          title: "Transactions",
          content: <TransactionTable transactions={transactions} />,
        };
      case "notices":
        return {
          title: "Notices",
          content: <NoticeForm />,
        };
      case "academic":
        return {
          title: "Academic Year & Booking",
          content: (
            <AcademicControl
              academicYear={academicYear}
              setAcademicYear={setAcademicYear}
              globalBookingOpen={globalBookingOpen}
              setGlobalBookingOpen={setGlobalBookingOpen}
              routes={routes}
              toggleRouteBooking={toggleRouteBooking}
            />
          ),
        };
      case "reports":
        return {
          title: "Reports & Analytics",
          content: (
            <ReportsSection
              routes={routes}
              students={students}
              transactions={transactions}
            />
          ),
        };
      default:
        return { title: "", content: null };
    }
  };

  const { title, content } = renderSection();

  return (
    <div className="flex min-h-screen">
      {/* fixed stripe at top for admin pages */}
      <div className="fixed top-0 left-0 w-full h-12 bg-green-700 border-b-4 border-amber-900 z-40" />
      <AdminSidebar active={activeSection} onSelect={setActiveSection} />
      <div className="flex-1 flex flex-col">
        {activeSection === "overview" && <AdminHeader />}
        {activeSection !== "overview" && <AdminTopBar />}
        <main className="pl-64 px-8 py-6 bg-gray-50 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeSection === "overview" && title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track your transportation system</p>
              </div>
            )}
            {activeSection !== "overview" && title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your transportation system</p>
              </div>
            )}
            <div className={activeSection !== "overview" ? "border border-gray-300 border-opacity-40 rounded-xl p-6 bg-white shadow-sm" : ""}>
              {content}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
