import LoginForm from "../../components/LoginForm.jsx";

/**
 * FacultyLogin — "/login/faculty"
 */
export default function FacultyLogin() {
  return (
    <LoginForm
      role="faculty"
      roleLabel="Faculty"
      demoName="Prof. R. Karki"
      redirectTo="/faculty"
      accentClass="bg-stamp-amber/10 border border-stamp-amber/30 text-stamp-amber"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="14" rx="1.5" />
          <path d="M3 9h18" />
          <path d="M8 4v5" />
        </svg>
      }
    />
  );
}
