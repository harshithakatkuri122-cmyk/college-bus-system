import React, { useState } from "react";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";

export default function NoticeForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All");
  const [route, setRoute] = useState("");
  const [notices, setNotices] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    async function loadRoutes() {
      try {
        const res = await fetch("/api/routes");
        const data = await res.json();
        if (!res.ok) return;
        setRoutes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    }

    loadRoutes();
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      alert("Please fill in all fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      return;
    }

    let payload = {
      title,
      message,
      target_type: "all",
    };

    if (audience === "Route") {
      const routeNo = Number(route);
      if (!Number.isInteger(routeNo) || routeNo <= 0) {
        alert("Please select a valid route");
        return;
      }

      payload = {
        ...payload,
        target_type: "route",
        route_no: routeNo,
      };
    }

    try {
      setSubmitting(true);

      let res = await fetch("/api/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch("/api/notices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send notice");
      }

      setNotices((prev) => [
        {
          id: data.notice_id,
          title,
          message,
          audience,
          route: audience === "Route" ? route : null,
          date: new Date().toISOString(),
          createdBy: user?.id,
        },
        ...prev,
      ]);

      setTitle("");
      setMessage("");
      setAudience("All");
      setRoute("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to send notice");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNotice = (id) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Send Notice</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notice message"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option>All</option>
                <option>Route</option>
              </select>
            </div>
            {audience === "Route" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                >
                  <option value="">Select route</option>
                  {routes.map((routeItem) => (
                    <option key={routeItem.route_no} value={routeItem.route_no}>
                      {routeItem.route_name} ({routeItem.route_no})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={submitting}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {submitting ? "Sending..." : "Send Notice"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold mb-4">Sent Notices ({notices.length})</h3>
        <div className="space-y-3">
          {notices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No notices sent yet</div>
          ) : (
            notices.map((n) => (
              <div key={n.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{n.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  </div>
                  <button
                    onClick={() => deleteNotice(n.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge
                    text={n.audience}
                    type="info"
                  />
                  {n.route && (
                    <span className="text-xs text-gray-500">Route: {n.route}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
