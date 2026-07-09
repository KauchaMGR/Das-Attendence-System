export const mockStudent = {
  name: "Sittal Pantha",
  roll: "34",
  program: "BEI · Semester 6",
  overallPercent: 87,
  present: 26,
  late: 2,
  absent: 2,
  lastScan: {
    camera: "CAM_01 · Room 204",
    confidence: 98.2,
    time: "10:02:14 AM",
  },
};

export const mockSubjects = [
  { name: "Computer Vision", held: 32, attended: 29, pct: 90.6 },
  { name: "Computer Networks", held: 30, attended: 25, pct: 83.3 },
  { name: "Software Engineering", held: 28, attended: 26, pct: 92.8 },
  { name: "Database Systems", held: 30, attended: 24, pct: 80.0 },
];

export const mockHeatmap = [
  "present", "present", "present", "late", "present", "absent", "present",
  "present", "present", "present", "late", "present", "present", "present",
];

export const mockFacultySession = {
  subject: "Computer Networks",
  section: "BEI Sem 6",
  room: "Room 204",
  time: "10:00 – 11:00 AM",
  detected: 24,
  enrolled: 28,
  avgConfidence: 96.3,
};

export const mockRoster = [
  { id: 1, name: "Dipeen Kaucha Magar", roll: "13", status: "present" },
  { id: 2, name: "Aayushman Shrestha", roll: "01", status: "present" },
  { id: 3, name: "Sittal Pantha", roll: "34", status: "present" },
  { id: 4, name: "Prajwal Bista", roll: "07", status: "absent" },
];

export const mockAlerts = [
  { student: "Prajwal Bista", detail: "68% attendance in this subject" },
  { student: "Nisha Rai", detail: "71% attendance in this subject" },
  { student: "Bikash Lama", detail: "missed 3 consecutive sessions" },
];

export const mockAdminStats = {
  enrolledStudents: 642,
  devicesOnline: "7 / 8",
  scansToday: 2148,
  avgConfidence: 96.8,
};

export const mockDevices = [
  { name: "CAM_01 · Room 204", meta: "Uptime 14d 6h · 421 scans today", online: true },
  { name: "CAM_02 · Room 108", meta: "Uptime 9d 2h · 388 scans today", online: true },
  { name: "CAM_03 · Lab-A", meta: "Uptime 21d 0h · 296 scans today", online: true },
  { name: "CAM_04 · Room 301", meta: "Last seen 3h ago", online: false },
];

export const mockEnrollmentQueue = [
  { name: "Ritika Basnet", meta: "BCT Sem 4" },
  { name: "Suman Adhikari", meta: "BEI Sem 2" },
  { name: "Kritika Sharma", meta: "BCT Sem 6" },
  { name: "Alish Maharjan", meta: "BEI Sem 4" },
];
