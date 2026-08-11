import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * LoginForm — shared sign-in form used by StudentLogin, FacultyLogin, and
 * AdminLogin. Each of those pages just passes its own role/copy/icon; the
 * form itself, the back-to-home link, and the "wrong role?" link are all
 * identical across the three so they live here once.
 *
 * Props:
 *   role        — "student" | "faculty" | "admin" — passed to AuthContext.login()
 *   roleLabel   — display label, e.g. "Student"
 *   demoName    — the name used for the demo login (no real backend yet)
 *   redirectTo  — where to navigate after a successful login, e.g. "/student"
 *   icon        — small icon element shown at the top of the card
 *   accentClass — Tailwind classes for the icon's background/border/text color
 *
 * TODO(backend): see the big comment inside handleSubmit() for exactly what
 * changes once POST /auth/login exists.
 */
export default function LoginForm({ role, roleLabel, demoName, redirectTo, icon, accentClass }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password, role);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Back to home — always visible, not buried behind role select */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-muted hover:text-ink transition-colors focus-ring rounded-[3px] mb-6"
        >
          ← Back to home
        </Link>

        <div className="card p-7">
          <div className={`w-11 h-11 rounded-[6px] flex items-center justify-center mb-4 ${accentClass}`}>
            {icon}
          </div>
          <h1 className="font-display font-semibold text-[19px] mb-1">{roleLabel} sign-in</h1>
          <p className="text-[13px] text-muted mb-6">
            Sign in with your account email and password.
          </p>

          {error && (
            <p className="text-[13px] text-stamp-red mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] text-muted mb-1">College email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ncit.edu.np"
                className="w-full border border-rule rounded-[3px] px-3 py-2.5 text-[13.5px] bg-white focus-ring"
              />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-rule rounded-[3px] px-3 py-2.5 text-[13.5px] bg-white focus-ring"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-stamp-green text-paper font-semibold text-[14px] py-2.5 rounded-[3px] mt-2 hover:opacity-90 transition-opacity disabled:opacity-60 focus-ring"
            >
              {submitting ? "Signing in…" : `Sign in as ${roleLabel}`}
            </button>
          </form>
        </div>

        <Link
          to="/login"
          className="block text-center text-[12.5px] font-mono text-muted hover:text-ink transition-colors focus-ring rounded-[3px] mt-5"
        >
          Not {roleLabel.toLowerCase()}? Choose a different role
        </Link>
      </div>
    </div>
  );
}
