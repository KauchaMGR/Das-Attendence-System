import { useEffect, useRef, useState } from "react";

/**
 * ============================================================================
 * CameraCapture — opens the device camera (via getUserMedia) and lets the
 * user snap a still photo, instead of picking a file from disk.
 * ============================================================================
 *
 * Used by:
 *   - Faculty "Capture attendance" (FacultyLiveSession.jsx) — one photo of
 *     the whole classroom, sent to YOLOv8n-face + DeepFace SFace.
 *   - Admin "Enrollment" (AdminEnrollment.jsx) — multiple photos of one
 *     student's face, sent to DeepFace to generate their embedding.
 *
 * HOW IT WORKS:
 *   1. On mount, asks the browser for camera access (navigator.mediaDevices.
 *      getUserMedia) and streams it live into a <video> element.
 *   2. "Capture" draws the current video frame onto a hidden <canvas>, then
 *      converts that canvas to a Blob (an in-memory JPEG file) via
 *      canvas.toBlob(). That Blob is exactly what you'd get from a file
 *      input's <input type="file">, so it can be handed to api.js's upload
 *      functions (triggerCapture, enrollStudent) the same way.
 *   3. Each capture is added to `shots` and shown as a thumbnail strip. The
 *      parent component reads `shots` via the `onShotsChange` callback and
 *      decides when there are "enough" (1 for attendance, several for
 *      enrollment).
 *
 * TODO(backend): `shots` is an array of Blob objects. To actually send one
 * (or all of them) to FastAPI:
 *   const formData = new FormData();
 *   shots.forEach((blob, i) => formData.append("photos", blob, `capture-${i}.jpg`));
 *   await fetch(`${BASE_URL}/faculty/sessions/:id/capture`, { method: "POST", body: formData, headers: authHeader(token) });
 * See api.js's triggerCapture()/enrollStudent() — that's exactly where this
 * FormData construction belongs once those functions stop being mocks.
 *
 * Props:
 *   onShotsChange(shots) — called every time a photo is captured or removed
 *   maxShots             — optional cap on how many photos can be taken (e.g. 20 for enrollment)
 *   label                — small instruction text shown above the camera view
 */
export default function CameraCapture({ onShotsChange, maxShots = 1, label }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [shots, setShots] = useState([]); // array of { blob, url } — url is for the thumbnail preview
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  // Request camera access once, on mount. Cleans up (stops the camera
  // track) on unmount so the browser's camera indicator turns off.
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // prefers the back/rear camera on phones/tablets — swap to "user" for a front-facing selfie-style camera
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (err) {
        // Common causes: user denied permission, no camera present, or
        // running over plain http:// (getUserMedia requires https:// or
        // localhost — worth knowing when you deploy this for real).
        setError(
          err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera permission and reload."
            : "Couldn't access a camera on this device."
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setShots((prev) => {
          const next = [...prev, { blob, url }];
          onShotsChange?.(next.map((s) => s.blob));
          return next;
        });
      },
      "image/jpeg",
      0.9
    );
  }

  function removeShot(index) {
    setShots((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      onShotsChange?.(next.map((s) => s.blob));
      return next;
    });
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-stamp-red/40 rounded-sm h-[220px] flex flex-col items-center justify-center gap-2 bg-stamp-redDim px-6 text-center">
        <span className="text-[13px] text-stamp-red font-semibold">{error}</span>
        <span className="text-[11.5px] text-muted">
          Camera access needs HTTPS (or localhost) and browser permission.
        </span>
      </div>
    );
  }

  return (
    <div>
      {label && <div className="font-mono text-[11px] text-muted uppercase tracking-wide mb-2">{label}</div>}

      <div className="relative rounded-sm overflow-hidden bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-[220px] object-cover" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-paper text-[12px] font-mono">
            Starting camera…
          </div>
        )}
        {/* Hidden canvas used only to grab a still frame — never shown to the user */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={capturePhoto}
          disabled={!ready || shots.length >= maxShots}
          className="font-body font-semibold text-[13.5px] bg-ink text-paper px-5 py-2.5 rounded-[3px] disabled:opacity-50 focus-ring"
        >
          📷 Capture photo
        </button>
        <span className="font-mono text-[11px] text-muted">
          {shots.length} / {maxShots} captured
        </span>
      </div>

      {shots.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {shots.map((s, i) => (
            <div key={s.url} className="relative w-14 h-14 rounded-[3px] overflow-hidden border border-rule">
              <img src={s.url} alt={`capture ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeShot(i)}
                className="absolute top-0 right-0 bg-ink/80 text-paper text-[10px] w-4 h-4 flex items-center justify-center"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
