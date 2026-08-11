import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api.js";

/**
 * ============================================================================
 * AuthContext — real login against POST /auth/login.
 * ============================================================================
 *
 * `login(email, password, expectedRole)` calls the backend, and rejects if
 * the account's actual role doesn't match the login page the user came in
 * through (a student account trying `/login/faculty`, etc.) — the backend
 * itself doesn't enforce this yet (see DOCUMENTATION.md), so it's checked
 * here.
 *
 * `user` shape: { role, name, token, studentId?, facultyId?, subjectsAssigned? }
 * `null` means logged out. Kept in React state only — a page refresh forgets
 * the login (same caveat as before; sessionStorage would fix this, not done
 * here to keep the change minimal — see DOCUMENTATION.md).
 * ============================================================================
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, password, expectedRole) {
    const result = await api.login(email, password);

    if (expectedRole && result.role !== expectedRole) {
      throw new Error(`This account is registered as ${result.role}, not ${expectedRole}.`);
    }

    setUser({
      role: result.role,
      name: result.fullname,
      token: result.access_token,
      studentId: result.student_id,
      facultyId: result.faculty_id,
      subjectsAssigned: result.subjects_assigned,
    });
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

// Convenience hook so components just do `const { user } = useAuth();`
// instead of importing useContext + AuthContext everywhere.
export function useAuth() {
  return useContext(AuthContext);
}
