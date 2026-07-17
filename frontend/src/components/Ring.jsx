/*
  Ring.jsx renders a small circular progress indicator.
  It uses a CSS conic-gradient to show the attendance percentage visually.
*/
export default function Ring({ percent, label = "PRESENT" }) {
  return (
    <div
      className="w-[104px] h-[104px] rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `conic-gradient(#2F6B4F 0% ${percent}%, #EAE3D2 ${percent}% 100%)`,
      }}
    >
      <div className="w-[76px] h-[76px] rounded-full bg-[#FBF9F3] flex flex-col items-center justify-center">
        <b className="font-display text-[19px] leading-none">{percent}%</b>
        <span className="font-mono text-[9px] text-muted mt-1">{label}</span>
      </div>
    </div>
  );
}
