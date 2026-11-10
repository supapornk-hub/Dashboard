import { Course, Student, Session, AttendanceRecord } from '../types';

export const INITIAL_SAMPLE_COURSE: Omit<Course, 'id' | 'instructorId'> = {
  code: 'CS102',
  name: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่ (Web App Development)',
  section: '01',
  semester: '2/2567',
  totalSessions: 15,
};

export const INITIAL_SAMPLE_STUDENTS = [
  { studentCode: '65010012', fullName: 'กิตติศักดิ์ อานันท์', nickname: 'กิต' },
  { studentCode: '65010025', fullName: 'ชลธิชา เจริญสุข', nickname: 'นุ่น' },
  { studentCode: '65010038', fullName: 'ณัฐพงษ์ วิริยะกุล', nickname: 'นัท' },
  { studentCode: '65010041', fullName: 'ธนากร สิทธิพรหม', nickname: 'ท็อป' },
  { studentCode: '65010059', fullName: 'ปวีณา พรหมประสิทธิ์', nickname: 'แอน' },
  { studentCode: '65010063', fullName: 'พิชญุตม์ พิทักษ์วงศ์', nickname: 'มาร์ค' },
  { studentCode: '65010077', fullName: 'ภัทรภร ตระกูลทอง', nickname: 'มิ้นท์' },
  { studentCode: '65010084', fullName: 'วรเมธ คงสมบูรณ์', nickname: 'บอส' },
  { studentCode: '65010090', fullName: 'ศศิธร รุ่งโรจน์สกุล', nickname: 'มายด์' },
  { studentCode: '65010103', fullName: 'อนาวิล สุขสำราญ', nickname: 'วิน' },
  { studentCode: '65010116', fullName: 'อภิชญา สิริวัฒนกุล', nickname: 'ใบเตย' },
  { studentCode: '65010129', fullName: 'เกรียงไกร ชัยชนะ', nickname: 'อาร์ม' },
  { studentCode: '65010134', fullName: 'จารุวรรณ บัวหลวง', nickname: 'แพร' },
  { studentCode: '65010148', fullName: 'ธีรเดช ทวีเกียรติ', nickname: 'เต้' },
  { studentCode: '65010152', fullName: 'เบญจมาศ ทองสุข', nickname: 'พลอย' },
  { studentCode: '65010167', fullName: 'พงศกร รัตนวงศ์', nickname: 'ปอนด์' },
  { studentCode: '65010171', fullName: 'รัชชานนท์ มั่นคง', nickname: 'นนท์' },
  { studentCode: '65010185', fullName: 'สิรินดา โสภณพานิช', nickname: 'ดาว' },
  { studentCode: '65010199', fullName: 'อัครพล เลิศวิจิตร', nickname: 'อาร์ท' },
  { studentCode: '65010214', fullName: 'กัญญารัตน์ เทพศิริ', nickname: 'แพง' },
];

export const INITIAL_SAMPLE_SESSIONS = [
  { weekNumber: 1, date: '2026-09-07', title: 'ปฐมนิเทศและสถาปัตยกรรม Web Client-Server' },
  { weekNumber: 2, date: '2026-09-14', title: 'Modern JavaScript (ES6+) และ TypeScript เบื้องต้น' },
  { weekNumber: 3, date: '2026-09-21', title: 'React Fundamentals: Component, JSX & Props' },
  { weekNumber: 4, date: '2026-09-28', title: 'State Management & Effect Lifecycle (สัปดาห์ฝนตกหนัก/รถติด)' },
  { weekNumber: 5, date: '2026-10-05', title: 'Forms, Validation และการติดต่อ Restful APIs' },
  { weekNumber: 6, date: '2026-10-12', title: 'Firebase Firestore & Cloud Authentication' },
  { weekNumber: 7, date: '2026-10-19', title: 'การทำ Workshop ประยุกต์สร้างมินิโปรเจกต์กลุ่ม' },
  { weekNumber: 8, date: '2026-10-26', title: 'สรุปเตรียมสอบกลางภาคและการทบทวนโจทย์' },
];
