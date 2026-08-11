import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import CameraCapture from "../../components/CameraCapture.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * AdminEnrollment — "/admin/enrollment"
 *
 * Two things happen on this page, matching the proposal's enrollment phase
 * (section 3.2):
 *   1. ADD A NEW STUDENT — a form that creates a brand-new student record
 *      in the system (name, roll, program, semester). This is a real
 *      database write, not just picking from a pre-existing list. (No
 *      email field — email was removed from student records per request;
 *      see the note above api.createStudent() in services/api.js re: login
 *      credentials if you need a unique identifier for auth later.)
 *   2. ENROLL THEIR FACE — once a student exists (either newly added here,
 *      or already sitting in the queue from registration elsewhere), the
 *      admin opens the camera and captures 10-20 photos of their face,
 *      which become that student's stored embedding.
 *
 * MAPS TO (MongoDB-backed FastAPI routes, none built yet — build
 * backend/app/routers/admin.py the same way backend/app/routers/student.py
 * was built, using Motor the same way):
 *
 *   GET  /api/admin/enrollment/queue     -> api.getEnrollmentQueue()
 *     Reads the `students` collection, filtered to docs missing an
 *     `embedding` field, e.g.: students_col.find({"embedding": {"$exists": False}})
 *
 *   POST /api/admin/students             -> api.createStudent(fields)
 *     Inserts a new document into `students`:
 *       { name, roll, program, semester, embedding: null, summary: {...zeroed} }
 *     `roll` should be a unique index (see backend/README.md's index notes)
 *     so two students can't collide on the same roll number.
 *
 *   POST /api/admin/enrollment/:studentId -> api.enrollStudent(id, photos)
 *     Multipart upload of the captured photos. Backend runs each photo
 *     through DeepFace, averages the resulting vectors into one embedding
 *     (per proposal §3.2), and $set's it onto that student's document:
 *       await students_col.update_one({"_id": ObjectId(student_id)}, {"$set": {"embedding": averaged_vector}})
 */
export default function AdminEnrollment() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null); // student currently being face-enrolled
  const [photos, setPhotos] = useState([]); // Blob[] captured via CameraCapture — one photo is enough, see below
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  // "Add new student" form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", fullname: "", email: "", section: "", semester: "", address: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [lastCreated, setLastCreated] = useState(null); // { id, defaultPassword } — shown once, right after creation

  useEffect(() => {
    api.getEnrollmentQueue().then(setQueue);
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /**
   * Creates a brand-new student record (POST /students/) — the backend
   * also creates a login account with a default password of
   * `{student_id}@123`, returned once here so the admin can hand it over.
   */
  async function handleCreateStudent(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const created = await api.createStudent(form);
      setQueue((prev) => [...prev, created]);
      setLastCreated({ id: created.id, defaultPassword: created.defaultPassword });
      setForm({ student_id: "", fullname: "", email: "", section: "", semester: "", address: "" });
      setShowAddForm(false);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function openEnrollFor(student) {
    setActiveStudent(student);
    setPhotos([]);
    setEnrollError("");
  }

  /**
   * POST /faces/enroll — one photo, must contain exactly one clear face.
   * The backend rejects (400) photos with zero or more than one face; that
   * message is surfaced here instead of silently failing.
   */
  async function submitEnrollment() {
    if (!activeStudent || photos.length === 0) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      await api.enrollStudent(activeStudent.id, photos[0]);
      setQueue((prev) => prev.filter((s) => s.id !== activeStudent.id));
      setActiveStudent(null);
      setPhotos([]);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <Topbar
        title="Enrollment"
        sub="Add students and capture their face enrollment"
        basePath="/admin"
        who={user?.name}
        unreadCount={2}
        right={
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="font-mono text-[11.5px] bg-ink text-paper rounded-[3px] px-3.5 py-2 hover:opacity-90 transition-opacity focus-ring"
          >
            {showAddForm ? "Cancel" : "+ Add new student"}
          </button>
        }
      />

      {/* ---------------------------------------------------------------
          STEP 1: add a brand-new student record to the system
         --------------------------------------------------------------- */}
      {lastCreated && (
        <Card className="mb-5">
          <div className="text-[13px]">
            <b>{lastCreated.id}</b> created. Default login password:{" "}
            <code className="bg-paper2 px-1.5 py-0.5 rounded-[3px] font-mono">{lastCreated.defaultPassword}</code>
            {" "}— share this with the student now, it won't be shown again.
          </div>
        </Card>
      )}

      {showAddForm && (
        <Card title="New student" sub="Creates the record and a login account — face enrollment happens after, below" className="mb-5">
          {createError && <div className="text-[13px] text-stamp-red mb-3">{createError}</div>}
          <form onSubmit={handleCreateStudent} className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-muted mb-1">Full name</label>
              <input required value={form.fullname} onChange={(e) => updateField("fullname", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Student ID</label>
              <input required value={form.student_id} onChange={(e) => updateField("student_id", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Section</label>
              <input required placeholder="A" value={form.section} onChange={(e) => updateField("section", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Semester</label>
              <input required type="number" min="1" max="8" value={form.semester} onChange={(e) => updateField("semester", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Address</label>
              <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} className="w-full border border-rule rounded-[3px] px-2.5 py-2 text-[13px] focus-ring" />
            </div>
            <button type="submit" disabled={creating} className="md:col-span-3 bg-stamp-green text-paper font-semibold text-[13px] py-2.5 rounded-[3px] disabled:opacity-50 focus-ring">
              {creating ? "Creating…" : "Create student & add to queue"}
            </button>
          </form>
        </Card>
      )}

      {/* ---------------------------------------------------------------
          STEP 2: pick someone from the queue and capture their face
         --------------------------------------------------------------- */}
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-5">
        <Card title={`Queue (${queue.length})`} sub="Click a student to begin face enrollment">
          {queue.length === 0 ? (
            <div className="text-[13px] text-muted py-6 text-center">Queue is empty — add a student above, or everyone's enrolled.</div>
          ) : (
            queue.map((q) => (
              <button
                key={q.id}
                onClick={() => openEnrollFor(q)}
                className={`w-full flex items-center justify-between py-2.5 px-2 -mx-2 rounded-[3px] border-b border-rule/70 last:border-0 text-[13px] text-left transition-colors focus-ring ${
                  activeStudent?.id === q.id ? "bg-stamp-greenDim" : "hover:bg-paper2/60"
                }`}
              >
                <span>{q.name} · <span className="text-muted">{q.meta}</span></span>
                <span className="font-mono text-[10.5px] text-stamp-green">Enroll →</span>
              </button>
            ))
          )}
        </Card>

        <Card
          title={activeStudent ? `Enrolling: ${activeStudent.name}` : "Select a student"}
          sub={activeStudent ? "Capture one clear, front-facing photo of their face" : "Nothing selected yet"}
        >
          {!activeStudent ? (
            <div className="text-[13px] text-muted py-6 text-center">
              Pick someone from the queue on the left.
            </div>
          ) : (
            <>
              {/* Live camera capture — one photo, must contain exactly one face */}
              <CameraCapture
                label="Face the camera at the student, capture one clear photo"
                maxShots={1}
                onShotsChange={setPhotos}
              />

              {enrollError && <div className="text-[13px] text-stamp-red my-2">{enrollError}</div>}

              <button
                onClick={submitEnrollment}
                disabled={photos.length === 0 || enrolling}
                className="w-full bg-stamp-green text-paper font-semibold text-[13.5px] py-2.5 rounded-[3px] disabled:opacity-50 focus-ring mt-3"
              >
                {enrolling ? "Generating embedding…" : "Submit enrollment"}
              </button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
