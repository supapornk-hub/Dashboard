import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    activeCourse,
    weeklyStats,
    lowestAttendanceWeek,
    studentStats,
    alertStudents,
    sessions,
  } = useClass();

  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number | null>(null);

  // Overall class attendance rate
  const overallStats = React.useMemo(() => {
    if (!studentStats.length) return { avgRate: 0, normalCount: 0, warningCount: 0, dangerCount: 0 };
    const totalRate = studentStats.reduce((acc, s) => acc + s.attendanceRate, 0);
    const avgRate = Math.round(totalRate / studentStats.length);

    let normalCount = 0;
    let warningCount = 0;
    let dangerCount = 0;

    for (const s of studentStats) {
      if (s.riskCategory === 'normal') normalCount++;
      else if (s.riskCategory === 'warning') warningCount++;
      else if (s.riskCategory === 'danger') dangerCount++;
    }

    return { avgRate, normalCount, warningCount, dangerCount };
  }, [studentStats]);

  // Overall avg participation
  const avgParticipationClass = React.useMemo(() => {
    if (!studentStats.length) return 0;
    const total = studentStats.reduce((acc, s) => acc + s.participationAvg, 0);
    return Number((total / studentStats.length).toFixed(1));
  }, [studentStats]);

  if (!activeCourse || !sessions.length) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
        <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800">ยังไม่มีข้อมูลสถิติเพียงพอ</h3>
        <p className="text-xs text-slate-500 mt-1">
          กรุณาเพิ่มคาบเรียนและเช็กชื่อในหน้าแรกเพื่อเริ่มดูแดชบอร์ดวิเคราะห์แนวโน้ม
        </p>
      </div>
    );
  }

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Compute SVG Points for Weekly Attendance Line
  const points = weeklyStats.map((w, idx) => {
    const x = paddingX + (idx / Math.max(1, weeklyStats.length - 1)) * usableWidth;
    // y = 0% at bottom (chartHeight - paddingY), 100% at top (paddingY)
    const y = chartHeight - paddingY - (w.attendanceRate / 100) * usableHeight;
    return { x, y, ...w };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // 80% Benchmark line Y
  const benchmarkY = chartHeight - paddingY - (80 / 100) * usableHeight;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Page Title & Course Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            📊 Dashboard วิเคราะห์การเข้าเรียน & การมีส่วนร่วม
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            วิชา {activeCourse.code} {activeCourse.name} (Section {activeCourse.section})
          </p>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Overall Attendance Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">อัตราเข้าเรียนเฉลี่ย</span>
            <div className={`p-1.5 rounded-lg ${overallStats.avgRate >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {overallStats.avgRate >= 80 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {overallStats.avgRate}%
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
            <span className={overallStats.avgRate >= 80 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {overallStats.avgRate >= 80 ? 'เกณฑ์ปกติ (≥80%)' : 'ต่ำกว่าเกณฑ์มาตรฐาน'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${overallStats.avgRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${overallStats.avgRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Lowest Attendance Week (สัปดาห์ที่การเข้าเรียนต่ำสุด) */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs relative overflow-hidden bg-gradient-to-b from-rose-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>สัปดาห์เข้าเรียนต่ำสุด</span>
            </span>
            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">
              Dip Week
            </span>
          </div>
          {lowestAttendanceWeek ? (
            <>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                {lowestAttendanceWeek.attendanceRate}%
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-1 line-clamp-1">
                สัปดาห์ที่ {lowestAttendanceWeek.weekNumber} ({lowestAttendanceWeek.date})
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {lowestAttendanceWeek.title}
              </p>
            </>
          ) : (
            <div className="text-sm text-slate-400 mt-2">ยังไม่มีข้อมูล</div>
          )}
        </div>

        {/* KPI 3: Consecutive Absence Alert (ขาดเกิน 2 ครั้งติดกัน) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ขาด &gt;2 ครั้งติดต่อกัน</span>
            <div className={`p-1.5 rounded-lg ${alertStudents.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${alertStudents.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {alertStudents.length} <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            {alertStudents.length > 0 ? (
              <span className="text-rose-600 font-bold">⚠️ เสี่ยงถอนรายวิชา/หมดสิทธิ์สอบ</span>
            ) : (
              <span className="text-emerald-600 font-bold">✓ ไม่มีผู้เรียนขาดต่อเนื่อง</span>
            )}
          </div>
          <div className="mt-3 text-[10px] text-slate-400">
            ระบบตรวจจับผู้ที่ขาดติดต่อกัน 2 สัปดาห์ขึ้นไป
          </div>
        </div>

        {/* KPI 4: Average Participation Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">การมีส่วนร่วมเฉลี่ย</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {avgParticipationClass} <span className="text-sm font-semibold text-slate-400">/ 3.0</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            {avgParticipationClass >= 2.0
              ? 'ระดับดีมาก (Active Learners)'
              : avgParticipationClass >= 1.0
              ? 'ระดับปานกลาง (Moderate)'
              : 'ควรเพิ่มกิจกรรมกระตุ้น'}
          </div>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`flex-1 h-1.5 rounded-full ${
                  avgParticipationClass >= star
                    ? 'bg-amber-400'
                    : avgParticipationClass >= star - 0.5
                    ? 'bg-amber-200'
                    : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lowest Attendance Dip Alert Banner (If detected) */}
      {lowestAttendanceWeek && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <span>จุดสังเกต: สัปดาห์ที่ {lowestAttendanceWeek.weekNumber} มีอัตราการเข้าเรียนลดลงต่ำสุด ({lowestAttendanceWeek.attendanceRate}%)</span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                หัวข้อ: <em>&quot;{lowestAttendanceWeek.title}&quot;</em> (ขาด {lowestAttendanceWeek.absentCount} คน, ลา {lowestAttendanceWeek.leaveCount} คน)
                อาจเป็นช่วงสอบกลางภาค สภาพอากาศ หรือเนื้อหาที่ยาก แนะนำให้อาจารย์จัดกิจกรรมทบทวนเพิ่มเติม
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: SVG Line Chart for Weekly Trends (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>กราฟเส้นแนวโน้มการเข้าเรียนรายสัปดาห์ (Weekly Trend)</span>
              </h3>
              <p className="text-xs text-slate-500">
                เส้นสีเขียวแสดงร้อยละการเข้าเรียน เทียบกับเกณฑ์ปกติ 80% (เส้นประสีแดง)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span>อัตราเข้าเรียน (%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="w-3 h-0.5 bg-rose-400 border-b border-dashed inline-block" />
                <span>เกณฑ์ 80%</span>
              </span>
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[100, 80, 60, 40, 20].map((level) => {
                const y = chartHeight - paddingY - (level / 100) * usableHeight;
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* 80% Benchmark Dashed Line */}
              <line
                x1={paddingX}
                y1={benchmarkY}
                x2={chartWidth - paddingX}
                y2={benchmarkY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Shaded Area Under Curve */}
              {areaD && <path d={areaD} fill="url(#attendanceGradient)" />}

              {/* Attendance Trend Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points on Line */}
              {points.map((p, idx) => {
                const isLowest = lowestAttendanceWeek?.sessionId === p.sessionId;
                const isSelected = selectedWeekIdx === idx;

                return (
                  <g
                    key={p.sessionId}
                    onClick={() => setSelectedWeekIdx(idx)}
                    className="cursor-pointer group"
                  >
                    {/* Glow ring on hover or if lowest */}
                    {isLowest && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="10"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        className="animate-ping opacity-60"
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected || isLowest ? '6' : '4.5'}
                      fill={isLowest ? '#f43f5e' : p.attendanceRate >= 80 ? '#10b981' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Percentage text above point */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={isLowest ? '#e11d48' : '#334155'}
                    >
                      {p.attendanceRate}%
                    </text>

                    {/* X-axis labels: Week */}
                    <text
                      x={p.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isSelected ? '#0f172a' : '#64748b'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      W{p.weekNumber}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Week Drill-down detail */}
          {selectedWeekIdx !== null && points[selectedWeekIdx] && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <strong className="text-slate-800 text-sm">
                  สัปดาห์ที่ {points[selectedWeekIdx].weekNumber} ({points[selectedWeekIdx].date}):
                </strong>{' '}
                <span className="text-slate-600">{points[selectedWeekIdx].title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-emerald-700 font-bold">🟢 มา {points[selectedWeekIdx].presentCount}</span>
                <span className="text-rose-700 font-bold">🔴 ขาด {points[selectedWeekIdx].absentCount}</span>
                <span className="text-amber-700 font-bold">🟡 ลา {points[selectedWeekIdx].leaveCount}</span>
                <span className="text-slate-500 font-semibold">
                  (มีส่วนร่วมเฉลี่ย: {points[selectedWeekIdx].avgParticipation} ⭐)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Risk Group Distribution & Early Warning List */}
        <div className="space-y-6">
          {/* Classification Breakdown */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
              <span>กลุ่มผู้เรียนตามเกณฑ์เข้าเรียน</span>
              <span className="text-xs text-slate-500 font-normal">ทั้งหมด {studentStats.length} คน</span>
            </h3>

            <div className="space-y-3">
              {/* Group 1: ปกติ >= 80% */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>กลุ่มปกติ (80% ขึ้นไป)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">สถานะปลอดภัย มีสิทธิ์สอบ</p>
                </div>
                <div className="text-lg font-black text-emerald-800">{overallStats.normalCount} คน</div>
              </div>

              {/* Group 2: เฝ้าระวัง 60-79% */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>กลุ่มเฝ้าระวัง (60–79%)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">ควรตักเตือนก่อนหลุดเกณฑ์</p>
                </div>
                <div className="text-lg font-black text-amber-800">{overallStats.warningCount} คน</div>
              </div>

              {/* Group 3: เสี่ยง < 60% */}
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>กลุ่มเสี่ยงวิกฤต (&lt; 60%)</span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-0.5">เสี่ยงตกกิจกรรม / หมดสิทธิ์สอบ</p>
                </div>
                <div className="text-lg font-black text-rose-800">{overallStats.dangerCount} คน</div>
              </div>
            </div>
          </div>

          {/* Urgent Alert Students (Consecutive Absences >= 2) */}
          <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>ผู้ที่ขาดเกิน 2 ครั้งติดต่อกัน ({alertStudents.length})</span>
              </h3>
            </div>

            {alertStudents.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-2xl text-center text-xs text-emerald-800 font-medium">
                🎉 ยอดเยี่ยม! ไม่มีผู้เรียนขาดเรียนติดต่อกัน 2 คาบ
              </div>
            ) : (
              <div className="space-y-2">
                {alertStudents.map((st) => (
                  <div
                    key={st.student.id}
                    className="p-2.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {st.student.fullName} ({st.student.studentCode})
                      </div>
                      <div className="text-[11px] text-rose-700 font-semibold mt-0.5">
                        ขาดสะสม {st.absentCount} ครั้ง (เข้าเรียน {st.attendanceRate}%)
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px]">
                      ขาด {st.consecutiveAbsences || st.maxConsecutiveAbsences} คาบติด
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participation vs Attendance Correlation Section */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>การเปรียบเทียบการมีส่วนร่วมรายสัปดาห์ (Participation & Engagement)</span>
          </h3>
          <p className="text-xs text-slate-500">
            วิเคราะห์คะแนนการตอบคำถามและกิจกรรมกลุ่มเฉลี่ยในแต่ละสัปดาห์ (คะแนนเต็ม 3.0)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {weeklyStats.map((w) => {
            const barHeightPct = (w.avgParticipation / 3.0) * 100;
            const isLowest = lowestAttendanceWeek?.sessionId === w.sessionId;

            return (
              <div
                key={w.sessionId}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isLowest ? 'border-rose-300 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-500">W{w.weekNumber}</div>
                <div className="my-2 h-16 flex items-end justify-center">
                  <div
                    className="w-5 rounded-t-md bg-amber-400 hover:bg-amber-500 transition-all"
                    style={{ height: `${Math.max(10, barHeightPct)}%` }}
                    title={`การมีส่วนร่วมเฉลี่ย: ${w.avgParticipation}/3`}
                  />
                </div>
                <div className="text-xs font-black text-amber-700">{w.avgParticipation} ⭐</div>
                <div className="text-[10px] text-slate-400 mt-0.5">เข้าเรียน {w.attendanceRate}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
