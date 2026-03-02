import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import buses from "../images/busss.png";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    login(id, password);
  }

  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${buses})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative bg-white rounded-xl shadow-2xl w-96 p-8">
        {/* close button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close"
        >
          ×
        </button>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 text-sm mb-6">
            Sign in to your transport account
          </p>
          <p className="text-gray-500 text-xs mb-4">
            For demo simply use an ID starting with <code>fac</code> for faculty, <code>ss</code> for senior
            students or any other prefix – password is ignored.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                College ID
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter your College ID"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
              />
            </div>

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

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-gray-600 text-xs text-center mt-4">
            If you don't have an account, contact transport office.
          </p>
        </div>
      </div>
  );
}
