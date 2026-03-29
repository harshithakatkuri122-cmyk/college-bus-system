import cbitLogo from "./images/cbitlogo.png";
import buses from "./images/busss.png";
import { useState, useEffect } from "react";
import PublicLayout from "./PublicLayout";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// context and pages
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import BookingProcedure from "./pages/BookingProcedure";

// dashboards
import JuniorDashboard from "./pages/student/JuniorDashboard";
import SeniorDashboard from "./pages/student/SeniorDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import InchargeDashboard from "./pages/incharge/InchargeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

// student feature pages
import BookBus from "./pages/student/BookBus";
import JuniorHome from "./pages/student/JuniorHome";
import JuniorPass from "./pages/student/JuniorPass";
// senior renewal handled inside SeniorDashboard now
import Placeholder from "./pages/Placeholder";
import JuniorDetails from "./pages/student/JuniorDetails";
import JuniorChangeBus from "./pages/student/JuniorChangeBus";
import JuniorNotices from "./pages/student/JuniorNotices";
import JuniorComplaint from "./pages/student/JuniorComplaint";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  // authentication context will redirect to dashboard when user logs in

  // Removed manual navigation logic
  // Use react-router for navigation
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // routing handled by react-router

  function HomePage() {
    return (
      <>
        {/* ================= HERO SECTION ================= */}
        <section
          className="relative min-h-[85vh] flex items-center px-20 bg-cover bg-no-repeat bg-center overflow-hidden"
          style={{
            backgroundImage: `url(${buses})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
          }}
        >
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%)"
          }}></div>

          {/* content */}
          <div className="relative max-w-3xl text-white space-y-10">
            <div className="space-y-6 animate-slideInLeft">
              <h2 className="text-8xl font-black leading-tight tracking-tight">
                <span className="text-white">CBIT </span>
                <span className="text-white">Transport</span>
                <br />
                <span className="text-green-200 font-bold">Management System</span>
              </h2>
              <p className="text-xl opacity-95 font-light leading-relaxed max-w-2xl">
                Safe, Reliable & Efficient Campus Transportation for 5000+ Students
              </p>
            </div>
            <div className="flex space-x-6 pt-8 animate-fadeInUp delay-200">
              <a href="#routes" className="group relative bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold text-lg flex items-center space-x-2 hover:from-green-700 hover:to-green-800">
                <span>Explore Routes</span>
                <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300"></span>
              </a>
              <Link to="/procedure" className="group relative border-2 border-white text-white px-12 py-4 rounded-lg hover:bg-white hover:text-green-700 transition-all duration-300 font-bold text-lg hover:shadow-xl">
                Bus Booking Procedure
                <span className="absolute inset-0 rounded-lg border-2 border-white group-hover:border-white opacity-0 transition-opacity duration-300"></span>
              </Link>
            </div>
          </div>
        </section>

        {/* ======= WHY CHOOSE CBIT TRANSPORT ======= */}
        <section className="px-20 py-20 bg-gradient-to-r from-green-50 to-white border-b-2 border-green-200">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-green-700 mb-4">Why Choose CBIT Transport?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Excellence in campus mobility with cutting-edge features</p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-green-600 text-center group">
              <div className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-bus"></i>
              </div>
              <h3 className="text-4xl font-bold text-green-700 mb-2">50+</h3>
              <p className="text-gray-700 font-semibold">Bus Routes</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-green-600 text-center group">
              <div className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-4xl font-bold text-green-700 mb-2">200+</h3>
              <p className="text-gray-700 font-semibold">Staff Members</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-green-600 text-center group">
              <div className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-4xl font-bold text-green-700 mb-2">5000+</h3>
              <p className="text-gray-700 font-semibold">Students Served</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-green-600 text-center group">
              <div className="text-green-600 text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-location-dot"></i>
              </div>
              <h3 className="text-3xl font-bold text-green-700 mb-2">GPS</h3>
              <p className="text-gray-700 font-semibold">Real-time Tracking</p>
            </div>
          </div>
        </section>

        {/* ======= ROUTE CARDS ======= */}
        <section id="routes" className="px-20 py-20 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="h-1 bg-green-600"></div>
              <div className="p-8 text-center">
                <div className="text-green-600 text-5xl mb-4">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Senior Bus Routes</h3>
                <p className="text-gray-600 mb-6">Routes for senior students with flexible schedules</p>
                <a href="#" className="text-green-600 font-semibold flex items-center justify-center space-x-2 hover:text-green-700 transition">
                  <span>View Routes</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="h-1 bg-green-600"></div>
              <div className="p-8 text-center">
                <div className="text-green-600 text-5xl mb-4">
                  <i className="fas fa-child"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Junior Bus Routes</h3>
                <p className="text-gray-600 mb-6">Routes for junior students with safe transport</p>
                <a href="#" className="text-green-600 font-semibold flex items-center justify-center space-x-2 hover:text-green-700 transition">
                  <span>View Routes</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="h-1 bg-green-600"></div>
              <div className="p-8 text-center">
                <div className="text-green-600 text-5xl mb-4">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Faculty Bus Routes</h3>
                <p className="text-gray-600 mb-6">Routes for faculty and staff members</p>
                <a href="#" className="text-green-600 font-semibold flex items-center justify-center space-x-2 hover:text-green-700 transition">
                  <span>View Routes</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

 return (
  <Router>
    <AuthProvider>
      
        
        {/* ================= TOP GREEN BAR (STICKY) ================= */}
        

        {/* Spacer for fixed header */}
        

        {/* ================= HEADER WITH LOGO & TEXT ================= */}
        
        {/* ================= MAIN ROUTING SECTION ================= */}
        <Routes>
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/procedure" element={<PublicLayout><BookingProcedure /></PublicLayout>} />

          {/* student junior routes */}
          <Route 
            path="/student/junior/*" 
            element={<PrivateRoute roles={["student"]} studentYear={1}><JuniorDashboard /></PrivateRoute>}
          >
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<JuniorDetails />} />
            <Route path="book" element={<BookBus />} />
            <Route path="change" element={<JuniorChangeBus />} />
            <Route path="pass" element={<JuniorPass />} />
            <Route path="complaint" element={<JuniorComplaint />} />
            <Route path="timetable" element={<JuniorNotices />} />
          </Route>

          {/* student senior */}
          <Route
  path="/student/senior/*"
  element={
    <PrivateRoute roles={["student"]} studentYear="senior">
      <SeniorDashboard />
    </PrivateRoute>
  }
/>

          {/* faculty (single-screen dashboard like senior) */}
          <Route
            path="/faculty/*"
            element={<PrivateRoute roles={["faculty"]}><FacultyDashboard /></PrivateRoute>}
          />

          {/* bus incharge */}
          <Route
            path="/incharge/*"
            element={<PrivateRoute roles={["bus-incharge"]}><InchargeDashboard /></PrivateRoute>}
          >
            <Route path="assigned" element={<Placeholder title="Assigned Bus Details" />} />
            <Route path="students" element={<Placeholder title="Student List" />} />
            <Route path="timetable" element={<Placeholder title="Bus Timetable" />} />
          </Route>

          {/* admin */}
          <Route
            path="/admin/*"
            element={<PrivateRoute roles={["transport-admin"]}><AdminDashboard /></PrivateRoute>}
          />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* ================= FOOTER ================= */}
       

      
    </AuthProvider>
  </Router>
);
}

  // small helper to show login/logout button in header
  function AuthToggle() {
    const { user, logout } = useAuth();
    // hide global logout when senior dashboard is active; senior layout will show its own navbar/logout
    if (user && user.role === "student") return null;
    if (user) {
      return (
        <button
          onClick={logout}
          className="group relative px-10 py-3.5 bg-red-600 text-white font-bold text-base rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-red-700 flex items-center space-x-2"
        >
          <span>Logout</span>
          <i className="fas fa-sign-out-alt group-hover:rotate-90 transition-transform duration-300"></i>
        </button>
      );
    }
    return (
      <Link to="/login" className="group relative px-10 py-3.5 bg-green-700 text-white font-bold text-base rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-green-800 flex items-center space-x-2">
        <span>Login</span>
        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
        <span className="absolute inset-0 rounded-lg bg-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
      </Link>
    );
  }
          

// helper component for guarding routes
function PrivateRoute({ children, roles, studentYear }) {
  const { user, student } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  // Keep junior/senior student routes consistent with DB profile year.
  if (user.role === "student" && studentYear) {
    const year = Number(student?.year);

    // Wait for profile fetch after refresh so we do not mis-route immediately.
    if (!year) return null;

    if (studentYear === 1 && year !== 1) return <Navigate to="/student/senior" replace />;
    if (studentYear === "senior" && year === 1) return <Navigate to="/student/junior" replace />;
  }

  return children;
}