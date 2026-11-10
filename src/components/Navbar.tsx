import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import {
  LogOut,
  ChevronDown,
  Database,
  PlusCircle,
  Sparkles,
  BookOpen,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'checkin' | 'dashboard' | 'roster' | 'manage';
  setActiveTab: (tab: 'checkin' | 'dashboard' | 'roster' | 'manage') => void;
  onOpenFirebaseModal: () => void;
  onOpenNewCourseModal: () => void;
  onOpenNewSessionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFirebaseModal,
  onOpenNewCourseModal,
  onOpenNewSessionModal,
}) => {
  const { user, signOut, isDemoUser } = useAuth();
  const {
    courses,
    activeCourse,
    selectCourse,
    sessions,
    activeSession,
    selectSession,
    seedSampleClassroom,
    loading,
  } = useClass();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top tier brand & controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                ClassPulse
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              ระบบเช็กชื่อ & บันทึกการมีส่วนร่วม
            </p>
          </div>
        </div>

        {/* Course & Session Selector (Center) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-xl justify-center">
          {/* Course select */}
          <div className="relative flex-1 max-w-[200px] sm:max-w-[240px]">
            <select
              value={activeCourse?.id || ''}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  onOpenNewCourseModal();
                } else {
                  selectCourse(e.target.value);
                }
              }}
              className="w-full pl-2.5 pr-7 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer truncate"
            >
              {courses.length === 0 ? (
                <option value="">(ยังไม่มีวิชา)</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} {c.name.slice(0, 18)}... (Sec {c.section})
                  </option>
                ))
              )}
              <option value="__new__">+ เพิ่มรายวิชาใหม่...</option>
            </select>
          </div>

          {/* Session / Week select */}
          {activeCourse && (
            <div className="relative shrink-0">
              <select
                value={activeSession?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenNewSessionModal();
                  } else {
                    selectSession(e.target.value);
                  }
                }}
                className="pl-2 pr-6 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {sessions.length === 0 ? (
                  <option value="">(ไม่มีคาบ)</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      สัปดาห์ที่ {s.weekNumber} ({s.date.slice(5)})
                    </option>
                  ))
                )}
                <option value="__new__">+ เพิ่มสัปดาห์...</option>
              </select>
            </div>
          )}
        </div>

        {/* Right side tools & profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick seed sample data if no courses or testing */}
          {courses.length === 0 && (
            <button
              onClick={() => seedSampleClassroom()}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
              title="โหลดตัวอย่างวิชา CS102 พร้อมนักศึกษา 20 คนและสถิติ 8 สัปดาห์"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหลดข้อมูลตัวอย่าง</span>
            </button>
          )}

          {/* Firebase info badge */}
          <button
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="ดูการตั้งค่า Firebase Firestore"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Firebase</span>
          </button>

          {/* User & Sign Out */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
            <div
              className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold cursor-default"
              title={user?.displayName || user?.email || 'อาจารย์'}
            >
              {user?.displayName ? user.displayName.charAt(0) : 'A'}
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Sticky bar) */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 overflow-x-auto py-1 text-xs sm:text-sm font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>📱</span>
            <span>เช็กชื่อ & มีส่วนร่วม</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>📊</span>
            <span>Dashboard สถิติ</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>👥</span>
            <span>รายชื่อ & ความเสี่ยง</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>⚙️</span>
            <span>จัดการวิชา & นำเข้า</span>
          </button>
        </div>
      </div>
    </header>
  );
};
