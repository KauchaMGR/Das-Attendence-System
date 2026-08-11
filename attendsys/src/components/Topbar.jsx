import { Link } from "react-router-dom";

/**
 * Topbar — page header used at the top of every dashboard page.
 *
 * Has a notification bell on the right side, linking into the role's
 * /notifications route. There used to also be a profile avatar button
 * here — removed per request, since "My Profile" pages no longer exist
 * for any role. The `who` prop is kept (some pages still pass it in) but
 * is currently unused inside this component; harmless to leave, or strip
 * the `who={...}` prop from each page's <Topbar/> call if you want it
 * fully cleaned up.
 *
 * Props:
 *   title        — main heading text
 *   sub          — optional small subtitle under the title
 *   right        — optional extra element rendered before the bell
 *                  (e.g. a <StatusStamp> showing overall status)
 *   basePath     — role's root path, e.g. "/student" — used to build the
 *                  notification link
 *   unreadCount  — optional number shown as a badge on the bell icon
 */
export default function Topbar({ title, sub, right, basePath, unreadCount = 0 }) {
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
