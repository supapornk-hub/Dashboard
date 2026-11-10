import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import {
  BookOpen,
  Calendar,
  UserPlus,
  FileSpreadsheet,
  Plus,
  Sparkles,
  CheckCircle2,
  Trash2,
  Layers,
  Info,
} from 'lucide-react';

export const CourseManager: React.FC = () => {
  const {
    courses,
    activeCourse,
    students,
    sessions,
    createCourse,
    createStudent,
    importStudentsBatch,
    createSession,
    seedSampleClassroom,
    loading,
  } = useClass();

  // Create course form state
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSec, setCourseSec] = useState('01');
  const [courseSemester, setCourseSemester] = useState('2/2567');
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  // Batch import students state
  const [pastedText, setPastedText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Single student form state
  const [singleCode, setSingleCode] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleNick, setSingleNick] = useState('');

  // New session state
  const [newWeekNum, setNewWeekNum] = useState<number>(sessions.length + 1);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTitle, setNewTitle] = useState('');
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  // Handle create course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    setCourseSubmitting(true);
    try {
      await createCourse({
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        section: courseSec.trim(),
        semester: courseSemester.trim(),
        totalSessions: 15,
      });
      setCourseCode('');
      setCourseName('');
    } finally {
      setCourseSubmitting(false);
    }
  };

  // Handle single student
  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleCode.trim() || !singleName.trim()) return;

    await createStudent({
      studentCode: singleCode.trim(),
      fullName: singleName.trim(),
      nickname: singleNick.trim(),
    });
    setSingleCode('');
    setSingleName('');
    setSingleNick('');
  };

  // Handle batch import
  const handleBatchImport = async () => {
    if (!pastedText.trim()) return;
    setIsImporting(true);
    try {
      const count = await importStudentsBatch(pastedText);
      setImportStatus(`นำเข้ารายชื่อสำเร็จทั้งหมด ${count} คน`);
      setPastedText('');
      setTimeout(() => setImportStatus(null), 4000);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle create session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSessionSubmitting(true);
    try {
      await createSession({
        weekNumber: Number(newWeekNum),
        date: newDate,
        title: newTitle.trim(),
      });
      setNewWeekNum(Number(newWeekNum) + 1);
      setNewTitle('');
    } finally {
      setSessionSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-8 pb-20">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          ⚙️ จัดการวิชา รายชื่อนักศึกษา และคาบเรียน
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          สร้างวิชาใหม่ นำเข้ารายชื่อนักศึกษาเป็นชุด และเพิ่มสัปดาห์เรียน
        </p>
      </div>

      {/* Row 1: Course Info / Create Course */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Course Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>วิชาที่กำลังเลือก ({activeCourse?.code || 'ยังไม่มีวิชา'})</span>
            </h3>
            {activeCourse && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                Active
              </span>
            )}
          </div>

          {activeCourse ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">รหัสวิชา:</span>
                <span className="font-mono font-bold text-slate-800">{activeCourse.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ชื่อวิชา:</span>
                <span className="font-bold text-slate-800">{activeCourse.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">กลุ่มเรียน (Section):</span>
                <span className="font-semibold text-slate-700">{activeCourse.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ภาคเรียน:</span>
                <span className="font-semibold text-slate-700">{activeCourse.semester}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">จำนวนนักศึกษา:</span>
                <span className="font-bold text-emerald-700">{students.length} คน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">จำนวนสัปดาห์เรียน:</span>
                <span className="font-bold text-emerald-700">{sessions.length} คาบ</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              ยังไม่มีวิชาที่เลือกในขณะนี้
            </div>
          )}

          {/* Quick Seed button */}
          <div className="pt-2">
            <button
              onClick={() => seedSampleClassroom()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>โหลดข้อมูลตัวอย่างครบวงจร (นักศึกษา 20 คน + 8 สัปดาห์)</span>
            </button>
          </div>
        </div>

        {/* Create Course Form */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>สร้างรายวิชาใหม่ (New Course)</span>
          </h3>

          <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">รหัสวิชา</label>
                <input
                  type="text"
                  placeholder="เช่น CS101, IT204"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">กลุ่มเรียน (Section)</label>
                <input
                  type="text"
                  placeholder="เช่น 01, 201"
                  value={courseSec}
                  onChange={(e) => setCourseSec(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">ชื่อวิชา</label>
              <input
                type="text"
                placeholder="เช่น การเขียนโปรแกรมเว็บแอปพลิเคชัน"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">ภาคเรียน/ปีการศึกษา</label>
              <input
                type="text"
                placeholder="เช่น 1/2567, 2/2567"
                value={courseSemester}
                onChange={(e) => setCourseSemester(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={courseSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {courseSubmitting ? 'กำลังบันทึก...' : 'บันทึกวิชาใหม่'}
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: Student Import & Management */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>นำเข้ารายชื่อนักศึกษาแบบชุดรวดเร็ว (Fast Batch Import)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คัดลอกจาก Excel หรือ Google Sheets แล้ววางลงในช่องด้านล่าง (1 บรรทัดต่อนักศึกษา 1 คน)
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl shrink-0">
            วิชาปัจจุบัน: {activeCourse ? activeCourse.code : 'ยังไม่เลือก'}
          </span>
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="space-y-2">
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`ตัวอย่างรูปแบบข้อความ:\n6501001\tนายสมชาย ใจดี\tสม\n6501002\tนางสาวสุดาพร มีสุข\tดา\n6501003\tนายกิตติกร รักเรียน`}
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>คั่นข้อมูลด้วย Tab หรือช่องว่าง: [รหัส] [ชื่อ-นามสกุล] [ชื่อเล่น (ไม่บังคับ)]</span>
            </div>

            <button
              onClick={handleBatchImport}
              disabled={isImporting || !pastedText.trim() || !activeCourse}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-40"
            >
              {isImporting ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้ารายชื่อทันที'}
            </button>
          </div>
        </div>

        {/* Single Student Add Collapse */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2">หรือเพิ่มนักศึกษาทีละคน:</h4>
          <form onSubmit={handleAddSingleStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <input
              type="text"
              placeholder="รหัสนักศึกษา (เช่น 6501001)"
              value={singleCode}
              onChange={(e) => setSingleCode(e.target.value)}
              required
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-mono"
            />
            <input
              type="text"
              placeholder="ชื่อ - นามสกุล"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              required
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden sm:col-span-2"
            />
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="ชื่อเล่น"
                value={singleNick}
                onChange={(e) => setSingleNick(e.target.value)}
                className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              />
              <button
                type="submit"
                disabled={!activeCourse}
                className="w-1/2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                + เพิ่ม
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 3: Session / Weekly Class Management */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>เพิ่มสัปดาห์เรียน / คาบเรียน (Add Week / Session)</span>
        </h3>

        <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">สัปดาห์ที่ (Week)</label>
            <input
              type="number"
              min={1}
              max={52}
              value={newWeekNum}
              onChange={(e) => setNewWeekNum(Number(e.target.value))}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">วันที่สอน</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">หัวข้อการสอน / กิจกรรม</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="เช่น การพัฒนาเว็บด้วย React และ Firebase"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              />
              <button
                type="submit"
                disabled={sessionSubmitting || !activeCourse}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
              >
                {sessionSubmitting ? '...' : '+ เพิ่มคาบ'}
              </button>
            </div>
          </div>
        </form>

        {/* Existing Sessions List */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold text-slate-700">รายการสัปดาห์เรียนที่บันทึกแล้ว ({sessions.length}):</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 mr-2">W{s.weekNumber}</span>
                  <span className="text-slate-600">{s.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{s.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
