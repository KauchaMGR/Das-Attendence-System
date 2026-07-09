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
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  );
}
