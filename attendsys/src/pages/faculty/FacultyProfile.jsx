import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import ProfileView from "../../components/ProfileView.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyProfile — "/faculty/profile"
 *
 * Shows the logged-in faculty member's account details: name/email from the
 * login response (AuthContext), and the one subject they teach (business
 * rule: one faculty, one subject — see DOCUMENTATION.md §8).
 */
export default function FacultyProfile() {
  const { user } = useAuth();
  const [subjectName, setSubjectName] = useState(null);

  useEffect(() => {
    const code = user?.subjectsAssigned?.[0];
    if (!code) return;
    api.getFacultySubjects([code]).then((subs) => setSubjectName(subs[0]?.subject_name));
  }, [user?.subjectsAssigned]);

  return (
    <>
      <Topbar title="My profile" sub="Account details" basePath="/faculty" unreadCount={0} />

      <ProfileView
        initial={user?.name?.[0] ?? "?"}
        name={user?.name}
        roleLabel="Faculty account"
        rows={[
          { label: "Faculty ID", value: user?.facultyId },
          { label: "Email", value: user?.email },
          { label: "Subject", value: subjectName || user?.subjectsAssigned?.[0] || "Not assigned" },
        ]}
      />
    </>
  );
}
