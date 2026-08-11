import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar.jsx";
import Card from "../../components/Card.jsx";
import NotificationList from "../../components/NotificationList.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * FacultyNotifications — "/faculty/notifications"
 * Maps to: GET /api/faculty/notifications
 * (Reachable via the bell icon in Topbar, same pattern as Student.)
 */
export default function FacultyNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getFacultyNotifications().then(setNotifications);
  }, []);

  function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    // TODO(backend): PATCH /api/faculty/notifications/:id — no api.js
    // function exists for this yet since the route doesn't either; add one
    // the same way api.markNotificationRead() was added for students.
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Topbar title="Notifications" sub={`${unreadCount} unread`} basePath="/faculty" who={user?.name} unreadCount={unreadCount} />
      <Card>
        <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      </Card>
    </>
  );
}
