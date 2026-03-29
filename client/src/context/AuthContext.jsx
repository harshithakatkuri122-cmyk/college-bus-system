import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [faculty, setFaculty] = useState(null);

  function getToken() {
    return localStorage.getItem("token");
  }

  function getAuthHeaders(extraHeaders = {}) {
    const token = getToken();
    return {
      ...extraHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchStudentStatus() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch("/api/student/my-status", {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to load student status");
    }

    return data;
  }

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(async data => {
        if (!data.user) return;

        setUser(data.user);

        if (data.user.role === "student") {
          let status = null;

          try {
            status = await fetchStudentStatus();
          } catch (statusError) {
            console.error(statusError);
          }

          setStudent({
            ...(data.profile || {}),
            ...(status || {}),
            hasBookedBus: Boolean(status?.booked ?? status?.bus_no),
            hasPaidFees: status?.payment_status === "Active",
          });
        }

        if (data.user.role === "faculty") {
          setFaculty(data.profile);
        }
      })
      .catch(err => console.error(err));
  }, []);

  async function login(college_id, password) {
    try {
      // Keep payload keys aligned with backend login contract.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ college_id, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);

      const loggedUser = data.user;
      setUser(loggedUser);

      if (loggedUser.role === "student") {
        let status = null;

        try {
          status = await fetchStudentStatus();
        } catch (statusError) {
          console.error(statusError);
        }

        setStudent({
          ...(data.profile || {}),
          ...(status || {}),
          hasBookedBus: Boolean(status?.booked ?? status?.bus_no),
          hasPaidFees: status?.payment_status === "Active",
        });

        if (data.profile.year === 1) {
          navigate("/student/junior");
        } else {
          navigate("/student/senior");
        }
      }

      if (loggedUser.role === "faculty") {
        setFaculty(data.profile);
        navigate("/faculty");
      }

      if (loggedUser.role === "bus-incharge") {
        navigate("/incharge");
      }

      if (loggedUser.role === "transport-admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setStudent(null);
    setFaculty(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, student, setStudent, faculty, setFaculty }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
