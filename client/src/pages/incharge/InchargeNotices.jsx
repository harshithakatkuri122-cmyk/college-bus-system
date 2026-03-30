import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function InchargeNotices() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [routeNo, setRouteNo] = useState("");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotices() {
    const token = localStorage.getItem("token");
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/notices/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load notices");
      }

      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, [user?.id]);

  async function sendNotice() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      target_type: targetType,
      ...(targetType === "route" ? { route_no: Number(routeNo) } : {}),
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

      setTitle("");
      setMessage("");
      setRouteNo("");
      await loadNotices();
      alert("Notice sent successfully");
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to send notice");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Notices</h1>
        <p className="text-gray-600">Send and view notices</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-emerald-500 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Send Notice</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Notice title"
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Notice message"
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={targetType}
            onChange={(event) => setTargetType(event.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="all">All Students</option>
            <option value="route">By Route</option>
          </select>

          {targetType === "route" && (
            <input
              value={routeNo}
              onChange={(event) => setRouteNo(event.target.value)}
              placeholder="Route number"
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          )}
        </div>

        <button
          onClick={sendNotice}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg"
        >
          Send Notice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Received Notices</h2>

        {loading && <p className="text-gray-600">Loading notices...</p>}

        {!loading && notices.length === 0 && (
          <p className="text-gray-500">No notices found.</p>
        )}

        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800">{notice.title}</h3>
                <span className="text-xs text-gray-500">{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{notice.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
