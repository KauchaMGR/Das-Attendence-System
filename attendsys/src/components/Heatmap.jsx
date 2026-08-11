/**
 * Heatmap — renders a row of small colored squares, one per day, showing
 * present/late/absent at a glance. This is the ONLY visual attendance
 * summary on the student dashboard now (the circular percentage ring was
 * removed on request — see StudentDashboard.jsx).
 *
 * Props:
 *   days — array of "present" | "late" | "absent" strings, oldest first.
 *          This should be exactly what `api.getStudentHeatmap()` /
 *          `GET /api/students/me/attendance` returns — no transformation
 *          needed between the API response and this prop.
 */
const COLORS = {
  present: "#2F6B4F",
  late: "#B8842C",
  absent: "#EAE3D2",
};

export default function Heatmap({ days }) {
  return (
    // 14 equal-width columns, one square per day. If you ever change the
    // `days` query param count in the API, this grid adapts automatically
    // since it just maps over whatever array it's given.
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
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
