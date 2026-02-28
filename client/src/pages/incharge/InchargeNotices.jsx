import React, { useState } from "react";

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse`}>
      <i className={`fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}`}></i>
      {message}
    </div>
  );
};

export default function InchargeNotices({ incharge }) {
  const [tab, setTab] = useState("send"); // 'send' or 'received'
  const [recipientType, setRecipientType] = useState("all"); // 'all' or 'specific'
  const [selectedStudent, setSelectedStudent] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [sentNotices, setSentNotices] = useState([]);

  const [receivedNotices] = useState([
    {
      id: 1,
      from: "Admin",
      date: "2026-02-28",
      title: "Route Change Notice",
      message: "Bus 7 route will be changed from March 1st due to ongoing construction on the main road.",
      type: "alert"
    },
    {
      id: 2,
      from: "Admin",
      date: "2026-02-27",
      title: "Schedule Update",
      message: "New pickup time for morning shift: 7:00 AM. Stop time updated to 5:45 PM.",
      type: "info"
    },
    {
      id: 3,
      from: "Admin",
      date: "2026-02-26",
      title: "Maintenance Notification",
      message: "Bus scheduled for maintenance on March 1st. Alternative transport will be arranged.",
      type: "warning"
    },
    {
      id: 4,
      from: "Admin",
      date: "2026-02-25",
      title: "Fare Update",
      message: "Monthly pass rates updated effective from next month. Check your student portal.",
      type: "info"
    },
  ]);

  const handleSendNotice = () => {
    if (!title.trim() || !message.trim()) {
      setToast({ text: "Please fill all fields", type: "error" });
      return;
    }

    const recipients = recipientType === "all"
      ? incharge?.students?.map(s => s.name).join(", ")
      : selectedStudent;

    const newNotice = {
      id: sentNotices.length + 1,
      date: new Date().toISOString().split('T')[0],
      title,
      message,
      recipients,
      recipientType
    };

    setSentNotices([newNotice, ...sentNotices]);
    setTitle("");
    setMessage("");
    setSelectedStudent("");
    setToast({ text: `Notice sent to ${recipientType === "all" ? "all students" : "selected student"}!`, type: "success" });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Notices</h1>
        <p className="text-gray-600">Manage and send notices to your bus students</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
        <button
          onClick={() => setTab("send")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            tab === "send"
              ? "bg-white text-green-600 shadow-md"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fas fa-paper-plane"></i>
          Send Notice
        </button>
        <button
          onClick={() => setTab("received")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            tab === "received"
              ? "bg-white text-green-600 shadow-md"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fas fa-inbox"></i>
          Received Notices
        </button>
      </div>

      {/* Send Notice Tab */}
      {tab === "send" && (
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-emerald-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-users text-emerald-600"></i>
              Select Recipients
            </h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === "all"}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">Send to All Students</p>
                  <p className="text-sm text-gray-600">
                    {incharge?.students?.length || 0} students in this bus route
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition">
                <input
                  type="radio"
                  name="recipientType"
                  value="specific"
                  checked={recipientType === "specific"}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">Send to One Student</p>
                  {recipientType === "specific" && (
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="">-- Select a student --</option>
                      {incharge?.students?.map((student) => (
                        <option key={student.id} value={student.name}>
                          {student.name} ({student.collegeId})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Notice Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-edit text-blue-600"></i>
              Notice Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Route Change Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Type your notice message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              {/* Character count */}
              <p className="text-sm text-gray-500">
                {message.length} / 500 characters
              </p>

              {/* Send Button */}
              <button
                onClick={handleSendNotice}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition shadow-md"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send Notice
              </button>
            </div>
          </div>

          {/* Sent Notices History */}
          {sentNotices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-purple-500">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-history text-purple-600"></i>
                Recently Sent ({sentNotices.length})
              </h2>

              <div className="space-y-3">
                {sentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{notice.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notice.date} • {notice.recipientType === "all" ? "All Students" : notice.recipients}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{notice.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Received Notices Tab */}
      {tab === "received" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <p className="text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              These are admin notices sent to your bus route
            </p>
          </div>

          {receivedNotices.length > 0 ? (
            <div className="space-y-3">
              {receivedNotices.map((notice) => {
                const typeStyles = {
                  alert: "border-red-400 bg-red-50",
                  warning: "border-yellow-400 bg-yellow-50",
                  info: "border-blue-400 bg-blue-50",
                };

                return (
                  <div
                    key={notice.id}
                    className={`rounded-lg p-5 border-l-4 ${typeStyles[notice.type]} hover:shadow-md transition cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{notice.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <i className="fas fa-user mr-1"></i>
                          From: {notice.from} • {notice.date}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          notice.type === "alert"
                            ? "bg-red-200 text-red-700"
                            : notice.type === "warning"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-blue-200 text-blue-700"
                        }`}
                      >
                        {notice.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-3">{notice.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-envelope-open-text text-4xl text-gray-300 mb-3 block"></i>
              <p className="text-gray-500">No notices received</p>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
