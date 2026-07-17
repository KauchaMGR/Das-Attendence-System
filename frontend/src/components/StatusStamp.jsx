/*
  StatusStamp.jsx renders a small status badge with a colored dot.
  It maps the `status` prop to a CSS modifier and a dot color.
*/
export default function StatusStamp({ status, children }) {
  const cls = {
    present: "present",
    late: "late",
    absent: "absent",
  }[status] || "neutral";

  const dotColor = {
    present: "bg-stamp-green",
    late: "bg-stamp-amber",
    absent: "bg-stamp-red",
    neutral: "bg-muted",
  }[status] || "bg-muted";

  return (
    <span className={`stamp ${cls}`}>
      {/* Small status dot on the left */}
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  );
}
