import cbitLogo from "./images/cbitlogo.png";
import buses from "./images/busss.png";
import { useState, useEffect } from "react";
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
import Renewal from "./pages/student/Renewal";
import Placeholder from "./pages/Placeholder";

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
        <div className="bg-gray-50 min-h-screen">

      {/* ================= TOP GREEN BAR (STICKY) ================= */}
      <div className={`fixed top-0 w-full z-50 bg-green-700 text-white h-16 flex items-center px-10 transition-shadow duration-300 border-b-4 border-amber-900 ${isScrolled ? "shadow-xl" : "shadow-md"}`}>
        <div className="flex justify-end items-center space-x-10 w-full">
          <a href="#footer" className="text-white font-medium text-sm relative group hover:text-green-50 transition-colors duration-300">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#footer" className="text-white font-medium text-sm relative group hover:text-green-50 transition-colors duration-300">
            Contact Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* ================= HEADER WITH LOGO & TEXT ================= */}
      <header className="bg-white border-b-4 border-yellow-700 py-3 px-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo + Institute Text */}
          <Link to="/" className="flex items-center space-x-6 cursor-pointer">
            <img
              src={cbitLogo}
              alt="CBIT Logo"
              className="h-28 w-auto object-contain"
            />
          </Link>

              {/* Right Side: Login Button */}
          <Link to="/login" className="group relative px-10 py-3.5 bg-green-700 text-white font-bold text-base rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-green-800 flex items-center space-x-2">
            <span>Login</span>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
            <span className="absolute inset-0 rounded-lg bg-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/procedure" element={<BookingProcedure />} />

        {/* student junior routes */}
        <Route
          path="/student/junior/*"
          element={<PrivateRoute roles={["student-junior"]}><JuniorDashboard /></PrivateRoute>}
        >
          <Route path="book" element={<BookBus />} />
          <Route path="change" element={<Placeholder title="Change Bus" />} />
          <Route path="pass" element={<Placeholder title="View / Download Bus Pass" />} />
          <Route path="complaint" element={<Placeholder title="Raise Complaint" />} />
          <Route path="timetable" element={<Placeholder title="Bus Timetable" />} />
        </Route>

        {/* student senior */}
        <Route
          path="/student/senior/*"
          element={<PrivateRoute roles={["student-senior"]}><SeniorDashboard /></PrivateRoute>}
        >
          <Route path="renewal" element={<Renewal />} />
          <Route path="change" element={<Placeholder title="Change Bus" />} />
          <Route path="pass" element={<Placeholder title="View / Download Bus Pass" />} />
          <Route path="complaint" element={<Placeholder title="Raise Complaint" />} />
          <Route path="timetable" element={<Placeholder title="Bus Timetable" />} />
        </Route>

        {/* faculty */}
        <Route
          path="/faculty/*"
          element={<PrivateRoute roles={["faculty"]}><FacultyDashboard /></PrivateRoute>}
        >
          <Route path="pass" element={<Placeholder title="View Bus Pass" />} />
          <Route path="complaint" element={<Placeholder title="Raise Complaint" />} />
          <Route path="timetable" element={<Placeholder title="Bus Timetable" />} />
        </Route>

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
        >
          <Route path="routes" element={<Placeholder title="Manage Routes" />} />
          <Route path="year" element={<Placeholder title="Switch Academic Year" />} />
          <Route path="assign" element={<Placeholder title="Assign Bus Incharges" />} />
          <Route path="students" element={<Placeholder title="View Students" />} />
          <Route path="complaints" element={<Placeholder title="Manage Complaints" />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ================= FOOTER ================= */}
      <footer
        id="footer"
        className="bg-gray-900 text-white px-20 py-12 border-t-4 border-yellow-800"
      >
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">Contact Info</h3>
            <p className="text-sm leading-relaxed">
              Gandipet, Hyderabad, Telangana,<br />
              PIN : 500075<br />
              <br />
              <strong>Mobile:</strong> 8466997201<br />
              <strong>Admissions:</strong> 8466997216<br />
              <strong>Email:</strong> transport@cbit.ac.in
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-yellow-400 transition">Home</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition">Routes</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition">Booking</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition">Schedules</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">About Transport</h3>
            <p className="text-sm leading-relaxed">
              CBIT provides safe and reliable transportation for all students, faculty, and staff. Our modern fleet ensures comfortable and punctual service.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 CBIT Transport System | Developed by Hasini and Harshitha
          </p>
        </div>
      </footer>

        </div>
      </AuthProvider>
    </Router>
  );
}

// helper component for guarding routes
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}