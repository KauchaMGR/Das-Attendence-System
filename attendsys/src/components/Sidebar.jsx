import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Sidebar — shared left nav for all three dashboards.
 *
 * Each item in `items` is now a REAL route: { label, to }. `to` is relative
 * to the role's base path (e.g. for Student, "" -> /student, "history" ->
 * /student/history). NavLink handles the active-highlight automatically —
 * no more manually tracking `activeIndex`.
 *
 * Props:
 *   roleLabel — small label above the nav, e.g. "Student"
 *   items     — [{ label: string, to: string }]
 *   basePath  — the role's root path, e.g. "/student"
 *   who       — display name at the bottom
 *   whoSub    — small subtext under the name
 */
export default function Sidebar({ roleLabel, items, basePath, who, whoSub }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="bg-ink text-paper flex flex-col p-5 w-[220px] shrink-0">
      <div className="flex items-center gap-2 pb-6 px-1">
        <div className="w-2.5 h-2.5 bg-stamp-amber rounded-[2px]" />
        <span className="font-display font-semibold text-[15px] tracking-tight">
          AttendSys
        </span>
      </div>

      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase px-2 mb-2">
          {roleLabel}
        </div>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            // "" means the role's index route (e.g. /student itself)
            const to = item.to === "" ? basePath : `${basePath}/${item.to}`;
            return (
              <NavLink
                key={item.label}
                to={to}
                end={item.to === ""} // only exact-match highlight the index route
                className={({ isActive }) =>
                  `text-[13.5px] px-2.5 py-2 rounded-[3px] transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-paper/60 hover:bg-white/5 hover:text-white/90"
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        {/* No profile page exists anymore (removed per request) — this is
            now just a display block, not a link. */}
        <div className="flex items-center gap-2.5 mb-3 p-1 -m-1">
          <div className="w-8 h-8 rounded-[6px] bg-stamp-amber/15 border border-stamp-amber/40 flex items-center justify-center font-mono text-[11px] text-stamp-amber">
            {who?.[0] ?? "?"}
          </div>
          <div className="text-[12.5px] leading-tight">
            <b className="block text-[13px]">{who}</b>
            <span className="font-mono text-[10px] text-paper/40">{whoSub}</span>
          </div>
        </div>
        <button
          onClick={() => {
            // TODO(backend): also invalidate/clear the JWT here once real auth exists
            logout();
            navigate("/");
          }}
          className="text-[11.5px] font-mono text-paper/50 hover:text-paper focus-ring rounded-[3px]"
        >
          ← Sign out
        </button>
      </div>
    </aside>
  );
}
