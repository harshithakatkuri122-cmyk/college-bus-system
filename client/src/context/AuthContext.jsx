import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // fake login: determine role based on id prefix or hardcoded mapping
  function login(id, password) {
    // in a real app you'd call an API
    let role = "student-junior";
    if (id.toLowerCase().startsWith("ss")) role = "student-senior";
    else if (id.toLowerCase().startsWith("fac")) role = "faculty";
    else if (id.toLowerCase().startsWith("inc")) role = "bus-incharge";
    else if (id.toLowerCase().startsWith("admin")) role = "transport-admin";

    const fakeUser = { id, role };
    setUser(fakeUser);
    // navigate to appropriate dashboard
    switch (role) {
      case "student-junior":
        navigate("/student/junior");
        break;
      case "student-senior":
        navigate("/student/senior");
        break;
      case "faculty":
        navigate("/faculty");
        break;
      case "bus-incharge":
        navigate("/incharge");
        break;
      case "transport-admin":
        navigate("/admin");
        break;
    }
    return fakeUser;
  }

  function logout() {
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
