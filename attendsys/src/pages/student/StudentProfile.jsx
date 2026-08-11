import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import ProfileView from "../../components/ProfileView.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * StudentProfile — "/student/profile"
 *
 * Shows the logged-in student's account details: name/email from the login
 * response (AuthContext), section/semester/address from GET /students/{id}.
 */
export default function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!user?.studentId) return;
    api.getStudent(user.studentId).then(setStudent).catch(() => setStudent({}));
  }, [user?.studentId]);

  return (
    <>
      <Topbar title="My profile" sub="Account details" basePath="/student" unreadCount={0} />

      <ProfileView
        initial={user?.name?.[0] ?? "?"}
        name={user?.name}
        roleLabel="Student account"
        rows={[
          { label: "Student ID", value: user?.studentId },
          { label: "Email", value: user?.email },
          { label: "Section", value: student?.section },
          { label: "Semester", value: student?.semester },
          { label: "Address", value: student?.address },
        ]}
      />
    </>
  );
}
