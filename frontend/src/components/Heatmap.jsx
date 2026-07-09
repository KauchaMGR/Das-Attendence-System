const COLORS = {
  present: "#2F6B4F",
  late: "#B8842C",
  absent: "#EAE3D2",
};

export default function Heatmap({ days }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
      {days.map((s, i) => (
        <div
          key={i}
          title={s}
          className="aspect-square rounded-[2px]"
          style={{ background: COLORS[s] }}
        />
      ))}
    </div>
  );
}
