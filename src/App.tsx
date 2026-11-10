import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider, useClass } from './context/ClassContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { CheckInView } from './components/CheckInView';
import { DashboardView } from './components/DashboardView';
import { StudentRosterView } from './components/StudentRosterView';
import { CourseManager } from './components/CourseManager';
import { FirebaseInfoModal } from './components/FirebaseInfoModal';
import { QuickModals } from './components/QuickModals';

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'checkin' | 'dashboard' | 'roster' | 'manage'>('checkin');
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          กำลังเตรียมความพร้อมระบบ ClassPulse...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col selection:bg-emerald-200">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenNewCourseModal={() => setIsNewCourseOpen(true)}
        onOpenNewSessionModal={() => setIsNewSessionOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16 sm:pb-8">
        {activeTab === 'checkin' && <CheckInView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'roster' && <StudentRosterView />}
        {activeTab === 'manage' && <CourseManager />}
      </main>

      {/* Mobile Floating Bottom Bar for One-Hand Thumb Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'checkin' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">📱</span>
          <span className="text-[10px]">เช็กชื่อ</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">📊</span>
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'roster' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">👥</span>
          <span className="text-[10px]">รายชื่อ</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'manage' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px]">จัดการ</span>
        </button>
      </nav>

      {/* Modals */}
      <FirebaseInfoModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      <QuickModals
        isNewCourseOpen={isNewCourseOpen}
        onCloseNewCourse={() => setIsNewCourseOpen(false)}
        isNewSessionOpen={isNewSessionOpen}
        onCloseNewSession={() => setIsNewSessionOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClassProvider>
        <MainApp />
      </ClassProvider>
    </AuthProvider>
  );
}
