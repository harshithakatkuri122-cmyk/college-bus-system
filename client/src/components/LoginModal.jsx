import { useState } from "react";
import buses from "../images/busss.png";
import cbitLogo from "../images/cbitlogo.png";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col z-50"
      style={{
        backgroundImage: `url(${buses})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ================= TOP GREEN BAR ================= */}
      <div className="bg-green-700 text-white h-16 flex items-center px-10 border-b-4 border-amber-900 shadow-md">
        <div className="flex justify-end items-center space-x-10 w-full">
          <a href="#footer" onClick={onClose} className="text-white font-medium text-sm relative group hover:text-green-50 transition-colors duration-300">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#footer" onClick={onClose} className="text-white font-medium text-sm relative group hover:text-green-50 transition-colors duration-300">
            Contact Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
      </div>

      {/* ================= HEADER WITH LOGO ================= */}
      <header className="bg-white border-b-4 border-yellow-700 py-4 px-10 shadow-sm">
        <div className="flex items-center">
          <img
            src={cbitLogo}
            alt="CBIT Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
      </header>

      {/* ================= LOGIN BOX ================= */}
      <div className="flex-1 flex items-center justify-center">
        {/* Login Card */}
        <div className="relative bg-white rounded-xl shadow-2xl w-96 p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 text-sm mb-6">
            Sign in to your transport account
          </p>

          {/* Email / Roll */}
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold text-sm mb-2">
              College ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your College ID"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
            />
          </div>

          {/* Button */}
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition duration-300">
            Login
          </button>

          {/* Footer text */}
          <p className="text-gray-600 text-xs text-center mt-4">
            If you don't have an account, contact transport office.
          </p>
        </div>
      </div>
    </div>
  );
}