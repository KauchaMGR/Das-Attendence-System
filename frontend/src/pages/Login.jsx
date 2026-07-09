import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  { key: "student", label: "Student", name: "Sittal Pantha", path: "/student" },
  { key: "faculty", label: "Faculty", name: "Prof. R. Karki", path: "/faculty" },
  { key: "admin", label: "Admin", name: "NCIT Admin", path: "/admin" },
];

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // TODO(backend): POST /auth/login {email, password} -> {token, role}
    const chosen = ROLES.find((r) => r.key === role);
    login(role, chosen.name);
    navigate(chosen.path);
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-2.5 h-2.5 bg-stamp-green rounded-[2px]" />
          <span className="font-display font-semibold text-[16px] text-ink">AttendSys</span>
        </Link>

        <div className="card p-7">
          <h1 className="font-display font-semibold text-[19px] mb-1">Sign in</h1>
          <p className="text-[13px] text-muted mb-6">
            Demo build — pick a role to preview its dashboard. Real sign-in
            arrives with the FastAPI + JWT backend.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`font-mono text-[11.5px] py-2 rounded-[3px] border transition-colors focus-ring ${
                  role === r.key
                    ? "bg-ink text-paper border-ink"
                    : "border-rule text-muted hover:border-ink/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

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
              className="w-full bg-stamp-green text-paper font-semibold text-[14px] py-2.5 rounded-[3px] mt-2 hover:opacity-90 transition-opacity focus-ring"
            >
              Sign in as {ROLES.find((r) => r.key === role).label}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
