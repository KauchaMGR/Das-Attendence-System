import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({ roleLabel, items, activeIndex, who, whoSub }) {
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
          {items.map((label, i) => (
            <div
              key={label}
              className={`text-[13.5px] px-2.5 py-2 rounded-[3px] cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-white/10 text-white"
                  : "text-paper/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              {label}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3">
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
