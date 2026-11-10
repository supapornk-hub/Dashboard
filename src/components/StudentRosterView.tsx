import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { RiskCategory, StudentStats } from '../types';
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  Download,
  CheckCircle,
  HelpCircle,
  XCircle,
  Clock,
  Sparkles,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

export const StudentRosterView: React.FC = () => {
  const { activeCourse, studentStats, sessions } = useClass();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory | 'all' | 'alert'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter students
  const filteredList = useMemo(() => {
    return studentStats.filter((st) => {
      const matchSearch =
        st.student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.student.nickname && st.student.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedRisk === 'alert') return st.isConsecutiveAbsentAlert;
      if (selectedRisk !== 'all') return st.riskCategory === selectedRisk;

      return true;
    });
  }, [studentStats, searchQuery, selectedRisk]);

  // Export CSV summary
  const handleExportCSV = () => {
    if (!studentStats.length) return;
    const headers = [
      'รหัสนักศึกษา',
      'ชื่อ-นามสกุล',
      'ชื่อเล่น',
      'เช็กแล้วทั้งหมด (ครั้ง)',
      'มา (ครั้ง)',
      'ขาด (ครั้ง)',
      'ลา (ครั้ง)',
      'ร้อยละการเข้าเรียน (%)',
      'กลุ่มสถานะ',
      'ขาดเกิน 2 ครั้งติดกัน',
      'การมีส่วนร่วมเฉลี่ย (เต็ม 3)',
    ];

    const rows = studentStats.map((s) => [
      `"${s.student.studentCode}"`,
      `"${s.student.fullName}"`,
      `"${s.student.nickname || ''}"`,
      s.totalChecked,
      s.presentCount,
      s.absentCount,
      s.leaveCount,
      `${s.attendanceRate}%`,
      s.riskCategory === 'normal' ? 'ปกติ (>=80%)' : s.riskCategory === 'warning' ? 'เฝ้าระวัง (60-79%)' : 'เสี่ยง (<60%)',
      s.isConsecutiveAbsentAlert ? 'ใช่ (เสี่ยง)' : 'ไม่ใช่',
      s.participationAvg,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classpulse_attendance_${activeCourse?.code || 'course'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyStudentInfo = (st: StudentStats) => {
    const text = `${st.student.studentCode} ${st.student.fullName} (เข้าเรียน ${st.attendanceRate}%, ขาด ${st.absentCount} ครั้ง)`;
    navigator.clipboard.writeText(text);
    setCopiedId(st.student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>👥 รายชื่อผู้เรียน & การประเมินความเสี่ยง</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ติดตามสถานะรายบุคคล จัดกลุ่มเฝ้าระวัง และตรวจจับการขาดเรียนต่อเนื่อง
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกรายงาน (CSV)</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedRisk('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedRisk === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ทั้งหมด ({studentStats.length})
            </button>

            <button
              onClick={() => setSelectedRisk('normal')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                selectedRisk === 'normal'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>🟢 ปกติ (≥80%)</span>
            </button>

            <button
              onClick={() => setSelectedRisk('warning')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                selectedRisk === 'warning'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>🟡 เฝ้าระวัง (60-79%)</span>
            </button>

            <button
              onClick={() => setSelectedRisk('danger')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                selectedRisk === 'danger'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>🔴 เสี่ยง (&lt;60%)</span>
            </button>

            <button
              onClick={() => setSelectedRisk('alert')}
              className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                selectedRisk === 'alert'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-100/70 text-rose-900 border-rose-300 hover:bg-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>ขาดเกิน 2 ครั้งติดกัน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table & Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                <th className="py-3 px-4">รหัส / ชื่อ-นามสกุล</th>
                <th className="py-3 px-3 text-center">ร้อยละเข้าเรียน</th>
                <th className="py-3 px-3 text-center">มา / ขาด / ลา</th>
                <th className="py-3 px-3 text-center">การมีส่วนร่วม</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">ประวัติรายสัปดาห์</th>
                <th className="py-3 px-4 text-center">สถานะความเสี่ยง</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบรายชื่อนักศึกษาตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredList.map((st) => {
                  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  let statusText = 'ปกติ (ปลอดภัย)';
                  if (st.riskCategory === 'danger') {
                    badgeBg = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                    statusText = 'เสี่ยงหมดสิทธิ์สอบ';
                  } else if (st.riskCategory === 'warning') {
                    badgeBg = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
                    statusText = 'เฝ้าระวัง';
                  }

                  return (
                    <tr
                      key={st.student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        st.isConsecutiveAbsentAlert ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                                {st.student.studentCode}
                              </span>
                              {st.student.nickname && (
                                <span className="text-xs text-slate-500 font-medium">
                                  ({st.student.nickname})
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-900 mt-0.5">
                              {st.student.fullName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Attendance Percentage */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-base font-black ${
                              st.attendanceRate >= 80
                                ? 'text-emerald-700'
                                : st.attendanceRate >= 60
                                ? 'text-amber-700'
                                : 'text-rose-600'
                            }`}
                          >
                            {st.attendanceRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {st.presentCount}/{st.totalChecked} ครั้ง
                          </span>
                        </div>
                      </td>

                      {/* Counters */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2 font-mono text-xs font-semibold">
                          <span className="text-emerald-700" title="มา">
                            🟢 {st.presentCount}
                          </span>
                          <span className="text-rose-700" title="ขาด">
                            🔴 {st.absentCount}
                          </span>
                          <span className="text-amber-700" title="ลา">
                            🟡 {st.leaveCount}
                          </span>
                        </div>
                      </td>

                      {/* Participation Avg */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{st.participationAvg} ⭐</span>
                        </div>
                      </td>

                      {/* Recent Timeline Dots (Desktop) */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {st.recentHistory.slice(-8).map((h) => (
                            <span
                              key={h.sessionId}
                              className={`w-3 h-3 rounded-full inline-block cursor-default transition-transform hover:scale-125 ${
                                h.status === 'present'
                                  ? 'bg-emerald-500'
                                  : h.status === 'absent'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-400'
                              }`}
                              title={`สัปดาห์ที่ ${h.weekNumber} (${h.date}): ${
                                h.status === 'present' ? 'มา' : h.status === 'absent' ? 'ขาด' : 'ลา'
                              } (การมีส่วนร่วม ${h.participationScore}⭐)`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Risk Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${badgeBg}`}>
                            {statusText}
                          </span>

                          {st.isConsecutiveAbsentAlert && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>ขาดเกิน 2 ครั้งติด!</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => copyStudentInfo(st)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                          title="คัดลอกข้อมูลสรุป"
                        >
                          {copiedId === st.student.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
