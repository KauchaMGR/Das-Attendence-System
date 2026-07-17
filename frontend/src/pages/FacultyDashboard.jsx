/*
  FacultyDashboard.jsx is the classroom instructor view.
  It loads live session data, the student roster, and attendance alerts,
  then renders controls for attendance capture and manual overrides.
*/
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import Card from "../components/Card.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function FacultyDashboard() {
  // Get the current logged-in user from the auth context.
  const { user } = useAuth();

  // Dashboard state values.
  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    // Load data once when the component mounts.
    api.getActiveSession().then(setSession);
    api.getRoster().then(setRoster);
    api.getLowAttendanceAlerts().then(setAlerts);
  }, []);

  function toggleStatus(id) {
    // Flip a student's attendance locally.
    // This is a temporary UI-only state change until the backend endpoint is wired.
    setRoster((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "present" ? "absent" : "present" }
          : r
      )
    );
    // TODO(backend): api.overrideAttendance(id, newStatus)
  }

  async function runCapture() {
    setCapturing(true);
    await api.triggerCapture(null); // TODO(backend): pass the uploaded classroom photo
    setCapturing(false);
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar navigation on the left */}
      <Sidebar
        roleLabel="Faculty"
        items={["Live Session", "Attendance Records", "My Students", "Reports"]}
        activeIndex={0}
        who={user?.name}
        whoSub={session?.subject}
      />

      <main className="flex-1 p-8 max-w-[1180px]">
        {/* Topbar shows the current session title and a status badge */}
        <Topbar
          title={session ? `${session.section} · ${session.subject}` : ""}
          sub={session ? `${session.room} · ${session.time}` : ""}
          right={<StatusStamp status="present">Session active</StatusStamp>}
        />

        {/* Main grid with capture tools and session summary */}
        <div className="grid md:grid-cols-[2fr_1fr] gap-5 mb-5">
          <Card title="Capture attendance" sub="Upload the classroom photo to run detection + recognition">
            <div className="border-2 border-dashed border-rule rounded-sm h-[220px] flex flex-col items-center justify-center gap-3 bg-[#F6F1E4]">
              <span className="font-mono text-[11px] text-muted uppercase tracking-wide">
                {capturing ? "Running YOLOv8n-face + SFace…" : "Drop or select a classroom photo"}
              </span>
              <button
                onClick={runCapture}
                disabled={capturing}
                className="font-body font-semibold text-[13.5px] bg-ink text-paper px-5 py-2.5 rounded-[3px] disabled:opacity-50 focus-ring"
              >
                {capturing ? "Processing…" : "Run capture"}
              </button>
            </div>

            {/* Show detection stats only when session data is loaded. */}
            {session && (
              <div className="flex justify-between mt-4 font-mono text-[11.5px] text-muted">
                <span>
                  Detected: <b className="text-ink">{session.detected} / {session.enrolled}</b>
                </span>
                <span>
                  Avg. confidence: <b className="text-ink">{session.avgConfidence}%</b>
                </span>
              </div>
            )}
          </Card>

          <Card title="Session summary" sub="Auto-updating as scans come in">
            <table className="w-full text-[13px]">
              <tbody>
                <tr className="border-b border-rule/70">
                  <td className="py-2 font-mono text-muted">Present</td>
                  <td className="py-2 text-right">{roster.filter((r) => r.status === "present").length}</td>
                </tr>
                <tr className="border-b border-rule/70">
                  <td className="py-2 font-mono text-muted">Absent</td>
                  <td className="py-2 text-right">{roster.filter((r) => r.status === "absent").length}</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-muted">Roster size</td>
                  <td className="py-2 text-right">{roster.length}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Manual roll call override panel */}
          <Card title="Roll call override" sub="Manually correct a student's status if needed">
            {roster.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2.5 border-b border-rule/70 last:border-0 text-[13px]"
              >
                <div className="flex items-center gap-3">
                  <span className="roll-tab w-6">{r.roll}</span>
                  <span>{r.name}</span>
                </div>
                <button
                  onClick={() => toggleStatus(r.id)}
                  className="focus-ring rounded-[3px]"
                >
                  <StatusStamp status={r.status}>{r.status}</StatusStamp>
                </button>
              </div>
            ))}
          </Card>

          {/* List of students who need attention for low attendance */}
          <Card title="Low-attendance alerts" sub="Students below the 75% threshold">
            {alerts.map((a) => (
              <div
                key={a.student}
                className="flex gap-2.5 py-2.5 border-b border-rule/70 last:border-0 text-[13px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stamp-amber mt-1.5 shrink-0" />
                <div>
                  <b>{a.student}</b> is {a.detail}.
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  );
}
