import Card from "./Card.jsx";

/**
 * ProfileView — shared read-only "account details" panel used by every
 * role's /profile page (StudentProfile / FacultyProfile / AdminProfile).
 * Each page just fetches its own role-specific fields and hands them here
 * as a flat {label, value} row list.
 *
 * Props:
 *   initial — the display letter shown in the avatar circle
 *   name    — heading name
 *   roleLabel — small subtitle under the name, e.g. "Student account"
 *   rows    — [{ label, value }]
 */
export default function ProfileView({ initial, name, roleLabel, rows }) {
  return (
    <Card>
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-rule">
        <div className="w-14 h-14 rounded-[8px] bg-stamp-amber/15 border border-stamp-amber/40 flex items-center justify-center font-display font-semibold text-[22px] text-stamp-amber">
          {initial}
        </div>
        <div>
          <div className="font-display font-semibold text-[18px] text-ink">{name}</div>
          <div className="font-mono text-[11.5px] text-muted uppercase tracking-wide mt-0.5">{roleLabel}</div>
        </div>
      </div>

      <table className="w-full text-[13px]">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-rule/70 last:border-0">
              <td className="py-2.5 font-mono text-muted w-1/3">{r.label}</td>
              <td className="py-2.5">{r.value ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
