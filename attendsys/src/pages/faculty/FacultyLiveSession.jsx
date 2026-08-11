import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import StatusStamp from "../../components/StatusStamp.jsx";
import CameraCapture from "../../components/CameraCapture.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyLiveSession — "/faculty" (index route).
 *
 * There's no "session" concept in the backend (see DOCUMENTATION.md §4/§5)
 * — instead, the faculty's one assigned subject (business rule: one faculty,
 * one subject — see DOCUMENTATION.md §8) drives a session_id derived as
 * `${subjectCode}_${today}`. Re-capturing the same subject on the same day
 * keeps adding to that one session instead of starting a fresh one, so
 * students already matched today don't get duplicate rows (see
 * attendance_service.mark_attendance).
 */
export default function FacultyLiveSession() {
  const { user, settings } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [roster, setRoster] = useState([]);
  const [alerts, setAlerts] = useState({ days: settings.historyDays, alerts: [] });
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [lastResult, setLastResult] = useState(null); // { detected, matched } from the last capture
  const [photoShots, setPhotoShots] = useState([]); // Blob[] from CameraCapture — one classroom photo expected here

  const today = new Date().toISOString().slice(0, 10);
  const sessionId = subjectCode ? `${subjectCode}_${today}` : null;

  useEffect(() => {
    api.getFacultySubjects(user?.subjectsAssigned || []).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) setSubjectCode(subs[0].subject_code);
    });
  }, []);

  useEffect(() => {
    if (sessionId) api.getRoster(sessionId).then(setRoster);
  }, [sessionId]);

  useEffect(() => {
    if (subjectCode) api.getLowAttendanceAlerts(subjectCode, settings.historyDays).then(setAlerts);
  }, [subjectCode, settings.historyDays]);

  function toggleStatus(id) {
    setRoster((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "present" ? "absent" : "present" } : r
      )
    );
  }

  async function runCapture() {
    if (photoShots.length === 0 || !sessionId) return;
    setCapturing(true);
    setCaptureError("");
    try {
      const result = await api.triggerCapture(photoShots[0], {
        subjectCode,
        sessionId,
        markedBy: user?.facultyId || user?.name,
      });
      setLastResult(result);
      await api.getRoster(sessionId).then(setRoster);
    } catch (err) {
      setCaptureError(err.message);
    } finally {
      setCapturing(false);
    }
  }

  const currentSubject = subjects.find((s) => s.subject_code === subjectCode);

  return (
    <>
      <Topbar
        title={currentSubject ? currentSubject.subject_name : "No subject assigned"}
        sub={today}
        basePath="/faculty"
        who={user?.name}
        unreadCount={1}
        right={sessionId && <StatusStamp status="present">Session: {sessionId}</StatusStamp>}
      />

      <div className="grid md:grid-cols-[2fr_1fr] gap-5 mb-5">
        <Card title="Capture attendance" sub="Open the camera and take a photo of the classroom to run detection + recognition">
          {subjects.length === 0 ? (
            <div className="text-[13px] text-muted py-6 text-center">
              No subjects assigned to this account yet — ask an admin to assign one.
            </div>
          ) : (
            <>
              <CameraCapture
                label="Point the camera at the classroom, then capture"
                maxShots={1}
                onShotsChange={setPhotoShots}
              />

              {captureError && <div className="text-[13px] text-stamp-red mt-2">{captureError}</div>}

              <button
                onClick={runCapture}
                disabled={capturing || photoShots.length === 0}
                className="w-full font-body font-semibold text-[13.5px] bg-ink text-paper px-5 py-2.5 rounded-[3px] disabled:opacity-50 focus-ring mt-3"
              >
                {capturing ? "Running detection + recognition…" : "Run capture"}
              </button>

              {lastResult && (
                <div className="flex justify-between mt-4 font-mono text-[11.5px] text-muted">
                  <span>Faces detected: <b className="text-ink">{lastResult.detected}</b></span>
                  <span>Matched: <b className="text-ink">{lastResult.matched}</b></span>
                </div>
              )}
            </>
          )}
        </Card>

        <Card title="Session summary" sub="Auto-updating as scans come in">
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-rule/70"><td className="py-2 font-mono text-muted">Present</td><td className="py-2 text-right">{roster.filter((r) => r.status === "present").length}</td></tr>
              <tr><td className="py-2 font-mono text-muted">Roster size</td><td className="py-2 text-right">{roster.length}</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Roll call" sub="Everyone matched for this session so far">
          {roster.length === 0 ? (
            <div className="text-[13px] text-muted py-6 text-center">No one matched yet — run a capture above.</div>
          ) : (
            roster.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-rule/70 last:border-0 text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="roll-tab w-6">{r.roll}</span>
                  <span>{r.name}</span>
                </div>
                <button onClick={() => toggleStatus(r.id)} className="focus-ring rounded-[3px]">
                  <StatusStamp status={r.status}>{r.status}</StatusStamp>
                </button>
              </div>
            ))
          )}
        </Card>

        <Card title="Low-attendance alerts" sub={`Last ${alerts.days} days · below 75% · Sat/Sun excluded`}>
          {alerts.alerts.length === 0 ? (
            <div className="text-[13px] text-muted py-4">No students below threshold in this window.</div>
          ) : (
            alerts.alerts.map((a) => (
              <div key={a.student} className="flex gap-2.5 py-2.5 border-b border-rule/70 last:border-0 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-stamp-amber mt-1.5 shrink-0" />
                <div><b>{a.student}</b> — {a.detail}.</div>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
