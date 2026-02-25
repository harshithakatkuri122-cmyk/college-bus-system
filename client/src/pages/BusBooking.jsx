import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BusBooking({ onLoginOpen }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);
  const navigate = useNavigate();

  return (
    <main className={`px-20 py-12 transition-opacity duration-400 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-green-700">Bus Booking Procedure</h1>
          <p className="text-gray-600 mt-3">Clear step-by-step guide to book or renew your bus pass</p>
        </div>

        {/* Section 1: New Bus Pass Booking */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">New Bus Pass Booking</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-sign-in-alt"></i></span>
              <div>
                <div className="mb-2 font-semibold">Click Here to Login</div>
                <div>
                  <button onClick={onLoginOpen} className="group relative bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 font-bold">
                    Click Here to Login
                  </button>
                </div>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-route"></i></span>
              <div>
                View available bus routes and select your preferred route.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-chair"></i></span>
              <div>
                Check seat availability and select an available seat.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-credit-card"></i></span>
              <div>
                Redirect to secure payment page and complete payment.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-file-invoice"></i></span>
              <div>
                Download payment receipt.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="mt-1 text-green-600 text-xl"><i className="fas fa-id-badge"></i></span>
              <div>
                Bus pass is generated and displayed. Please print the bus pass for verification.
              </div>
            </li>
          </ol>
        </section>

        {/* Section 2: Renewal */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bus Pass Renewal (After Academic Year)</h2>
          <p className="text-gray-700 mb-4">Follow these steps to renew your bus pass for the next academic year.</p>

          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li>Login to your account.</li>
            <li>Click on the <strong>Renewal</strong> button.</li>
            <li className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-lg border hover:shadow-md transition cursor-pointer">
                <div className="font-semibold">Continue Same Bus Route</div>
                <div className="text-sm text-gray-600">Keep your current route and seat (if available).</div>
              </div>
              <div className="p-4 rounded-lg border hover:shadow-md transition cursor-pointer">
                <div className="font-semibold">Change Bus Route</div>
                <div className="text-sm text-gray-600">Select a new route and check availability.</div>
              </div>
            </li>
            <li>Check seat availability, complete payment and receive updated bus pass.</li>
          </ol>
        </section>

        {/* Section 3: Change Bus Route (Mid-Year) */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Change Bus Route (Mid-Year)</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li>Login to account.</li>
            <li>Click <strong>Change Bus Route</strong>.</li>
            <li>View available routes and check seat availability.</li>
            <li>Select seat and complete booking.</li>
            <li>New bus pass will be generated.</li>
          </ol>
        </section>

        <div className="text-center text-sm text-gray-600 mt-6">
          If you face any issues, please contact the Transport Office.
        </div>

        <div className="mt-8 flex justify-between">
          <button onClick={() => navigate('/')} className="px-6 py-2 rounded-lg border text-gray-700">Back to Home</button>
          <button onClick={onLoginOpen} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Login</button>
        </div>
      </div>
    </main>
  );
}
