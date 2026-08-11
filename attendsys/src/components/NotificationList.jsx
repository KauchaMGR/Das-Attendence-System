/**
 * NotificationList — renders a list of notification items. Shared across
 * Student/Faculty/Admin notification pages since the shape and look are
 * identical; only the data source differs per role (see each page's
 * api.get*Notifications() call).
 *
 * Props:
 *   notifications — [{ id, type: "warning"|"info"|"success", title, detail, time, read }]
 *   onMarkRead    — optional callback(id) fired when an unread item is clicked
 */
const TYPE_STYLES = {
  warning: { dot: "bg-stamp-amber", label: "text-stamp-amber" },
  success: { dot: "bg-stamp-green", label: "text-stamp-green" },
  info: { dot: "bg-muted", label: "text-muted" },
};

export default function NotificationList({ notifications, onMarkRead }) {
  if (!notifications.length) {
    return <div className="text-[13px] text-muted py-6 text-center">No notifications yet.</div>;
  }

  return (
    <div>
      {notifications.map((n) => {
        const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
        return (
          <button
            key={n.id}
            onClick={() => !n.read && onMarkRead?.(n.id)}
            className={`w-full text-left flex gap-3 py-3.5 border-b border-rule/70 last:border-0 focus-ring rounded-[3px] ${
              n.read ? "opacity-60" : ""
            }`}
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <b className="text-[13.5px]">{n.title}</b>
                <span className="font-mono text-[10.5px] text-muted shrink-0">{n.time}</span>
              </div>
              <p className="text-[13px] text-ink2/75 mt-0.5 leading-relaxed">{n.detail}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
