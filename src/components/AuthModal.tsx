import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Sparkles, BookOpen, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { signInWithGoogle, signInAsDemo, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* Header branding */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md mb-3 ring-4 ring-white/10 shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">ClassPulse</h1>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            ระบบเช็กชื่อและบันทึกการมีส่วนร่วมในชั้นเรียน
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-[11px] font-medium border border-emerald-300/20">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>สำหรับอาจารย์ผู้สอน | Mobile-First</span>
          </div>
        </div>

        {/* Features preview */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">เช็กชื่อจบใน 1 นาทีบนมือถือ</strong>
                ปุ่มใหญ่พิเศษ สลับสถานะ มา/ขาด/ลา ได้เร็ว พร้อมปุ่มลัด &quot;มาทุกคน&quot;
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">บันทึกคะแนนการมีส่วนร่วม (0–3)</strong>
                ประเมินการตอบคำถาม การมีปฏิสัมพันธ์ และความร่วมมือในกิจกรรมกลุ่ม
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">ระบบเตือนภัยผู้เรียนห่างหาย</strong>
                แจ้งเตือนทันทีเมื่อขาดเกิน 2 ครั้งติดต่อกัน และคำนวณกลุ่มเสี่ยง (&lt;60%)
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <BarChart3 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Dashboard แนวโน้มรายสัปดาห์</strong>
                ตรวจหาสัปดาห์ที่การเข้าเรียนต่ำสุด (Dip Week) เพื่อปรับการสอน
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google Account</span>
            </button>

            <button
              onClick={signInAsDemo}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded-2xl border border-emerald-200/80 transition-all text-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>เข้าใช้งานโหมดทดสอบอาจารย์ (Demo Instructor)</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            ระบบทำงานบน Firebase Firestore ตามข้อกำหนดความปลอดภัย ABAC
          </p>
        </div>
      </div>
    </div>
  );
};
