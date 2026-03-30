import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function downloadDataUrl(url, filename) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("assign");
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rollNo, setRollNo] = useState("");
  const [busNo, setBusNo] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeTargetType, setNoticeTargetType] = useState("all");
  const [noticeRouteNo, setNoticeRouteNo] = useState("");

  const token = localStorage.getItem("token");

  async function loadDashboardData() {
    if (!token || !user?.id) return;

    try {
      setLoading(true);

      const [studentsRes, busesRes, routesRes, noticesRes] = await Promise.all([
        fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/buses"),
        fetch("/api/routes"),
        fetch(`/api/notices/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [studentsData, busesData, routesData, noticesData] = await Promise.all([
        studentsRes.json(),
        busesRes.json(),
        routesRes.json(),
        noticesRes.json(),
      ]);

      if (!studentsRes.ok || !busesRes.ok || !routesRes.ok || !noticesRes.ok) {
        throw new Error("Failed to load faculty dashboard data");
      }

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setBuses(Array.isArray(busesData) ? busesData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const routeMap = useMemo(() => {
    return new Map(routes.map((route) => [Number(route.route_no), route]));
  }, [routes]);

  async function assignSeat() {
    if (!token) {
      alert("Please login again");
      return;
    }

    if (!rollNo || !busNo || !seatNo) {
      alert("roll no, bus no and seat no are required");
      return;
    }

    try {
      const res = await fetch("/api/book-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roll_no: rollNo.trim(),
          bus_no: busNo.trim(),
          seat_no: Number(seatNo),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Seat assignment failed");
      }

      setBookingResult(data);
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to assign seat");
    }
  }

  async function sendNotice() {
    if (!token) {
      alert("Please login again");
      return;
    }

    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      alert("Notice title and message are required");
      return;
    }

    const payload = {
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      target_type: noticeTargetType,
      ...(noticeTargetType === "route" ? { route_no: Number(noticeRouteNo) } : {}),
    };

    try {
      const res = await fetch("/api/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send notice");
      }

      setNoticeTitle("");
      setNoticeMessage("");
      setNoticeRouteNo("");
      await loadDashboardData();
      alert("Notice sent successfully");
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to send notice");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 w-full h-12 bg-green-700 border-b-4 border-amber-900 z-40" />

      <aside className="fixed left-0 top-16 w-64 bg-slate-900 text-white shadow-xl flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="px-6 py-6 border-b border-slate-700">
          <h3 className="text-lg font-bold tracking-wide">Faculty Menu</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-3">
          <button onClick={() => setActiveSection("assign")} className={`w-full text-left px-4 py-3 rounded-lg ${activeSection === "assign" ? "bg-emerald-500" : "text-slate-300 hover:bg-slate-800"}`}>Assign Seats</button>
          <button onClick={() => setActiveSection("buses")} className={`w-full text-left px-4 py-3 rounded-lg ${activeSection === "buses" ? "bg-emerald-500" : "text-slate-300 hover:bg-slate-800"}`}>Manage Buses</button>
          <button onClick={() => setActiveSection("notices")} className={`w-full text-left px-4 py-3 rounded-lg ${activeSection === "notices" ? "bg-emerald-500" : "text-slate-300 hover:bg-slate-800"}`}>Notices</button>
        </nav>
        <div className="px-6 py-4 border-t border-slate-700">
          <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2">Logout</button>
        </div>
      </aside>

      <main className="ml-64 pt-20 px-8 pb-8">
        {loading && <p className="text-gray-600">Loading dashboard...</p>}

        {!loading && activeSection === "assign" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-green-700">Seat Assignment</h1>

            <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={rollNo} onChange={(event) => setRollNo(event.target.value)} placeholder="Student Roll No" className="border rounded-lg px-4 py-2" />
              <input value={busNo} onChange={(event) => setBusNo(event.target.value)} placeholder="Bus No" className="border rounded-lg px-4 py-2" />
              <input value={seatNo} onChange={(event) => setSeatNo(event.target.value)} placeholder="Seat No" className="border rounded-lg px-4 py-2" />
              <button onClick={assignSeat} className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 font-semibold">Assign Seat</button>
            </div>

            {bookingResult?.qr_code && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking QR</h2>
                <img src={bookingResult.qr_code} alt="Booking QR" className="w-52 h-52 border rounded-lg" />
                <button onClick={() => downloadDataUrl(bookingResult.qr_code, `${bookingResult.roll_no}-booking-qr.png`)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">Download QR</button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 overflow-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Students</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2">Name</th>
                    <th className="py-2">Roll No</th>
                    <th className="py-2">Route</th>
                    <th className="py-2">Bus</th>
                    <th className="py-2">Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b text-sm">
                      <td className="py-2">{student.name}</td>
                      <td className="py-2">{student.roll_no}</td>
                      <td className="py-2">{student.route_name || "-"}</td>
                      <td className="py-2">{student.bus_no || "-"}</td>
                      <td className="py-2">{student.seat_no || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeSection === "buses" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-green-700">Bus Management</h1>
            <div className="bg-white rounded-xl shadow-md p-6 overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2">Bus No</th>
                    <th className="py-2">Route</th>
                    <th className="py-2">Via</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => {
                    const route = routeMap.get(Number(bus.route_no));
                    return (
                      <tr key={bus.id} className="border-b text-sm">
                        <td className="py-2">{bus.bus_no}</td>
                        <td className="py-2">{route?.route_name || bus.route_no}</td>
                        <td className="py-2">{route?.via || "-"}</td>
                        <td className="py-2">{bus.student_type || route?.student_type || "-"}</td>
                        <td className="py-2">{bus.total_seats || 40}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeSection === "notices" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-green-700">Notices</h1>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <input value={noticeTitle} onChange={(event) => setNoticeTitle(event.target.value)} placeholder="Notice title" className="w-full border rounded-lg px-4 py-2" />
              <textarea value={noticeMessage} onChange={(event) => setNoticeMessage(event.target.value)} rows={4} placeholder="Notice message" className="w-full border rounded-lg px-4 py-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={noticeTargetType} onChange={(event) => setNoticeTargetType(event.target.value)} className="border rounded-lg px-4 py-2">
                  <option value="all">All Students</option>
                  <option value="route">By Route</option>
                </select>
                {noticeTargetType === "route" && (
                  <input value={noticeRouteNo} onChange={(event) => setNoticeRouteNo(event.target.value)} placeholder="Route number" className="border rounded-lg px-4 py-2" />
                )}
              </div>
              <button onClick={sendNotice} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2">Send Notice</button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
              {notices.length === 0 && <p className="text-gray-500">No notices found.</p>}
              {notices.map((notice) => (
                <div key={notice.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{notice.title}</h3>
                    <span className="text-xs text-gray-500">{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{notice.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
