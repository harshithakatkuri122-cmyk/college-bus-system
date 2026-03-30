import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function SeniorNotices({ student }) {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotices() {
      const token = localStorage.getItem("token");
      const userId = user?.id || user?.user_id;

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        let res = await fetch(`/api/student/notices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          res = await fetch(`/api/notices/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (res.status === 404) {
          res = await fetch(`/api/notice/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load notices");
        }

        setNotices(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.message || "Unable to load notices");
      } finally {
        setLoading(false);
      }
    }

    loadNotices();
  }, [user?.id]);

  if (!student) {
    return <p className="text-center text-gray-600">Loading notices...</p>;
  }

  if (loading) {
    return <p className="text-center text-gray-600">Loading notices...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  if (notices.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-8">
        You have no notices at the moment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((n) => (
        <div
          key={n.id}
          className="bg-white shadow-md border-l-4 border-green-500 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">{n.title}</h3>
            <span className="text-sm text-gray-500">{new Date(n.created_at).toLocaleDateString()}</span>
          </div>
          <p className="mt-2 text-gray-700 leading-relaxed">{n.message}</p>
          <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-4">
            <span>Sender ID: {n.created_by}</span>
            <span>{n.route_no ? `Route No: ${n.route_no}` : "Global"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
