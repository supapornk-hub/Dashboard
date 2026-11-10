import React from 'react';
import { X, Database, ShieldCheck, Zap, Cloud, CheckCircle, Info } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseInfoModal: React.FC<FirebaseInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Database className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg">การตั้งค่าและการทำงานของ Firebase Firestore</h3>
              <p className="text-xs text-emerald-100">ClassPulse Architecture & Security Spec</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Active Config */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 font-semibold text-slate-900">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>โปรเจกต์ Firebase ที่เชื่อมต่อปัจจุบัน</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Project ID:</span>{' '}
                <span className="text-slate-800 font-medium">{firebaseConfig.projectId}</span>
              </div>
              <div>
                <span className="text-slate-400">Database:</span>{' '}
                <span className="text-slate-800 font-medium">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="text-slate-400">Auth Domain:</span>{' '}
                <span className="text-slate-800 font-medium">{firebaseConfig.authDomain}</span>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              จุดเด่นด้านเทคนิคและโครงสร้างฐานข้อมูล
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-emerald-50/50">
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  แพ็กเกจฟรี (Spark Plan)
                </div>
                <p className="text-slate-600">
                  รองรับ Read 50,000 ครั้ง/วัน, Write 20,000 ครั้ง/วัน และพื้นที่เก็บข้อมูล 1 GB ใช้งานฟรี 100% เหมาะอย่างยิ่งกับชั้นเรียนและมหาวิทยาลัย
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-blue-50/50">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  ความปลอดภัยขั้นสูง (ABAC)
                </div>
                <p className="text-slate-600">
                  ระบบรักษาความปลอดภัยผ่าน <code>firestore.rules</code> ที่ผูกติดกับ <code>instructorId == auth.uid</code> อาจารย์แต่ละท่านเห็นและแก้ไขได้เฉพาะรายวิชาของตนเองเท่านั้น
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-purple-50/50">
                <div className="font-semibold text-purple-900 flex items-center gap-1.5 mb-1">
                  <Cloud className="w-4 h-4 text-purple-600" />
                  ซิงค์แบบเรียลไทม์ (Real-time)
                </div>
                <p className="text-slate-600">
                  ใช้ Firestore <code>onSnapshot</code> ข้อมูลจะอัปเดตทันทีระหว่างมือถือ แท็บเล็ต และคอมพิวเตอร์โดยไม่ต้องกดรีเฟรชหน้าจอ
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-amber-50/50">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  โครงสร้างข้อมูล (Collections)
                </div>
                <p className="text-slate-600">
                  จัดเก็บแยกตาม <code>courses</code>, <code>students</code>, <code>sessions</code> และ <code>attendance</code> เพื่อรองรับการคำนวณสถิติร้อยละและการขาดเรียนต่อเนื่องได้อย่างรวดเร็ว
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs transition-colors shadow-xs"
          >
            เข้าใจแล้วและปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
