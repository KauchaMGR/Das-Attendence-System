/**
 * StatusStamp — renders the rubber-stamp badge for present/late/absent
 * (styling lives in src/index.css under `.stamp`).
 *
 * Props:
 *   status   — "present" | "late" | "absent" (anything else falls back to
 *              a neutral gray style)
 *   children — the label text/content shown inside the stamp, e.g.
 *              <StatusStamp status="present">Present · 22 / 28</StatusStamp>
 */
export default function StatusStamp({ status, children }) {
  // Maps the `status` prop to the CSS class defined in index.css
  const cls = {
    present: "present",
    late: "late",
    absent: "absent",
  }[status] || "neutral";

  // Small colored dot inside the stamp, same color family as the border/text
  const dotColor = {
    present: "bg-stamp-green",
    late: "bg-stamp-amber",
    absent: "bg-stamp-red",
    neutral: "bg-muted",
  }[status] || "bg-muted";

  return (
    <span className={`stamp ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  );
}
