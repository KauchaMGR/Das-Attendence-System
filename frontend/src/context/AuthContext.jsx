import React, { createContext, useContext, useState } from "react";

/**
 * AuthContext — minimal role-based auth store.
 *
 * BACKEND INTEGRATION NOTE:
 * Replace `login()` below with a real call to POST /auth/login (FastAPI + JWT,
 * per proposal section 3.4). On success, store the returned JWT (e.g. in memory
 * or an httpOnly cookie set by the server — avoid localStorage for the token)
 * and decode the `role` claim to set `user.role`. Everything downstream
 * (ProtectedRoute, sidebars, dashboards) already reads from this context and
 * does not need to change.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, role: 'student'|'faculty'|'admin', ... }

  function login(role, name) {
    // TODO(backend): swap for `await api.post('/auth/login', {email, password})`
    setUser({ role, name });
  }

  function logout() {
    setUser(null);
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
