import { Link } from "react-router-dom";
import StatusStamp from "../components/StatusStamp.jsx";

// Static content describing the recognition pipeline (proposal section 3.3).
// Purely presentational — no backend data needed for this page at all.
const STAGES = [
  {
    n: "01",
    t: "Capture",
    d: "A single classroom photograph is taken at the start of class and uploaded through the web interface — no per-student action needed.",
  },
  {
    n: "02",
    t: "Detect",
    d: "OpenCV YuNet locates every face in the frame at once, built for the group scenarios a classroom photo actually produces.",
  },
  {
    n: "03",
    t: "Match",
    d: "DeepFace (SFace) converts each face into a 128-dimensional embedding and compares it against enrolled student vectors by cosine similarity.",
  },
  {
    n: "04",
    t: "Record",
    d: "Every match above threshold is written to MongoDB and reflected instantly on the student, faculty, and admin dashboards.",
  },
];

const STACK = [
  "FastAPI", "OpenCV YuNet", "DeepFace · SFace", "MongoDB", "JWT + bcrypt", "React + Tailwind",
];

const TEAM = [
  { i: "AS", n: "Aayushman Shrestha", r: "231501", role: "API routes, JWT auth, MongoDB queries" },
  { i: "DK", n: "Dipeen Kaucha Magar", r: "231513", role: "OpenCV YuNet detection, DeepFace recognition, enrollment pipeline" },
  { i: "SP", n: "Sittal Pantha", r: "231534", role: "React dashboard, routing, documentation" },
];

/**
 * Landing — the public "/" route. First page anyone hits. No auth required,
 * no API calls; everything here is static content pulled straight from the
 * proposal. The only interactive elements are the two links into /login.
 */
export default function Landing() {
  return (
    <div className="bg-paper text-ink">
      {/* ---------- NAV ---------- */}
      <header className="flex items-center justify-between px-[6vw] py-5 border-b border-rule">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-stamp-green rounded-[2px]" />
          <span className="font-display font-semibold text-[16px]">AttendSys</span>
        </div>
        <nav className="hidden md:flex gap-8 font-mono text-[12.5px] text-muted uppercase tracking-wide">
          <a href="#pipeline" className="hover:text-ink">Pipeline</a>
          <a href="#stack" className="hover:text-ink">Stack</a>
          <a href="#team" className="hover:text-ink">Team</a>
        </nav>
        <Link
          to="/login"
          className="font-mono text-[12.5px] border border-ink/20 rounded-[3px] px-4 py-2 hover:border-ink hover:bg-ink hover:text-paper transition-colors focus-ring"
        >
          Open dashboard →
        </Link>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="ledger-bg px-[6vw] py-20 grid md:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-stamp-green mb-5">
            Minor Project · Pokhara University · NCIT
          </div>
          <h1 className="font-display font-semibold text-[clamp(32px,4.4vw,54px)] leading-[1.05] max-w-[14ch]">
            The class register, marked by the room itself.
          </h1>
          <p className="text-[16px] leading-relaxed text-ink2/80 max-w-[46ch] mt-6">
            One photograph at the start of class. OpenCV YuNet finds every
            student in frame, DeepFace confirms who they are, and attendance
            lands in the register before roll call would have even started.
          </p>
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link
              to="/login"
              className="font-body font-semibold text-[14.5px] bg-ink text-paper px-6 py-3 rounded-[3px] hover:opacity-90 transition-opacity focus-ring"
            >
              Explore the dashboards
            </Link>
            <a
              href="#pipeline"
              className="font-body font-semibold text-[14.5px] border border-ink/25 px-6 py-3 rounded-[3px] hover:border-ink transition-colors focus-ring"
            >
              How recognition works
            </a>
          </div>
        </div>

        {/* Decorative "register page" preview — entirely static/hardcoded,
            just illustrates what a capture session produces. Not wired to
            any data source on purpose. */}
        <div className="bg-[#FBF9F3] border border-rule rounded-sm p-6 shadow-[0_1px_0_#D9D0B9,0_18px_40px_-24px_rgba(30,38,32,0.35)] relative">
          <div className="flex justify-between items-baseline mb-4 font-mono text-[11px] text-muted uppercase tracking-wide">
            <span>Computer Networks · Room 204</span>
            <span>10:02 AM</span>
          </div>
          <div className="ledger-bg -mx-2 px-2">
            {[
              { roll: "01", name: "Aayushman Shrestha", conf: "96.7%" },
              { roll: "13", name: "Dipeen Kaucha Magar", conf: "98.2%" },
              { roll: "34", name: "Sittal Pantha", conf: "97.4%" },
            ].map((r) => (
              <div key={r.roll} className="flex items-center justify-between py-[6px] text-[13.5px]">
                <div className="flex items-center gap-3">
                  <span className="roll-tab w-6">{r.roll}</span>
                  <span>{r.name}</span>
                </div>
                <span className="font-mono text-[11px] text-muted">{r.conf}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <StatusStamp status="present">Present · 22 / 28</StatusStamp>
            <span className="font-mono text-[10.5px] text-muted">cosine ≥ 0.6</span>
          </div>
        </div>
      </section>

      {/* ---------- PIPELINE ---------- */}
      <section id="pipeline" className="px-[6vw] py-16 border-t border-rule">
        <div className="flex justify-between items-end flex-wrap gap-3 mb-10">
          <h2 className="font-display font-semibold text-[26px]">The four-step pipeline</h2>
          <p className="text-[13.5px] text-muted max-w-[38ch]">
            Every capture session runs the same sequence, end to end, in under
            ten seconds for a full classroom.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {STAGES.map((s) => (
            <div key={s.n} className="border border-rule rounded-sm p-5 bg-[#FBF9F3]">
              <div className="font-mono text-[11px] text-stamp-green mb-3">{s.n}</div>
              <h3 className="font-display font-semibold text-[16px] mb-2">{s.t}</h3>
              <p className="text-[13px] text-ink2/75 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- STACK STRIP ---------- */}
      <section id="stack" className="bg-ink text-paper px-[6vw] py-9 flex justify-between items-center flex-wrap gap-5">
        <span className="font-mono text-[11.5px] text-paper/50 uppercase tracking-[0.1em]">
          Built with
        </span>
        <div className="flex gap-2.5 flex-wrap">
          {STACK.map((s) => (
            <span key={s} className="font-mono text-[12px] border border-white/15 rounded-full px-3.5 py-[7px] text-paper/85">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- OBJECTIVES / SCOPE ---------- */}
      <section className="px-[6vw] py-16 border-t border-rule grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display font-semibold text-[24px] mb-4">What it replaces</h2>
          <ul className="space-y-3 text-[14px] text-ink2/80">
            <li className="flex gap-3"><span className="text-stamp-red font-mono">✕</span>Proxy attendance — one student answering for another.</li>
            <li className="flex gap-3"><span className="text-stamp-red font-mono">✕</span>5–10 minutes lost to roll call, every class, every day.</li>
            <li className="flex gap-3"><span className="text-stamp-red font-mono">✕</span>End-of-semester percentage errors that block exam eligibility.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display font-semibold text-[24px] mb-4">What it guarantees</h2>
          <ul className="space-y-3 text-[14px] text-ink2/80">
            <li className="flex gap-3"><span className="text-stamp-green font-mono">✓</span>≥ 85% recognition accuracy under standard classroom lighting.</li>
            <li className="flex gap-3"><span className="text-stamp-green font-mono">✓</span>Under 10 seconds from photo to database record.</li>
            <li className="flex gap-3"><span className="text-stamp-green font-mono">✓</span>Real-time visibility for students, faculty, and admins alike.</li>
          </ul>
        </div>
      </section>

      {/* ---------- TEAM ---------- */}
      <section id="team" className="px-[6vw] py-16 border-t border-rule">
        <h2 className="font-display font-semibold text-[24px] mb-8">Submitted by</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {TEAM.map((m) => (
            <div key={m.r} className="border border-rule rounded-sm p-5 bg-[#FBF9F3]">
              <div className="w-10 h-10 rounded-[6px] bg-stamp-green/10 border border-stamp-green/40 flex items-center justify-center font-mono text-[12px] text-stamp-green mb-4">
                {m.i}
              </div>
              <h4 className="font-display font-semibold text-[15px]">{m.n}</h4>
              <span className="font-mono text-[11px] text-muted">Roll {m.r}</span>
              <p className="text-[13px] text-ink2/75 mt-2 leading-relaxed">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-[6vw] py-7 border-t border-rule flex justify-between flex-wrap gap-2 font-mono text-[11.5px] text-muted">
        <span>SMART ATTENDANCE SYSTEM · NCIT, BALKUMARI, LALITPUR</span>
        <span>POKHARA UNIVERSITY · BE (IT) MINOR PROJECT</span>
      </footer>
    </div>
  );
}
