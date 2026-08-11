import { Link } from "react-router-dom";

/**
 * RoleSelect — "/login"
 *
 * First step of sign-in: pick a role, then land on that role's own login
 * page (/login/student, /login/faculty, /login/admin). Replaces the old
 * single Login.jsx that had a 3-button role toggle baked into one form.
 *
 * Has a clear "← Back to home" link at the top — this was missing before,
 * there was no way back to the landing page from login.
 */
const ROLES = [
  {
    key: "student",
    label: "Student",
    to: "/login/student",
    desc: "Check your attendance, subject-wise percentages, and history.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </svg>
    ),
  },
  {
    key: "faculty",
    label: "Faculty",
    to: "/login/faculty",
    desc: "Run capture sessions, correct rolls, and review your classes.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="14" rx="1.5" />
        <path d="M3 9h18" />
        <path d="M8 4v5" />
      </svg>
    ),
  },
  {
    key: "admin",
    label: "Admin",
    to: "/login/admin",
    desc: "Manage devices, enrollment, users, subjects, and system settings.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[560px]">
        {/* Back to home — the missing piece from before */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-muted hover:text-ink transition-colors focus-ring rounded-[3px] mb-8"
        >
          ← Back to home
        </Link>

        <div className="text-center mb-9">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-2.5 h-2.5 bg-stamp-green rounded-[2px]" />
            <span className="font-display font-semibold text-[16px] text-ink">AttendSys</span>
          </div>
          <h1 className="font-display font-semibold text-[26px] text-ink">Who's signing in?</h1>
          <p className="text-[13.5px] text-muted mt-2">Pick your role to continue to sign-in.</p>
        </div>

        <div className="space-y-3">
          {ROLES.map((r) => (
            <Link
              key={r.key}
              to={r.to}
              className="group flex items-center gap-4 card p-5 hover:border-ink/30 hover:-translate-y-0.5 transition-all focus-ring"
            >
              <div className="w-11 h-11 shrink-0 rounded-[6px] bg-stamp-green/10 border border-stamp-green/30 text-stamp-green flex items-center justify-center group-hover:bg-stamp-green group-hover:text-paper transition-colors">
                {r.icon}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-[15px] text-ink">{r.label}</div>
                <div className="text-[12.5px] text-muted mt-0.5 leading-snug">{r.desc}</div>
              </div>
              <span className="font-mono text-[12px] text-muted group-hover:text-ink transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
