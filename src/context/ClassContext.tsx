import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import {
  Course,
  Student,
  Session,
  AttendanceRecord,
  AttendanceStatus,
  StudentStats,
  WeeklyStat,
  RiskCategory,
} from '../types';
import {
  INITIAL_SAMPLE_COURSE,
  INITIAL_SAMPLE_STUDENTS,
  INITIAL_SAMPLE_SESSIONS,
} from '../data/sampleData';

interface ClassContextType {
  courses: Course[];
  activeCourse: Course | null;
  students: Student[];
  sessions: Session[];
  activeSession: Session | null;
  attendanceMap: Record<string, AttendanceRecord>; // studentId -> AttendanceRecord for activeSession
  allAttendance: AttendanceRecord[];
  loading: boolean;
  studentStats: StudentStats[];
  weeklyStats: WeeklyStat[];
  lowestAttendanceWeek: WeeklyStat | null;
  alertStudents: StudentStats[]; // Students with consecutive absences >= 2
  selectCourse: (courseId: string) => void;
  selectSession: (sessionId: string) => void;
  createCourse: (data: Omit<Course, 'id' | 'instructorId'>) => Promise<Course>;
  createStudent: (data: { studentCode: string; fullName: string; nickname?: string; email?: string }) => Promise<void>;
  importStudentsBatch: (pastedText: string) => Promise<number>;
  createSession: (data: { weekNumber: number; date: string; title: string }) => Promise<Session>;
  markAttendance: (studentId: string, status: AttendanceStatus) => Promise<void>;
  markAllPresent: () => Promise<void>;
  setParticipation: (studentId: string, score: number) => Promise<void>;
  saveNote: (studentId: string, note: string) => Promise<void>;
  seedSampleClassroom: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active course
  const activeCourse = useMemo(
    () => courses.find((c) => c.id === activeCourseId) || courses[0] || null,
    [courses, activeCourseId]
  );

  // Active session
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[sessions.length - 1] || sessions[0] || null,
    [sessions, activeSessionId]
  );

  // Sync courses for current user
  useEffect(() => {
    if (!user) {
      setCourses([]);
      setStudents([]);
      setSessions([]);
      setAllAttendance([]);
      setLoading(false);
      return;
    }

    if (isDemoUser) {
      // Local demo storage
      const localCourses = localStorage.getItem(`classpulse_courses_${user.uid}`);
      if (localCourses) {
        try {
          const parsed = JSON.parse(localCourses);
          setCourses(parsed);
          if (parsed.length > 0 && !activeCourseId) {
            setActiveCourseId(parsed[0].id);
          }
        } catch {
          // fallback
        }
      }
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'courses'), where('instructorId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Course[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Course);
        });
        setCourses(list);
        if (list.length > 0 && !activeCourseId) {
          setActiveCourseId(list[0].id);
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'courses');
      }
    );

    return () => unsubscribe();
  }, [user, isDemoUser]);

  // Sync students and sessions when activeCourse changes
  useEffect(() => {
    if (!user || !activeCourse) {
      setStudents([]);
      setSessions([]);
      return;
    }

    if (isDemoUser) {
      const localStudents = localStorage.getItem(`classpulse_students_${activeCourse.id}`);
      const localSessions = localStorage.getItem(`classpulse_sessions_${activeCourse.id}`);
      const localAtt = localStorage.getItem(`classpulse_att_${activeCourse.id}`);

      if (localStudents) setStudents(JSON.parse(localStudents));
      if (localSessions) {
        const sList: Session[] = JSON.parse(localSessions);
        setSessions(sList);
        if (sList.length > 0 && !activeSessionId) {
          setActiveSessionId(sList[sList.length - 1].id);
        }
      }
      if (localAtt) setAllAttendance(JSON.parse(localAtt));
      return;
    }

    // Students listener
    const studentsQ = query(
      collection(db, 'students'),
      where('instructorId', '==', user.uid),
      where('courseId', '==', activeCourse.id)
    );
    const unsubStudents = onSnapshot(
      studentsQ,
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Student));
        // Sort by studentCode
        list.sort((a, b) => a.studentCode.localeCompare(b.studentCode));
        setStudents(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'students')
    );

    // Sessions listener
    const sessionsQ = query(
      collection(db, 'sessions'),
      where('instructorId', '==', user.uid),
      where('courseId', '==', activeCourse.id)
    );
    const unsubSessions = onSnapshot(
      sessionsQ,
      (snapshot) => {
        const list: Session[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Session));
        // Sort by weekNumber ascending
        list.sort((a, b) => a.weekNumber - b.weekNumber);
        setSessions(list);
        if (list.length > 0 && !activeSessionId) {
          setActiveSessionId(list[list.length - 1].id);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'sessions')
    );

    // Attendance records for course
    const attQ = query(
      collection(db, 'attendance'),
      where('instructorId', '==', user.uid),
      where('courseId', '==', activeCourse.id)
    );
    const unsubAtt = onSnapshot(
      attQ,
      (snapshot) => {
        const list: AttendanceRecord[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AttendanceRecord));
        setAllAttendance(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'attendance')
    );

    return () => {
      unsubStudents();
      unsubSessions();
      unsubAtt();
    };
  }, [user, activeCourse, isDemoUser]);

  // Attendance map for active session: studentId -> record
  const attendanceMap = useMemo(() => {
    if (!activeSession) return {};
    const map: Record<string, AttendanceRecord> = {};
    for (const record of allAttendance) {
      if (record.sessionId === activeSession.id) {
        map[record.studentId] = record;
      }
    }
    return map;
  }, [allAttendance, activeSession]);

  // Compute student attendance stats & warning classification
  const studentStats: StudentStats[] = useMemo(() => {
    if (!students.length || !sessions.length) return [];

    const sortedSessions = [...sessions].sort((a, b) => a.weekNumber - b.weekNumber);

    return students.map((student) => {
      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let totalChecked = 0;
      let participationSum = 0;
      let participationEvaluatedCount = 0;

      const recentHistory: StudentStats['recentHistory'] = [];

      // Check session by session in chronological order
      let currentConsecutiveAbsences = 0;
      let maxConsecutiveAbsences = 0;

      for (const sess of sortedSessions) {
        const rec = allAttendance.find(
          (a) => a.sessionId === sess.id && a.studentId === student.id
        );

        if (rec) {
          totalChecked++;
          recentHistory.push({
            sessionId: sess.id,
            weekNumber: sess.weekNumber,
            date: sess.date,
            status: rec.status,
            participationScore: rec.participationScore,
          });

          if (rec.status === 'present') {
            presentCount++;
            currentConsecutiveAbsences = 0;
            participationSum += rec.participationScore;
            participationEvaluatedCount++;
          } else if (rec.status === 'absent') {
            absentCount++;
            currentConsecutiveAbsences++;
            if (currentConsecutiveAbsences > maxConsecutiveAbsences) {
              maxConsecutiveAbsences = currentConsecutiveAbsences;
            }
          } else if (rec.status === 'leave') {
            leaveCount++;
            // Leave does not increment consecutive unexcused absence
            currentConsecutiveAbsences = 0;
          }
        }
      }

      // Calculate attendance rate (percentage of attended / total checked)
      // Standard university rule: Present counts 100%, Leave can be excused or counted separately.
      // Usually attendance percentage = (presentCount / totalChecked) * 100
      const attendanceRate = totalChecked > 0
        ? Math.round((presentCount / totalChecked) * 100)
        : 100;

      const participationAvg = participationEvaluatedCount > 0
        ? Number((participationSum / participationEvaluatedCount).toFixed(1))
        : 0;

      // Group classification required by prompt:
      // ปกติ (80% ขึ้นไป)
      // เฝ้าระวัง (60-79%)
      // เสี่ยง (ต่ำกว่า 60%)
      let riskCategory: RiskCategory = 'normal';
      if (attendanceRate < 60) {
        riskCategory = 'danger';
      } else if (attendanceRate < 80) {
        riskCategory = 'warning';
      }

      // Feature: แจ้งเตือนผู้ที่ขาดเกิน 2 ครั้งติดกัน (>= 2 consecutive absences)
      const isConsecutiveAbsentAlert = currentConsecutiveAbsences >= 2 || maxConsecutiveAbsences >= 2;

      return {
        student,
        totalChecked,
        presentCount,
        absentCount,
        leaveCount,
        attendanceRate,
        participationAvg,
        participationTotal: participationSum,
        consecutiveAbsences: currentConsecutiveAbsences,
        maxConsecutiveAbsences,
        isConsecutiveAbsentAlert,
        riskCategory,
        recentHistory,
      };
    });
  }, [students, sessions, allAttendance]);

  // Alert students who missed 2+ classes in a row
  const alertStudents = useMemo(() => {
    return studentStats.filter((s) => s.isConsecutiveAbsentAlert);
  }, [studentStats]);

  // Compute weekly attendance trends and identify the lowest week
  const weeklyStats: WeeklyStat[] = useMemo(() => {
    if (!sessions.length || !students.length) return [];
    const sorted = [...sessions].sort((a, b) => a.weekNumber - b.weekNumber);

    return sorted.map((sess) => {
      const recordsForSess = allAttendance.filter((a) => a.sessionId === sess.id);
      let present = 0;
      let absent = 0;
      let leave = 0;
      let partSum = 0;
      let partCount = 0;

      for (const r of recordsForSess) {
        if (r.status === 'present') {
          present++;
          partSum += r.participationScore;
          partCount++;
        } else if (r.status === 'absent') {
          absent++;
        } else if (r.status === 'leave') {
          leave++;
        }
      }

      const totalChecked = present + absent + leave;
      const rate = totalChecked > 0 ? Math.round((present / totalChecked) * 100) : 0;
      const avgPart = partCount > 0 ? Number((partSum / partCount).toFixed(1)) : 0;

      return {
        sessionId: sess.id,
        weekNumber: sess.weekNumber,
        date: sess.date,
        title: sess.title,
        presentCount: present,
        absentCount: absent,
        leaveCount: leave,
        totalEnrolled: students.length,
        attendanceRate: rate,
        avgParticipation: avgPart,
      };
    });
  }, [sessions, students, allAttendance]);

  // Find lowest attendance week (หาสัปดาห์ที่การเข้าเรียนต่ำสุด)
  const lowestAttendanceWeek = useMemo(() => {
    if (!weeklyStats.length) return null;
    const checkedWeeks = weeklyStats.filter((w) => w.presentCount + w.absentCount + w.leaveCount > 0);
    if (!checkedWeeks.length) return null;
    return checkedWeeks.reduce((lowest, curr) =>
      curr.attendanceRate < lowest.attendanceRate ? curr : lowest
    );
  }, [weeklyStats]);

  // Actions
  const selectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
  };

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const createCourse = async (data: Omit<Course, 'id' | 'instructorId'>): Promise<Course> => {
    if (!user) throw new Error('User not logged in');
    const courseId = `course_${Date.now()}`;
    const newCourse: Course = {
      ...data,
      id: courseId,
      instructorId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const updated = [...courses, newCourse];
      setCourses(updated);
      localStorage.setItem(`classpulse_courses_${user.uid}`, JSON.stringify(updated));
      setActiveCourseId(courseId);
      return newCourse;
    }

    try {
      await setDoc(doc(db, 'courses', courseId), newCourse);
      setActiveCourseId(courseId);
      return newCourse;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `courses/${courseId}`);
    }
  };

  const createStudent = async (data: {
    studentCode: string;
    fullName: string;
    nickname?: string;
    email?: string;
  }) => {
    if (!user || !activeCourse) throw new Error('No active course');
    const studentId = `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newStudent: Student = {
      id: studentId,
      courseId: activeCourse.id,
      instructorId: user.uid,
      studentCode: data.studentCode.trim(),
      fullName: data.fullName.trim(),
      nickname: data.nickname?.trim() || '',
      email: data.email?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const updated = [...students, newStudent].sort((a, b) => a.studentCode.localeCompare(b.studentCode));
      setStudents(updated);
      localStorage.setItem(`classpulse_students_${activeCourse.id}`, JSON.stringify(updated));
      return;
    }

    try {
      await setDoc(doc(db, 'students', studentId), newStudent);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${studentId}`);
    }
  };

  // Batch import students from raw text (Format: "รหัสนักศึกษา ชื่อ-นามสกุล [ชื่อเล่น]")
  const importStudentsBatch = async (pastedText: string): Promise<number> => {
    if (!user || !activeCourse) throw new Error('No active course');
    const lines = pastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return 0;

    let importedCount = 0;
    const newStudents: Student[] = [];

    for (const line of lines) {
      // Split by tab, comma, or space
      const parts = line.split(/[\t,]+/).map((p) => p.trim());
      let code = '';
      let name = '';
      let nick = '';

      if (parts.length >= 2) {
        code = parts[0];
        name = parts[1];
        if (parts[2]) nick = parts[2];
      } else {
        // Space separated: e.g. "6501001 นายสมชาย ใจดี สม"
        const spaceParts = line.split(/\s+/);
        if (spaceParts.length >= 2) {
          code = spaceParts[0];
          name = spaceParts.slice(1, spaceParts.length > 2 ? 3 : 2).join(' ');
          if (spaceParts.length > 3) nick = spaceParts[spaceParts.length - 1];
        }
      }

      if (code && name) {
        const studentId = `std_${Date.now()}_${importedCount}_${Math.floor(Math.random() * 1000)}`;
        newStudents.push({
          id: studentId,
          courseId: activeCourse.id,
          instructorId: user.uid,
          studentCode: code,
          fullName: name,
          nickname: nick,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        importedCount++;
      }
    }

    if (isDemoUser) {
      const combined = [...students, ...newStudents].sort((a, b) => a.studentCode.localeCompare(b.studentCode));
      setStudents(combined);
      localStorage.setItem(`classpulse_students_${activeCourse.id}`, JSON.stringify(combined));
      return importedCount;
    }

    try {
      const batch = writeBatch(db);
      for (const s of newStudents) {
        batch.set(doc(db, 'students', s.id), s);
      }
      await batch.commit();
      return importedCount;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'students');
    }
  };

  const createSession = async (data: { weekNumber: number; date: string; title: string }): Promise<Session> => {
    if (!user || !activeCourse) throw new Error('No active course');
    const sessionId = `sess_${Date.now()}`;
    const newSession: Session = {
      id: sessionId,
      courseId: activeCourse.id,
      instructorId: user.uid,
      weekNumber: data.weekNumber,
      date: data.date,
      title: data.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const updated = [...sessions, newSession].sort((a, b) => a.weekNumber - b.weekNumber);
      setSessions(updated);
      localStorage.setItem(`classpulse_sessions_${activeCourse.id}`, JSON.stringify(updated));
      setActiveSessionId(sessionId);
      return newSession;
    }

    try {
      await setDoc(doc(db, 'sessions', sessionId), newSession);
      setActiveSessionId(sessionId);
      return newSession;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `sessions/${sessionId}`);
    }
  };

  // Mark single student attendance
  const markAttendance = async (studentId: string, status: AttendanceStatus) => {
    if (!user || !activeCourse || !activeSession) return;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const recordId = `${activeSession.id}_${studentId}`;
    const existing = attendanceMap[studentId];

    const updatedRecord: AttendanceRecord = {
      id: recordId,
      courseId: activeCourse.id,
      sessionId: activeSession.id,
      studentId,
      studentCode: student.studentCode,
      instructorId: user.uid,
      status,
      participationScore: existing?.participationScore ?? (status === 'present' ? 1 : 0),
      note: existing?.note || '',
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const filtered = allAttendance.filter((a) => a.id !== recordId);
      const nextAtt = [...filtered, updatedRecord];
      setAllAttendance(nextAtt);
      localStorage.setItem(`classpulse_att_${activeCourse.id}`, JSON.stringify(nextAtt));
      return;
    }

    try {
      await setDoc(doc(db, 'attendance', recordId), updatedRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `attendance/${recordId}`);
    }
  };

  // Mark All Present (1-click fast mobile action)
  const markAllPresent = async () => {
    if (!user || !activeCourse || !activeSession || !students.length) return;

    const newRecords: AttendanceRecord[] = students.map((std) => {
      const existing = attendanceMap[std.id];
      return {
        id: `${activeSession.id}_${std.id}`,
        courseId: activeCourse.id,
        sessionId: activeSession.id,
        studentId: std.id,
        studentCode: std.studentCode,
        instructorId: user.uid,
        status: 'present',
        participationScore: existing?.participationScore ?? 1,
        note: existing?.note || '',
        updatedAt: new Date().toISOString(),
      };
    });

    if (isDemoUser) {
      const remaining = allAttendance.filter((a) => a.sessionId !== activeSession.id);
      const next = [...remaining, ...newRecords];
      setAllAttendance(next);
      localStorage.setItem(`classpulse_att_${activeCourse.id}`, JSON.stringify(next));
      return;
    }

    try {
      const batch = writeBatch(db);
      for (const rec of newRecords) {
        batch.set(doc(db, 'attendance', rec.id), rec);
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'attendance');
    }
  };

  // Set participation score (0 - 3)
  const setParticipation = async (studentId: string, score: number) => {
    if (!user || !activeCourse || !activeSession) return;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const recordId = `${activeSession.id}_${studentId}`;
    const existing = attendanceMap[studentId];
    const status = existing?.status || 'present';

    const updatedRecord: AttendanceRecord = {
      id: recordId,
      courseId: activeCourse.id,
      sessionId: activeSession.id,
      studentId,
      studentCode: student.studentCode,
      instructorId: user.uid,
      status,
      participationScore: Math.min(3, Math.max(0, score)),
      note: existing?.note || '',
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const filtered = allAttendance.filter((a) => a.id !== recordId);
      const nextAtt = [...filtered, updatedRecord];
      setAllAttendance(nextAtt);
      localStorage.setItem(`classpulse_att_${activeCourse.id}`, JSON.stringify(nextAtt));
      return;
    }

    try {
      await setDoc(doc(db, 'attendance', recordId), updatedRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `attendance/${recordId}`);
    }
  };

  // Save note for attendance
  const saveNote = async (studentId: string, note: string) => {
    if (!user || !activeCourse || !activeSession) return;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const recordId = `${activeSession.id}_${studentId}`;
    const existing = attendanceMap[studentId];
    if (!existing) return;

    const updatedRecord: AttendanceRecord = {
      ...existing,
      note,
      updatedAt: new Date().toISOString(),
    };

    if (isDemoUser) {
      const filtered = allAttendance.filter((a) => a.id !== recordId);
      const nextAtt = [...filtered, updatedRecord];
      setAllAttendance(nextAtt);
      localStorage.setItem(`classpulse_att_${activeCourse.id}`, JSON.stringify(nextAtt));
      return;
    }

    try {
      await setDoc(doc(db, 'attendance', recordId), updatedRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `attendance/${recordId}`);
    }
  };

  // Seed rich sample classroom data (CS102 with 20 students, 8 weeks of sessions, consecutive absence cases)
  const seedSampleClassroom = async () => {
    if (!user) return;
    setLoading(true);

    const courseId = `course_sample_${Date.now()}`;
    const course: Course = {
      ...INITIAL_SAMPLE_COURSE,
      id: courseId,
      instructorId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const studentList: Student[] = INITIAL_SAMPLE_STUDENTS.map((s, idx) => ({
      id: `std_sample_${idx + 1}`,
      courseId,
      instructorId: user.uid,
      studentCode: s.studentCode,
      fullName: s.fullName,
      nickname: s.nickname,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const sessionList: Session[] = INITIAL_SAMPLE_SESSIONS.map((s, idx) => ({
      id: `sess_sample_${idx + 1}`,
      courseId,
      instructorId: user.uid,
      weekNumber: s.weekNumber,
      date: s.date,
      title: s.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Realistic attendance pattern:
    // Student 3 (ณัฐพงษ์) has missed weeks 6, 7, 8 -> consecutive absences >= 2 (ALERT!)
    // Student 8 (วรเมธ) has missed weeks 7, 8 -> consecutive absences = 2 (ALERT!)
    // Student 14 (ธีรเดช) has attendance < 60% (HIGH RISK!)
    // Week 4 has lowest attendance (heavy rain/traffic) around 65%
    const attendanceList: AttendanceRecord[] = [];

    sessionList.forEach((sess, sIdx) => {
      studentList.forEach((std, stdIdx) => {
        let status: AttendanceStatus = 'present';
        let score = Math.floor(Math.random() * 3) + 1; // 1 to 3
        let note = '';

        // Specific cases for testing alerts
        if (stdIdx === 2) { // ณัฐพงษ์
          if (sIdx >= 5) {
            status = 'absent';
            score = 0;
            note = 'ติดต่อไม่ได้';
          }
        } else if (stdIdx === 7) { // วรเมธ
          if (sIdx >= 6) {
            status = 'absent';
            score = 0;
            note = 'ไม่เข้าเรียน 2 สัปดาห์ติด';
          }
        } else if (stdIdx === 13) { // ธีรเดช (เสี่ยง < 60%)
          if (sIdx === 1 || sIdx === 3 || sIdx === 5 || sIdx === 6 || sIdx === 7) {
            status = 'absent';
            score = 0;
          }
        } else if (sIdx === 3) {
          // Week 4 is the lowest attendance week across the class
          if (stdIdx % 3 === 0) {
            status = 'absent';
            score = 0;
            note = 'น้ำท่วมทางเข้ามหาวิทยาลัย';
          } else if (stdIdx % 5 === 0) {
            status = 'leave';
            score = 0;
            note = 'ลาป่วย';
          }
        } else {
          // Natural slight absence variance
          const rnd = Math.random();
          if (rnd < 0.08) {
            status = 'absent';
            score = 0;
          } else if (rnd < 0.14) {
            status = 'leave';
            score = 0;
            note = 'ลากิจ';
          }
        }

        attendanceList.push({
          id: `${sess.id}_${std.id}`,
          courseId,
          sessionId: sess.id,
          studentId: std.id,
          studentCode: std.studentCode,
          instructorId: user.uid,
          status,
          participationScore: score,
          note,
          updatedAt: new Date().toISOString(),
        });
      });
    });

    if (isDemoUser) {
      const nextCourses = [course, ...courses];
      setCourses(nextCourses);
      setActiveCourseId(courseId);
      setStudents(studentList);
      setSessions(sessionList);
      setActiveSessionId(sessionList[sessionList.length - 1].id);
      setAllAttendance(attendanceList);

      localStorage.setItem(`classpulse_courses_${user.uid}`, JSON.stringify(nextCourses));
      localStorage.setItem(`classpulse_students_${courseId}`, JSON.stringify(studentList));
      localStorage.setItem(`classpulse_sessions_${courseId}`, JSON.stringify(sessionList));
      localStorage.setItem(`classpulse_att_${courseId}`, JSON.stringify(attendanceList));
      setLoading(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'courses', course.id), course);
      for (const s of studentList) {
        batch.set(doc(db, 'students', s.id), s);
      }
      for (const sess of sessionList) {
        batch.set(doc(db, 'sessions', sess.id), sess);
      }
      // Firestore batch max 500 writes, 20*8 = 160 + 20 + 8 + 1 = 189 writes (well within 500 limit)
      for (const att of attendanceList) {
        batch.set(doc(db, 'attendance', att.id), att);
      }
      await batch.commit();

      setActiveCourseId(course.id);
      setActiveSessionId(sessionList[sessionList.length - 1].id);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClassContext.Provider
      value={{
        courses,
        activeCourse,
        students,
        sessions,
        activeSession,
        attendanceMap,
        allAttendance,
        loading,
        studentStats,
        weeklyStats,
        lowestAttendanceWeek,
        alertStudents,
        selectCourse,
        selectSession,
        createCourse,
        createStudent,
        importStudentsBatch,
        createSession,
        markAttendance,
        markAllPresent,
        setParticipation,
        saveNote,
        seedSampleClassroom,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
