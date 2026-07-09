export default function Topbar({ title, sub, right }) {
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
      {right}
    </div>
  );
}
