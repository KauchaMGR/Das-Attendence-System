import React, { createContext, useContext, useEffect, useState } from "react";
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
 * `user` shape: { role, name, email, token, studentId?, facultyId?, subjectsAssigned? }
 * `null` means logged out. Kept in React state only — a page refresh forgets
 * the login (same caveat as before; sessionStorage would fix this, not done
 * here to keep the change minimal — see DOCUMENTATION.md).
 *
 * `settings` is fetched once here (independent of login) instead of on every
 * page, so every "last N days" widget across all three dashboards reads the
 * same admin-configured `historyDays` value (see DOCUMENTATION.md §8).
 * `refreshSettings()` is called by AdminSettings after a save so the new
 * value takes effect without a full page reload.
 * ============================================================================
 */
const AuthContext = createContext(null);

const DEFAULT_SETTINGS = { historyDays: 14 };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  async function refreshSettings() {
    try {
      const s = await api.getSystemSettings();
      setSettings(s);
      return s;
    } catch {
      return settings; // backend unreachable — keep whatever we already have
    }
  }

  useEffect(() => {
    refreshSettings();
  }, []);

  async function login(email, password, expectedRole) {
    const result = await api.login(email, password);

    if (expectedRole && result.role !== expectedRole) {
      throw new Error(`This account is registered as ${result.role}, not ${expectedRole}.`);
    }

    setUser({
      role: result.role,
      name: result.fullname,
      email: result.email,
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
    <AuthContext.Provider value={{ user, login, logout, settings, refreshSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook so components just do `const { user } = useAuth();`
// instead of importing useContext + AuthContext everywhere.
export function useAuth() {
  return useContext(AuthContext);
}
