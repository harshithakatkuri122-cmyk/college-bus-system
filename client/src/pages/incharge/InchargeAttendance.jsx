import React, { useState } from "react";

// QR Scan Modal Component
const QRScanModal = ({ isOpen, onClose, students, onMarkPresent }) => {
  const [scannedStudentId, setScannedStudentId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleScan = () => {
    if (scannedStudentId) {
      const student = students.find((s) => s.id === parseInt(scannedStudentId));
      if (student) {
        setSelectedStudent(student);
        setShowConfirmation(true);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedStudent) {
      onMarkPresent(selectedStudent.id);
      setScannedStudentId("");
      setShowConfirmation(false);
      setSelectedStudent(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="fas fa-qrcode text-green-600"></i>
          QR Code Scanner
        </h3>

        {!showConfirmation ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Scan QR code or enter student ID manually:
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                placeholder="Enter or scan student ID..."
                value={scannedStudentId}
                onChange={(e) => setScannedStudentId(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleScan}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Scan
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-2">Student Found:</p>
              <p className="text-lg font-bold text-green-700">{selectedStudent?.name}</p>
              <p className="text-sm text-gray-600">{selectedStudent?.collegeId}</p>
            </div>

            <p className="text-gray-700 font-medium">Mark as Present?</p>

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setScannedStudentId("");
                  setSelectedStudent(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
      <i className="fas fa-check-circle"></i>
      {message}
    </div>
  );
};

export default function InchargeAttendance({ incharge }) {
  const [mode, setMode] = useState("qr"); // 'qr' or 'manual'
  const [isQROpen, setIsQROpen] = useState(false);
  const [presentStudents, setPresentStudents] = useState(incharge?.students?.filter(s => s.presentToday) || []);
  const [manualSelection, setManualSelection] = useState(
    new Set(incharge?.students?.filter(s => s.presentToday).map(s => s.id) || [])
  );
  const [toast, setToast] = useState(null);

  const handleMarkPresent = (studentId) => {
    const student = incharge?.students?.find(s => s.id === studentId);
    if (student && !presentStudents.find(s => s.id === studentId)) {
      const newPresent = [...presentStudents, { ...student, timeMarked: new Date().toLocaleTimeString() }];
      setPresentStudents(newPresent);
      setToast(`${student.name} marked as present`);
      setIsQROpen(false);
    }
  };

  const handleManualToggle = (studentId) => {
    const newSelection = new Set(manualSelection);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setManualSelection(newSelection);
  };

  const handleManualSave = () => {
    const presentIds = Array.from(manualSelection);
    const presentList = incharge?.students?.filter(s => presentIds.includes(s.id)).map(s => ({
      ...s,
      timeMarked: new Date().toLocaleTimeString()
    })) || [];
    setPresentStudents(presentList);
    setToast("Attendance saved successfully");
  };

  const handleRemovePresent = (studentId) => {
    setPresentStudents(presentStudents.filter(s => s.id !== studentId));
    setManualSelection(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Attendance</h1>
        <p className="text-gray-600">Manage student attendance for your bus route</p>
      </div>

      {/* Mode Selection Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode("qr")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            mode === "qr"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <i className="fas fa-qrcode"></i>
          Scan QR
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            mode === "manual"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <i className="fas fa-clipboard-list"></i>
          Manual Entry
        </button>
      </div>

      {/* QR Mode */}
      {mode === "qr" && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <p className="text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Click the button below to open the QR scanner
            </p>
          </div>

          <button
            onClick={() => setIsQROpen(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-2xl transition shadow-md text-lg"
          >
            <i className="fas fa-camera mr-2"></i>
            Start QR Scan
          </button>

          <QRScanModal
            isOpen={isQROpen}
            onClose={() => setIsQROpen(false)}
            students={incharge?.students || []}
            onMarkPresent={handleMarkPresent}
          />
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="space-y-6">
          <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-500">
            <p className="text-purple-800">
              <i className="fas fa-info-circle mr-2"></i>
              Select students to mark as present, then click Save
            </p>
          </div>

          {/* Student Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 rounded-2xl p-4">
            {incharge?.students?.map((student) => (
              <label
                key={student.id}
                className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={manualSelection.has(student.id)}
                  onChange={() => handleManualToggle(student.id)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.collegeId}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleManualSave}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition shadow-md"
          >
            <i className="fas fa-save mr-2"></i>
            Save Attendance
          </button>
        </div>
      )}

      {/* Present Students Table */}
      {presentStudents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-list-check text-green-600"></i>
            Present Students Today ({presentStudents.length})
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-md">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">College ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Time Marked</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {presentStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-t border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50 transition`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-gray-700">{student.collegeId}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {student.timeMarked || "Now"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemovePresent(student.id)}
                        className="text-red-600 hover:text-red-700 font-semibold transition"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
