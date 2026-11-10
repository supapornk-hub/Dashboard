export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'instructor';
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  section: string;
  semester: string;
  instructorId: string;
  totalSessions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  courseId: string;
  studentCode: string;
  fullName: string;
  nickname?: string;
  email?: string;
  instructorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  courseId: string;
  instructorId: string;
  weekNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string; // usually `${sessionId}_${studentId}`
  courseId: string;
  sessionId: string;
  studentId: string;
  studentCode: string;
  instructorId: string;
  status: AttendanceStatus;
  participationScore: number; // 0 - 3
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RiskCategory = 'normal' | 'warning' | 'danger';

export interface StudentStats {
  student: Student;
  totalChecked: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  attendanceRate: number; // 0 - 100 percentage
  participationAvg: number; // 0 - 3
  participationTotal: number;
  consecutiveAbsences: number; // Current ongoing consecutive absences
  maxConsecutiveAbsences: number;
  isConsecutiveAbsentAlert: boolean; // >= 2 consecutive absences
  riskCategory: RiskCategory; // >=80 normal, 60-79 warning, <60 danger
  recentHistory: {
    sessionId: string;
    weekNumber: number;
    date: string;
    status: AttendanceStatus;
    participationScore: number;
  }[];
}

export interface WeeklyStat {
  sessionId: string;
  weekNumber: number;
  date: string;
  title: string;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  totalEnrolled: number;
  attendanceRate: number; // percentage
  avgParticipation: number; // 0 - 3
}
