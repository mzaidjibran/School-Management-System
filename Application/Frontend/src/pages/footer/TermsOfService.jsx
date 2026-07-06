import React from "react";
import { FileText, ClipboardList, AlertOctagon, UserX, ShieldAlert } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-md border border-slate-100/85 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
            <ClipboardList size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Terms of Service</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Last Updated: July 2026</p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-sm text-slate-500 leading-relaxed">
          These Terms of Service govern your access to and use of Punjab Public High School's ERP software portal. By logging into and using the system, you agree to comply with these terms.
        </p>

        {/* Core sections */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> 1. Acceptance & Authorized Access
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This system is restricted solely to registered students, teachers, administrators, and staff of Punjab Public High School. Unauthorized access is strictly prohibited and subject to legal action.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-500" /> 2. Account Security
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Users are responsible for keeping their passwords confidential. Any activity under your logged-in session is your responsibility. Report any unauthorized account usage to the administrator immediately.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertOctagon size={16} className="text-indigo-500" /> 3. Code of Conduct
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You agree not to bypass security protections, tamper with database records, upload corrupt files, or inject scripts that degrade the system performance. All updates, entries, and deletions are audit-logged.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserX size={16} className="text-indigo-500" /> 4. Service Modification & Termination
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              The school administration reserves the right to suspend or terminate user accounts, restrict access permissions, or modify ERP layouts without prior notice for safety and system updates.
            </p>
          </div>
        </div>

        {/* Subtle note */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-400 font-semibold italic text-center">
          Violation of these terms may result in immediate access revocation and administrative disciplinary actions.
        </div>
      </div>
    </div>
  );
}
