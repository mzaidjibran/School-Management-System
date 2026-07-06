import React from "react";
import { Shield, Eye, Lock, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-md border border-slate-100/85 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Shield size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Last Updated: July 2026</p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-sm text-slate-500 leading-relaxed">
          Welcome to Punjab Public High School's ERP portal. We value your privacy and are committed to protecting the personal data of our students, teachers, parents, and administrative staff. This policy describes how we collect, use, and safe-keep your data.
        </p>

        {/* Core sections */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye size={16} className="text-indigo-500" /> 1. Data Collection
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We collect information necessary for academic management, including registration details (name, CNIC/B-Form, birth date), contact information, grades, attendance logs, and fee records.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock size={16} className="text-indigo-500" /> 2. Data Security & Storage
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              All records are stored securely on our encrypted servers. Login details and passwords are encrypted using strong industry-standard hashing algorithms (bcrypt) to ensure unauthorized users cannot access accounts.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> 3. Data Usage
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Data is used exclusively to facilitate school ERP operations: marking student attendance, generating fee challans, processing exam results, maintaining class timetables, and publishing notices.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-500" /> 4. User Rights
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              As an authorized user of this ERP, you have the right to request correct details, view marks, check attendance status, and change passwords. Administrative changes are strictly logged for audit.
            </p>
          </div>
        </div>

        {/* Subtle note */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-400 font-semibold italic text-center">
          For any query regarding this privacy statement, please contact the administration office.
        </div>
      </div>
    </div>
  );
}
