import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { X, BookOpen, Calendar } from 'lucide-react';

interface QuickModalsProps {
  isNewCourseOpen: boolean;
  onCloseNewCourse: () => void;
  isNewSessionOpen: boolean;
  onCloseNewSession: () => void;
}

export const QuickModals: React.FC<QuickModalsProps> = ({
  isNewCourseOpen,
  onCloseNewCourse,
  isNewSessionOpen,
  onCloseNewSession,
}) => {
  const { createCourse, createSession, sessions, activeCourse } = useClass();

  // Course state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('01');
  const [semester, setSemester] = useState('2/2567');
  const [courseLoading, setCourseLoading] = useState(false);

  // Session state
  const [week, setWeek] = useState(sessions.length + 1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    setCourseLoading(true);
    try {
      await createCourse({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        section: section.trim(),
        semester: semester.trim(),
        totalSessions: 15,
      });
      setCode('');
      setName('');
      onCloseNewCourse();
    } finally {
      setCourseLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSessionLoading(true);
    try {
      await createSession({
        weekNumber: Number(week),
        date,
        title: title.trim(),
      });
      setTitle('');
      onCloseNewSession();
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <>
      {/* New Course Modal */}
      {isNewCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>เพิ่มรายวิชาใหม่</span>
              </h3>
              <button onClick={onCloseNewCourse} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">รหัสวิชา</label>
                  <input
                    type="text"
                    placeholder="เช่น CS101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">กลุ่มเรียน (Sec)</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ชื่อวิชา</label>
                <input
                  type="text"
                  placeholder="เช่น การเขียนโปรแกรมเว็บแอปพลิเคชัน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ภาคเรียน/ปีการศึกษา</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onCloseNewCourse}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={courseLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  {courseLoading ? '...' : 'สร้างวิชา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {isNewSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>เพิ่มสัปดาห์เรียน ({activeCourse?.code})</span>
              </h3>
              <button onClick={onCloseNewSession} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">สัปดาห์ที่ (Week)</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">วันที่สอน</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">หัวข้อบทเรียน/กิจกรรม</label>
                <input
                  type="text"
                  placeholder="เช่น บทที่ 4: React State & Lifecycle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onCloseNewSession}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={sessionLoading || !activeCourse}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  {sessionLoading ? '...' : 'เพิ่มสัปดาห์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
