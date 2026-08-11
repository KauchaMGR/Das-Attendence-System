/**
 * Heatmap — renders a row of small colored squares, one per day, showing
 * present/absent/holiday at a glance. This is the ONLY visual attendance
 * summary on the student dashboard (the circular percentage ring was
 * removed on request — see StudentDashboard.jsx).
 *
 * Props:
 *   days — array of "present" | "absent" | "holiday" strings, oldest first.
 *          "holiday" = a Saturday/Sunday in the window — no class is held,
 *          so it's never counted as an absence (see api.getStudentHeatmap()
 *          and DOCUMENTATION.md §8).
 */
const COLORS = {
  present: "#2F6B4F",
  absent: "#EAE3D2",
  holiday: "#C9C4B6",
};

export default function Heatmap({ days }) {
  return (
    // One equal-width column per day — the grid adapts to whatever length
    // array it's given, so it tracks the admin-configured history window.
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
      {days.map((status, i) => (
        <div
          key={i}
          title={status} // hover tooltip showing the day's status
          className="aspect-square rounded-[2px]"
          style={{ background: COLORS[status] }}
        />
      ))}
    </div>
  );
}
