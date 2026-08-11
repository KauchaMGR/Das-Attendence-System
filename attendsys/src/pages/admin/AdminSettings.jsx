import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminSettings — "/admin/settings"
 *
 * System-wide configuration, now persisted for real in MongoDB (a
 * `system_settings` singleton document) instead of mocked. Includes the new
 * "History window" field (`historyDays`) that drives every "last N days"
 * widget across all three dashboards (Student heatmap, Faculty alerts/
 * records/reports, Admin overview/reports) — see DOCUMENTATION.md §8.
 *
 * Maps to: GET/PUT /settings/ -> api.getSystemSettings()/updateSystemSettings()
 */
export default function AdminSettings() {
  const { user, refreshSettings } = useAuth();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAdminSettings().then(setSettings);
  }, []);

  function updateField(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateAdminSettings(settings);
      setSettings(updated);
      await refreshSettings(); // so every other page's "last N days" widgets pick up the new value on next navigation
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <>
        <Topbar title="Settings" basePath="/admin" who={user?.name} />
        <div className="text-muted text-sm">Loading…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Settings" sub="System-wide configuration" basePath="/admin" who={user?.name} unreadCount={2} />

      {error && <div className="text-[13px] text-stamp-red mb-3">{error}</div>}

      <Card title="History window" sub="How many days of history every dashboard's 'last N days' widgets show">
        <label className="block text-[12px] text-muted mb-1">Days (Student heatmap, Faculty alerts/records/reports, Admin overview/reports)</label>
        <input
          type="number"
          min="7"
          max="60"
          value={settings.historyDays}
          onChange={(e) => updateField("historyDays", Number(e.target.value))}
          className="w-full border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
        />
        <p className="text-[12px] text-muted mt-1.5">
          Saturdays and Sundays inside this window are never counted as absences. Default: 14.
        </p>
      </Card>

      <Card title="Recognition" sub="Controls the face-matching pipeline (proposal §5.3)" className="mt-5">
        <div className="mb-5">
          <div className="flex justify-between text-[13px] mb-2">
            <label>Cosine similarity threshold</label>
            <b className="font-mono">{settings.cosineThreshold.toFixed(2)}</b>
          </div>
          <input
            type="range"
            min="0.4"
            max="0.8"
            step="0.05"
            value={settings.cosineThreshold}
            onChange={(e) => updateField("cosineThreshold", Number(e.target.value))}
            className="w-full accent-stamp-green"
          />
          <p className="text-[12px] text-muted mt-1.5">
            Higher = fewer false matches, but more real students go unrecognized. Proposal default: 0.6.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <Card title="Attendance policy">
          <label className="block text-[12px] text-muted mb-1">Minimum attendance % for exam eligibility</label>
          <input
            type="number"
            min="0"
            max="100"
            value={settings.minAttendancePct}
            onChange={(e) => updateField("minAttendancePct", Number(e.target.value))}
            className="w-full border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
          />
        </Card>

        <Card title="Session behavior">
          <label className="block text-[12px] text-muted mb-1">Faculty session timeout (minutes)</label>
          <input
            type="number"
            min="10"
            max="180"
            value={settings.sessionTimeoutMinutes}
            onChange={(e) => updateField("sessionTimeoutMinutes", Number(e.target.value))}
            className="w-full border border-rule rounded-[3px] px-3 py-2 text-[13px] bg-white focus-ring"
          />
        </Card>
      </div>

      <Card className="mt-5">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-[13.5px] font-semibold">Email alerts</div>
            <div className="text-[12px] text-muted mt-0.5">Send low-attendance warnings to students automatically</div>
          </div>
          <input
            type="checkbox"
            checked={settings.emailAlertsEnabled}
            onChange={(e) => updateField("emailAlertsEnabled", e.target.checked)}
            className="w-5 h-5 accent-stamp-green"
          />
        </label>
      </Card>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-ink text-paper font-semibold text-[13.5px] px-6 py-2.5 rounded-[3px] disabled:opacity-50 focus-ring"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {savedAt && <span className="font-mono text-[11px] text-muted">Saved at {savedAt}</span>}
      </div>
    </>
  );
}
