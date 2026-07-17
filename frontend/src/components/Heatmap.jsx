/*
  Heatmap.jsx renders a simple attendance heatmap for the last 14 days.
  The `days` prop should be an array of status strings like "present", "late", or "absent".
*/
const COLORS = {
  present: "#2F6B4F",
  late: "#B8842C",
  absent: "#EAE3D2",
};

export default function Heatmap({ days }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
      {days.map((status, index) => (
        <div
          key={index}
          title={status}
          className="aspect-square rounded-[2px]"
          style={{ background: COLORS[status] }}
        />
      ))}
    </div>
  );
}
