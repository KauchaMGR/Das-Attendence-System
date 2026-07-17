/*
  Card.jsx is a small wrapper component used throughout the dashboard.
  It renders an optional title and subtitle, then displays any child content.
*/
export default function Card({ title, sub, children, className = "" }) {
  return (
    <div className={`card p-5 ${className}`}>
      {title && (
        <h3 className="font-display font-semibold text-[15px] mb-0.5">{title}</h3>
      )}
      {sub && <div className="text-[12px] text-muted mb-4">{sub}</div>}
      {children}
    </div>
  );
}
