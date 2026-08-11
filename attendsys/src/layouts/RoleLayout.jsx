import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

/**
 * RoleLayout — shared shell for every role's set of pages.
 *
 * Renders the Sidebar ONCE, then <Outlet /> swaps in whichever child page
 * matches the current URL (see App.jsx's nested <Route> blocks). This means
 * the sidebar doesn't remount/flicker when you navigate between e.g.
 * /student and /student/history.
 *
 * Each page component rendered inside the Outlet is responsible for its
 * own <Topbar> and content — this layout only owns the Sidebar + page frame.
 *
 * Props:
 *   roleLabel — "Student" | "Faculty" | "Admin"
 *   items     — nav items for the Sidebar, see Sidebar.jsx
 *   basePath  — role's root path, e.g. "/student"
 *   who       — display name shown in the sidebar
 *   whoSub    — small subtext under the name in the sidebar
 */
export default function RoleLayout({ roleLabel, items, basePath, who, whoSub }) {
  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar roleLabel={roleLabel} items={items} basePath={basePath} who={who} whoSub={whoSub} />
      <main className="flex-1 p-8 max-w-[1180px]">
        <Outlet />
      </main>
    </div>
  );
}
