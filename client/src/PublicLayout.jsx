import { Link } from "react-router-dom";
import cbitLogo from "./images/cbitlogo.png";
import AssistantChat from "./components/AssistantChat";
import FloatingNoticeAlert from "./components/FloatingNoticeAlert";

export default function PublicLayout({ children, showAssistant = false }) {
  return (
    <>
      {/* TOP GREEN BAR */}
      <div className="fixed top-0 w-full z-[1000] bg-green-700 text-white h-16 flex items-center px-10 border-b-4 border-amber-900">
        <div className="flex justify-end items-center space-x-10 w-full">
          <a href="#footer" className="text-white text-sm">About Us</a>
          <a href="#footer" className="text-white text-sm">Contact Us</a>
        </div>
      </div>

      <div className="h-16"></div>

      {/* HEADER */}
      <header className="bg-white border-b-4 border-yellow-700 py-3 px-10 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-6">
            <img
              src={cbitLogo}
              alt="CBIT Logo"
              className="h-28 w-auto object-contain"
            />
          </Link>

          <Link to="/login" className="px-6 py-2 bg-green-700 text-white rounded-lg">
            Login
          </Link>
        </div>
      </header>

      {children}

      {showAssistant && <AssistantChat mode="public" />}
      <FloatingNoticeAlert />

      {/* FOOTER */}
      <footer
        id="footer"
        className="bg-gray-900 text-white px-20 py-12 border-t-4 border-yellow-800"
      >
        <div className="text-center text-sm text-gray-400">
          © 2025 CBIT Transport System
        </div>
      </footer>
    </>
  );
}