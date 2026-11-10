import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { AttendanceStatus } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  ChevronRight,
  TrendingDown,
  Calendar,
  Layers,
} from 'lucide-react';

export const CheckInView: React.FC = () => {
  const {
    activeCourse,
    activeSession,
    students,
    attendanceMap,
    markAttendance,
    markAllPresent,
    setParticipation,
    saveNote,
    studentStats,
    seedSampleClassroom,
    loading,
  } = useClass();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unmarked' | 'absent' | 'leave' | 'alert'>('all');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  // Statistics for active session
  const sessionTally = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let unmarked = 0;

    for (const s of students) {
      const rec = attendanceMap[s.id];
      if (!rec) {
        unmarked++;
      } else if (rec.status === 'present') {
        present++;
      } else if (rec.status === 'absent') {
        absent++;
      } else if (rec.status === 'leave') {
        leave++;
      }
    }

    const total = students.length;
    const completed = total - unmarked;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { present, absent, leave, unmarked, total, completed, progressPercent };
  }, [students, attendanceMap]);

  // Lookup stats per student
  const statsMap = useMemo(() => {
    const map: Record<string, (typeof studentStats)[0]> = {};
    for (const stat of studentStats) {
      map[stat.student.id] = stat;
    }
    return map;
  }, [studentStats]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const matchSearch =
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nickname && s.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Filter modes
      const rec = attendanceMap[s.id];
      const st = statsMap[s.id];

      if (filterMode === 'unmarked') return !rec;
      if (filterMode === 'absent') return rec?.status === 'absent';
      if (filterMode === 'leave') return rec?.status === 'leave';
      if (filterMode === 'alert') return st?.isConsecutiveAbsentAlert || st?.riskCategory === 'danger';

      return true;
    });
  }, [students, searchQuery, filterMode, attendanceMap, statsMap]);

  // Handle Mark All Present
  const handleMarkAllPresent = async () => {
    setIsSubmittingAll(true);
    try {
      await markAllPresent();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } finally {
      setIsSubmittingAll(false);
    }
  };

  // Open note drawer/modal
  const handleOpenNote = (studentId: string) => {
    setActiveNoteStudentId(studentId);
    setTempNote(attendanceMap[studentId]?.note || '');
  };

  const handleSaveNote = async () => {
    if (activeNoteStudentId) {
      await saveNote(activeNoteStudentId, tempNote);
      setActiveNoteStudentId(null);
    }
  };

  if (!activeCourse) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-3 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">
          📚
        </div>
        <h3 className="text-lg font-bold text-slate-800">ยังไม่มีรายวิชาในระบบ</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          กรุณาเพิ่มรายวิชาใหม่ หรือโหลดข้อมูลตัวอย่างเพื่อเริ่มทดลองใช้งานระบบทันที
        </p>
        <button
          onClick={() => seedSampleClassroom()}
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-sm text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>โหลดข้อมูลตัวอย่างห้องเรียน (CS102)</span>
        </button>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl">
          🗓️
        </div>
        <h3 className="text-lg font-bold text-slate-800">ยังไม่มีคาบเรียน / สัปดาห์</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          กรุณาเพิ่มสัปดาห์เรียนในเมนู &quot;จัดการวิชา&quot; เพื่อเริ่มเช็กชื่อ
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Sticky Top Header Banner */}
      <div className="bg-white border-b border-slate-200 sticky top-[95px] z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          {/* Active Session Info & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                  สัปดาห์ที่ {activeSession.weekNumber}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {activeSession.date}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                {activeSession.title}
              </h2>
            </div>

            {/* Quick Actions (1-minute attendance trigger) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                disabled={isSubmittingAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="ตั้งค่าให้ผู้เรียนทุกคนในคาบนี้มีสถานะ 'มา' ทันที"
              >
                <CheckCheck className="w-4 h-4" />
                <span>มาทุกคน (Check All)</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-slate-600">
                เช็กแล้ว {sessionTally.completed} จาก {sessionTally.total} คน ({sessionTally.progressPercent}%)
              </span>
              <span className="text-emerald-700 font-bold">
                {sessionTally.unmarked === 0 ? '✨ เช็กครบทั้งห้องแล้ว' : `คงเหลือ ${sessionTally.unmarked} คน`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${(sessionTally.present / (sessionTally.total || 1)) * 100}%` }}
                title={`มา: ${sessionTally.present}`}
              />
              <div
                className="bg-amber-400 transition-all duration-300"
                style={{ width: `${(sessionTally.leave / (sessionTally.total || 1)) * 100}%` }}
                title={`ลา: ${sessionTally.leave}`}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${(sessionTally.absent / (sessionTally.total || 1)) * 100}%` }}
                title={`ขาด: ${sessionTally.absent}`}
              />
            </div>
          </div>

          {/* Status tally counters */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'border-slate-800 bg-slate-800 text-white font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-[10px] sm:text-xs">ทั้งหมด</div>
              <div className="text-sm sm:text-base font-extrabold">{sessionTally.total}</div>
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className="p-1.5 sm:p-2 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 transition-all cursor-pointer"
            >
              <div className="text-[10px] sm:text-xs font-medium text-emerald-700">🟢 มา</div>
              <div className="text-sm sm:text-base font-black text-emerald-800">{sessionTally.present}</div>
            </button>

            <button
              onClick={() => setFilterMode('absent')}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                filterMode === 'absent'
                  ? 'border-rose-600 bg-rose-600 text-white font-bold'
                  : 'border-rose-200 bg-rose-50/80 text-rose-900'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-medium text-rose-700">🔴 ขาด</div>
              <div className="text-sm sm:text-base font-black text-rose-800">{sessionTally.absent}</div>
            </button>

            <button
              onClick={() => setFilterMode('leave')}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                filterMode === 'leave'
                  ? 'border-amber-500 bg-amber-500 text-white font-bold'
                  : 'border-amber-200 bg-amber-50/80 text-amber-900'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-medium text-amber-700">🟡 ลา</div>
              <div className="text-sm sm:text-base font-black text-amber-800">{sessionTally.leave}</div>
            </button>
          </div>

          {/* Search & Alert Filter */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัสนักศึกษา หรือชื่อ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl outline-hidden transition-all"
              />
            </div>

            <button
              onClick={() => setFilterMode(filterMode === 'alert' ? 'all' : 'alert')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                filterMode === 'alert'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>เสี่ยง/ขาดเกิน 2 ครั้ง</span>
            </button>

            <button
              onClick={() => setFilterMode(filterMode === 'unmarked' ? 'all' : 'unmarked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                filterMode === 'unmarked'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>ยังไม่เช็ก ({sessionTally.unmarked})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List (Mobile-First Big Buttons) */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-3 space-y-2.5">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">ไม่พบรายชื่อนักศึกษาตามเงื่อนไขที่เลือก</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterMode('all');
              }}
              className="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
            >
              ล้างการค้นหา
            </button>
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const record = attendanceMap[student.id];
            const currentStatus = record?.status;
            const currentScore = record?.participationScore ?? 0;
            const note = record?.note || '';
            const stats = statsMap[student.id];

            // Risk category styling
            const rate = stats ? stats.attendanceRate : 100;
            const isAlert = stats?.isConsecutiveAbsentAlert;

            let rateBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let rateLabel = 'ปกติ';
            if (rate < 60) {
              rateBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
              rateLabel = 'เสี่ยง (<60%)';
            } else if (rate < 80) {
              rateBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
              rateLabel = 'เฝ้าระวัง';
            }

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-3 sm:p-4 ${
                  isAlert
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : currentStatus
                    ? 'border-slate-200'
                    : 'border-slate-200/80 bg-slate-50/50'
                }`}
              >
                {/* Student identity header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {student.studentCode}
                      </span>

                      {/* Consecutive Absences Alert Badge */}
                      {isAlert && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ขาดเกิน 2 ครั้งติดกัน!</span>
                        </span>
                      )}

                      {/* Cumulative rate badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${rateBadgeClass}`}
                        title={`เข้าเรียนสะสม ${stats?.presentCount || 0}/${stats?.totalChecked || 0} คาบ`}
                      >
                        {rate}% {rateLabel}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {student.fullName}
                      </h4>
                      {student.nickname && (
                        <span className="text-xs text-slate-500 font-medium shrink-0">
                          ({student.nickname})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note icon button */}
                  <button
                    onClick={() => handleOpenNote(student.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                      note
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={note ? `บันทึก: ${note}` : 'เพิ่มบันทึกเพิ่มเติม'}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Attendance Buttons: Mobile-First Big Touch Targets */}
                <div className="grid grid-cols-3 gap-2 my-2.5">
                  {/* มา (Present) */}
                  <button
                    onClick={() => markAttendance(student.id, 'present')}
                    className={`py-3 sm:py-3.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer active:scale-95 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 shadow-md'
                        : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${currentStatus === 'present' ? 'text-white' : 'text-emerald-600'}`}
                    />
                    <span>มา (Present)</span>
                  </button>

                  {/* ขาด (Absent) */}
                  <button
                    onClick={() => markAttendance(student.id, 'absent')}
                    className={`py-3 sm:py-3.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer active:scale-95 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-600 shadow-md'
                        : 'bg-rose-50/70 hover:bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <XCircle
                      className={`w-5 h-5 ${currentStatus === 'absent' ? 'text-white' : 'text-rose-600'}`}
                    />
                    <span>ขาด (Absent)</span>
                  </button>

                  {/* ลา (Leave) */}
                  <button
                    onClick={() => markAttendance(student.id, 'leave')}
                    className={`py-3 sm:py-3.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer active:scale-95 ${
                      currentStatus === 'leave'
                        ? 'bg-amber-500 text-white ring-2 ring-amber-500 shadow-md'
                        : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <Clock
                      className={`w-5 h-5 ${currentStatus === 'leave' ? 'text-white' : 'text-amber-600'}`}
                    />
                    <span>ลา (Leave)</span>
                  </button>
                </div>

                {/* Participation Score Section (0 - 3 Rating) */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>คะแนนการมีส่วนร่วม:</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:w-auto">
                    {[
                      { score: 0, label: '0 ไม่ตอบ' },
                      { score: 1, label: '1 ฟัง/ตอบ' },
                      { score: 2, label: '2 ร่วมมือดี' },
                      { score: 3, label: '3 โดดเด่น ⭐' },
                    ].map((item) => (
                      <button
                        key={item.score}
                        onClick={() => setParticipation(student.id, item.score)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          currentScore === item.score
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note preview if exists */}
                {note && (
                  <div className="mt-2 text-[11px] p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 flex items-center justify-between">
                    <span>
                      <strong>บันทึก:</strong> {note}
                    </span>
                    <button
                      onClick={() => handleOpenNote(student.id)}
                      className="text-amber-700 underline text-[10px] ml-2"
                    >
                      แก้ไข
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Note Edit Modal / Sheet */}
      {activeNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">
                บันทึกหมายเหตุเพิ่มเติม / เหตุผลการลา
              </h3>
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="เช่น ลาป่วยมีใบรับรองแพทย์, ส่งงานช้ากว่ากำหนด, ช่วยตอบคำถามเพื่อน..."
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 font-semibold"
              >
                บันทึกหมายเหตุ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
