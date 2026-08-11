import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Topbar — page header used at the top of every dashboard page.
 *
 * Has a profile-avatar button and a notification bell on the right side,
 * linking into the role's /profile and /notifications routes respectively.
 * The profile button was previously removed (no profile pages existed);
 * it's back now that every role has a real /profile page again.
 *
 * Props:
 *   title        — main heading text
 *   sub          — optional small subtitle under the title
 *   right        — optional extra element rendered before the bell
 *                  (e.g. a <StatusStamp> showing overall status)
 *   basePath     — role's root path, e.g. "/student" — used to build the
 *                  profile/notification links
 *   unreadCount  — optional number shown as a badge on the bell icon
 */
export default function Topbar({ title, sub, right, basePath, unreadCount = 0 }) {
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-start flex-wrap gap-3 mb-6 pb-5 border-b border-rule">
      <div>
        <h1 className="font-display font-semibold text-[22px] text-ink">{title}</h1>
        {sub && (
          <div className="font-mono text-[12px] text-muted mt-1 uppercase tracking-wide">
            {sub}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {right}

        {basePath && (
          <Link
            to={`${basePath}/profile`}
            className="w-9 h-9 rounded-[4px] border border-rule bg-[#FBF9F3] flex items-center justify-center hover:border-ink/40 transition-colors focus-ring font-mono text-[12px] text-ink2"
            aria-label="Profile"
            title={user?.name}
          >
            {user?.name?.[0] ?? "?"}
          </Link>
        )}

        {/* Notification bell — links to {basePath}/notifications.
            TODO(backend): `unreadCount` should come from an API call, e.g.
            api.getUnreadNotificationCount(), polled or refreshed on page load. */}
        {basePath && (
          <Link
            to={`${basePath}/notifications`}
            className="relative w-9 h-9 rounded-[4px] border border-rule bg-[#FBF9F3] flex items-center justify-center hover:border-ink/40 transition-colors focus-ring"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-stamp-red text-white text-[9px] font-mono font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
