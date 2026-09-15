import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FaFileCsv, FaFileExcel, FaPrint, FaSearch, FaEye } from "react-icons/fa";
import { getAllExams, getExamResults } from "../../api/Exam_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";
import { useAuth } from "../auth/useAuth.js";
import toast from "react-hot-toast";

const calculateGrade = (p) => {
  if (p >= 90) return "A+"; if (p >= 80) return "A";
  if (p >= 70) return "B";  if (p >= 60) return "C";
  if (p >= 50) return "D";  return "F";
};

const gradeColor = (g) => ({
  "A+": "bg-[#326080]",
  "A": "bg-[#3d749a]",
  "B": "bg-blue-600",
  "C": "bg-amber-600",
  "D": "bg-[#805232]",
  "F": "bg-rose-600",
}[g] || "bg-slate-500");

const EXAM_TYPE_LABELS = {
  mid_term: "Mid Term",
  final_term: "Final Term",
  unit_test: "Unit Test",
  practical: "Practical",
  quiz: "Quiz",
};

const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-md shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
    </div>
  </div>
);

// ── Print Individual Student Report Card ──────────────────────────
const printStudentReportCard = (student, exam, schoolName, schoolLogo) => {
  if (!student || !exam) return;
  const pct = ((student.obtainedMarks / exam.totalMarks) * 100).toFixed(1);
  const grade = student.grade || calculateGrade(parseFloat(pct));
  const logoUrl = schoolLogo
    ? schoolLogo.startsWith("http")
      ? schoolLogo
      : `https://api.nullstacksloution.online${schoolLogo}`
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${student.student?.firstName || "Student"} - Report Card</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 20px; background: #fff; }
          .report-border { border: 3px double #326080; padding: 25px; border-radius: 8px; min-height: 88vh; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #326080; padding-bottom: 15px; margin-bottom: 20px; }
          .header-left { display: flex; align-items: center; gap: 15px; }
          .logo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #326080; }
          .logo-fallback { width: 70px; height: 70px; border-radius: 50%; background: #326080; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; }
          .school-title { font-size: 24px; font-weight: 800; color: #326080; margin: 0; }
          .sub-title { font-size: 11px; font-weight: 700; color: #805232; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
          .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
          .section-title { font-size: 12px; font-weight: 800; color: #326080; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-left: 4px solid #326080; padding-left: 8px; }
          .bio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 22px; font-size: 12px; }
          .bio-item { display: flex; }
          .bio-label { width: 110px; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 11px; }
          .bio-val { font-weight: 700; color: #0f172a; flex: 1; }
          .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px; }
          .marks-table th { background: #326080; color: #ffffff; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .marks-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; }
          .marks-table tr:nth-child(even) { background: #f8fafc; }
          .summary-card { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; text-align: center; }
          .summary-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #ffffff; }
          .summary-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .summary-val { font-size: 18px; font-weight: 800; margin-top: 4px; }
          .remarks-box { background: #fffaf6; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; margin-bottom: 25px; font-size: 12px; color: #9a3412; }
          .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; }
          .sig-box { text-align: center; }
          .sig-line { width: 160px; border-bottom: 1px solid #000; margin-bottom: 6px; }
          .sig-name { font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="report-border">
          <div>
            <div class="header">
              <div class="header-left">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="School Logo" />` : `<div class="logo-fallback">${(schoolName || "S")[0]?.toUpperCase()}</div>`}
                <div>
                  <h1 class="school-title">${schoolName || "Punjab Public High School"}</h1>
                  <div class="sub-title">Official Student Progress Report & Mark Sheet</div>
                </div>
              </div>
              <div class="meta-info">
                <strong>Session:</strong> ${new Date().getFullYear()}-${new Date().getFullYear() + 1}<br/>
                <strong>Issue Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>

            <div class="section-title">Student Information</div>
            <div class="bio-grid">
              <div class="bio-item"><span class="bio-label">Student Name:</span><span class="bio-val">${student.student?.firstName || ""} ${student.student?.lastName || ""}</span></div>
              <div class="bio-item"><span class="bio-label">Roll Number:</span><span class="bio-val">${student.student?.rollNumber || "—"}</span></div>
              <div class="bio-item"><span class="bio-label">Class & Sec:</span><span class="bio-val">${exam.class?.name || "—"} ${exam.class?.section ? `(${exam.class.section})` : ""}</span></div>
              <div class="bio-item"><span class="bio-label">Exam Title:</span><span class="bio-val">${exam.name}</span></div>
            </div>

            <div class="section-title">Examination Performance</div>
            <table class="marks-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th style="text-align: center;">Total Marks</th>
                  <th style="text-align: center;">Passing Marks</th>
                  <th style="text-align: center;">Marks Obtained</th>
                  <th style="text-align: center;">Percentage</th>
                  <th style="text-align: center;">Grade</th>
                  <th style="text-align: center;">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="color: #326080; font-weight: 700;">${exam.subject}</td>
                  <td style="text-align: center;">${exam.totalMarks}</td>
                  <td style="text-align: center;">${exam.passingMarks}</td>
                  <td style="text-align: center; font-size: 15px; font-weight: 800; color: #326080;">${student.obtainedMarks}</td>
                  <td style="text-align: center; font-weight: 700;">${pct}%</td>
                  <td style="text-align: center; font-weight: 800; color: #805232;">${grade}</td>
                  <td style="text-align: center;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${student.status === "pass" ? "background: #dcfce7; color: #166534;" : "background: #fee2e2; color: #991b1b;"}">
                      ${student.status === "pass" ? "PASS" : "FAIL"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="summary-card">
              <div class="summary-box"><div class="summary-label">Total Marks</div><div class="summary-val" style="color: #334155;">${exam.totalMarks}</div></div>
              <div class="summary-box"><div class="summary-label">Marks Obtained</div><div class="summary-val" style="color: #326080;">${student.obtainedMarks}</div></div>
              <div class="summary-box"><div class="summary-label">Percentage</div><div class="summary-val" style="color: #0f766e;">${pct}%</div></div>
              <div class="summary-box"><div class="summary-label">Grade</div><div class="summary-val" style="color: #805232;">${grade}</div></div>
            </div>

            <div class="remarks-box">
              <strong>Teacher Remarks:</strong><br/>
              ${student.remarks ? student.remarks : (student.status === "pass" ? "Demonstrated commendable understanding and performance in the subject." : "Requires additional effort and guidance in key academic topics.")}
            </div>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">Class Teacher</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">Exam In-Charge</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">Principal Signature & Stamp</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to print report card");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};

// ── Print Class Result Gazette / Tabulation Sheet ─────────────────
const printClassResultGazette = (filteredResults, examObj, schoolName, schoolLogo) => {
  if (!examObj || filteredResults.length === 0) {
    toast.error("No results to print. Please select an exam with entered marks.");
    return;
  }

  const logoUrl = schoolLogo
    ? schoolLogo.startsWith("http")
      ? schoolLogo
      : `https://api.nullstacksloution.online${schoolLogo}`
    : null;

  const totalAppeared = filteredResults.length;
  const totalPassed = filteredResults.filter((r) => r.status === "pass").length;
  const totalFailed = totalAppeared - totalPassed;
  const passRate = totalAppeared > 0 ? ((totalPassed / totalAppeared) * 100).toFixed(1) : "0.0";
  const totalMarksObtained = filteredResults.reduce((acc, r) => acc + (Number(r.obtainedMarks) || 0), 0);
  const avgMarks = totalAppeared > 0 ? (totalMarksObtained / totalAppeared).toFixed(1) : "0.0";
  const avgPct = examObj.totalMarks > 0 ? ((parseFloat(avgMarks) / examObj.totalMarks) * 100).toFixed(1) : "0.0";

  const rowsHtml = filteredResults.map((r, idx) => {
    const pct = ((r.obtainedMarks / examObj.totalMarks) * 100).toFixed(1);
    const grade = r.grade || calculateGrade(parseFloat(pct));
    const isPass = r.status === "pass";
    return `
      <tr>
        <td style="text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #334155;">${r.student?.rollNumber || "—"}</td>
        <td style="font-weight: 700; color: #0f172a;">${r.student?.firstName || ""} ${r.student?.lastName || ""}</td>
        <td style="text-align: center; color: #475569;">${examObj.totalMarks}</td>
        <td style="text-align: center; font-weight: 800; color: #326080;">${r.obtainedMarks}</td>
        <td style="text-align: center; font-weight: 700;">${pct}%</td>
        <td style="text-align: center; font-weight: 800; color: #805232;">${grade}</td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; ${isPass ? "background: #dcfce7; color: #166534;" : "background: #fee2e2; color: #991b1b;"}">
            ${isPass ? "PASS" : "FAIL"}
          </span>
        </td>
      </tr>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${examObj.name} - Result Gazette</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 20px; background: #fff; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #326080; padding-bottom: 12px; margin-bottom: 16px; }
          .header-left { display: flex; align-items: center; gap: 14px; }
          .logo { width: 65px; height: 65px; border-radius: 50%; object-fit: cover; border: 2px solid #326080; }
          .logo-fallback { width: 65px; height: 65px; border-radius: 50%; background: #326080; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: bold; }
          .school-title { font-size: 22px; font-weight: 800; color: #326080; margin: 0; }
          .gazette-title { font-size: 11px; font-weight: 700; color: #805232; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; }
          .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
          .exam-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; }
          .meta-item { display: flex; flex-direction: column; }
          .meta-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .meta-val { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .gazette-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; }
          .gazette-table th { background: #326080; color: #ffffff; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #326080; }
          .gazette-table td { padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 11px; }
          .gazette-table tr:nth-child(even) { background: #f8fafc; }
          .stats-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; background: #fffaf6; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px; margin-bottom: 25px; text-align: center; }
          .stats-strip-box { display: flex; flex-direction: column; }
          .stats-strip-label { font-size: 9px; font-weight: 700; color: #805232; text-transform: uppercase; }
          .stats-strip-val { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
          .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 15px; }
          .sig-box { text-align: center; }
          .sig-line { width: 160px; border-bottom: 1px solid #000; margin-bottom: 5px; }
          .sig-name { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="School Logo" />` : `<div class="logo-fallback">${(schoolName || "S")[0]?.toUpperCase()}</div>`}
            <div>
              <h1 class="school-title">${schoolName || "Punjab Public High School"}</h1>
              <div class="gazette-title">Official Examination Result Gazette & Tabulation Sheet</div>
            </div>
          </div>
          <div class="meta-info">
            <strong>Session:</strong> ${new Date().getFullYear()}-${new Date().getFullYear() + 1}<br/>
            <strong>Date Generated:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>

        <div class="exam-meta-grid">
          <div class="meta-item"><span class="meta-label">Exam Name</span><span class="meta-val">${examObj.name}</span></div>
          <div class="meta-item"><span class="meta-label">Class & Section</span><span class="meta-val">${examObj.class?.name || "—"} ${examObj.class?.section ? `(${examObj.class.section})` : ""}</span></div>
          <div class="meta-item"><span class="meta-label">Subject</span><span class="meta-val" style="color: #326080;">${examObj.subject}</span></div>
          <div class="meta-item"><span class="meta-label">Total / Passing</span><span class="meta-val">${examObj.totalMarks} / ${examObj.passingMarks}</span></div>
        </div>

        <table class="gazette-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 80px;">Roll No</th>
              <th>Student Name</th>
              <th style="text-align: center; width: 60px;">Total</th>
              <th style="text-align: center; width: 75px;">Obtained</th>
              <th style="text-align: center; width: 70px;">Pct %</th>
              <th style="text-align: center; width: 55px;">Grade</th>
              <th style="text-align: center; width: 65px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="stats-strip">
          <div class="stats-strip-box"><span class="stats-strip-label">Total Appeared</span><span class="stats-strip-val">${totalAppeared}</span></div>
          <div class="stats-strip-box"><span class="stats-strip-label">Total Passed</span><span class="stats-strip-val" style="color: #166534;">${totalPassed}</span></div>
          <div class="stats-strip-box"><span class="stats-strip-label">Total Failed</span><span class="stats-strip-val" style="color: #991b1b;">${totalFailed}</span></div>
          <div class="stats-strip-box"><span class="stats-strip-label">Pass Rate</span><span class="stats-strip-val" style="color: #326080;">${passRate}%</span></div>
          <div class="stats-strip-box"><span class="stats-strip-label">Class Average</span><span class="stats-strip-val" style="color: #805232;">${avgMarks} (${avgPct}%)</span></div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-name">Subject Teacher</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-name">Tabulator / In-Charge</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-name">Principal Signature & Stamp</div>
          </div>
        </div>
      </body>
    </html>
  `;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to print result gazette");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};

// ── View Result Modal (Marina Theme) ──────────────────────────────
const ViewModal = ({ student, exam, schoolName, schoolLogo, onClose }) => {
  if (!student) return null;
  const pct   = exam ? ((student.obtainedMarks / exam.totalMarks) * 100).toFixed(1) : 0;
  const grade = student.grade || calculateGrade(parseFloat(pct));
  const logoUrl = schoolLogo
    ? schoolLogo.startsWith("http")
      ? schoolLogo
      : `https://api.nullstacksloution.online${schoolLogo}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Marina Themed Header */}
        <div className="bg-[#326080] text-white px-6 py-5 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/10 p-0.5 flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="School Logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-base font-bold font-serif text-white">
                  {(schoolName || "S")[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#fcefe7] uppercase tracking-widest">
                {schoolName || "Punjab Public High School"} · Statement of Marks
              </p>
              <h2 className="text-lg font-bold text-white leading-tight mt-0.5">
                {student.student?.firstName} {student.student?.lastName}
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Roll No: <span className="font-mono font-bold text-white">{student.student?.rollNumber || "—"}</span>
                {exam?.class?.name ? ` · Class: ${exam.class.name}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 bg-[#fffaf6]/30">
          <div className="flex items-center justify-between px-3.5 py-2 bg-white rounded border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">Subject / Exam:</span>
            <span className="text-xs font-bold text-[#326080]">
              {exam?.name || "Examination"} ({exam?.subject || "All Subjects"})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Total Marks", value: exam?.totalMarks || "—", color: "text-slate-800" },
              { label: "Obtained", value: student.obtainedMarks, color: "text-[#326080]" },
              { label: "Percentage", value: `${pct}%`, color: "text-[#0f766e]" },
              { label: "Grade", value: grade, color: "text-[#805232]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-md p-3 text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-md px-4 py-3 flex items-center justify-between text-xs font-bold border ${
            student.status === "pass"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <span className="flex items-center gap-1.5">
              <span>{student.status === "pass" ? "🎉" : "⚠️"}</span>
              <span>{student.status === "pass" ? `Passed with ${grade} Grade` : "Needs Academic Improvement"}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
              student.status === "pass" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}>
              {student.status === "pass" ? "PASSED" : "FAILED"}
            </span>
          </div>

          {student.remarks ? (
            <div className="bg-white rounded-md p-3 border border-slate-200 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Remarks</p>
              <p className="text-slate-700">{student.remarks}</p>
            </div>
          ) : null}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded text-xs font-semibold text-slate-600 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => printStudentReportCard(student, exam, schoolName, schoolLogo)}
            className="px-4 py-2 bg-[#326080] hover:bg-[#254961] text-white rounded text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <FaPrint className="w-3 h-3" /> Print Result Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ResultReport() {
  const { schoolName, schoolLogo } = useAuth();
  const [exams, setExams]             = useState([]);
  const [classes, setClasses]         = useState([]);
  const [results, setResults]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  const examObj = exams.find((e) => e._id === selectedExam);

  // ── Load exams + classes ───────────────────────────────────────
  useEffect(() => {
    Promise.all([getAllExams(), getAllClasses()])
      .then(([eRes, cRes]) => {
        setExams(eRes.data || []);
        setClasses(cRes.data || []);
      })
      .catch(console.error);
  }, []);

  // ── Load results jab exam select ho ───────────────────────────
  useEffect(() => {
    if (!selectedExam) { setResults([]); setFiltered([]); return; }
    setLoading(true);
    getExamResults(selectedExam)
      .then((r) => { setResults(r.data || []); setFiltered(r.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedExam]);

  // ── Client filters ─────────────────────────────────────────────
  useEffect(() => {
    let r = results;
    if (studentFilter) r = r.filter((x) => {
      const name = `${x.student?.firstName || ""} ${x.student?.lastName || ""}`.toLowerCase();
      return name.includes(studentFilter.toLowerCase()) || (x.student?.rollNumber || "").includes(studentFilter);
    });
    setFiltered(r);
  }, [studentFilter, results]);

  const totalStudents = filtered.length;
  const passed        = filtered.filter((r) => r.status === "pass").length;
  const failed        = filtered.filter((r) => r.status === "fail").length;
  const passPercent   = totalStudents ? ((passed / totalStudents) * 100).toFixed(1) : 0;

  const exportCSV = () => {
    const headers = ["Roll No","Student Name","Obtained","Total","Percentage","Grade","Result"];
    const rows    = filtered.map((r) => {
      const pct = examObj ? ((r.obtainedMarks / examObj.totalMarks)*100).toFixed(1) : 0;
      return [`${r.student?.rollNumber || "—"}`, `${r.student?.firstName} ${r.student?.lastName}`, r.obtainedMarks, examObj?.totalMarks || "—", `${pct}%`, r.grade, r.status];
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[headers,...rows].map((r) => r.join(",")).join("\n")],{type:"text/csv"}));
    a.download = "results.csv";
    a.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((r) => {
      const pct = examObj ? ((r.obtainedMarks / examObj.totalMarks)*100).toFixed(1) : 0;
      return { "Roll No": r.student?.rollNumber || "—", "Student Name": `${r.student?.firstName} ${r.student?.lastName}`, "Obtained": r.obtainedMarks, "Total": examObj?.totalMarks || "—", "Percentage": `${pct}%`, "Grade": r.grade, "Result": r.status };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "results.xlsx");
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Dashboard / Results</p>
          <h1 className="text-2xl font-bold text-slate-800">Result Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Exam-wise student performance</p>
        </div>
      </div>

      {/* Exam selector */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Exam</label>
        <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full md:w-96 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">-- Select Exam --</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} — {e.subject} | {e.class?.name} {e.class?.section}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Total Students" value={totalStudents} bgColor="bg-indigo-100" iconColor="text-indigo-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatsCard label="Passed" value={passed} bgColor="bg-emerald-100" iconColor="text-emerald-600" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Failed" value={failed} bgColor="bg-red-100" iconColor="text-red-500" icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Pass Rate" value={`${passPercent}%`} bgColor="bg-amber-100" iconColor="text-amber-600" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </div>

      {/* Filters + Exports */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" placeholder="Search student name or roll no..." value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV}   className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md transition"><FaFileCsv className="text-slate-600 w-4 h-4" /></button>
            <button onClick={exportExcel} className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"><FaFileExcel className="text-emerald-600 w-4 h-4" /></button>
            <button onClick={() => window.print()} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"><FaPrint className="text-indigo-600 w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">
            {examObj ? `${examObj.name} — ${examObj.subject}` : "Select an exam to view results"}
          </span>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">{filtered.length} records</span>
        </div>
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Roll No","Student Name","Total","Obtained","Percentage","Grade","Result",""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">Loading results...</td></tr>
              ) : !selectedExam ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">Please select an exam first</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No results found — please enter marks first</td></tr>
              ) : filtered.map((r) => {
                const pct   = examObj ? ((r.obtainedMarks / examObj.totalMarks)*100).toFixed(1) : 0;
                const grade = r.grade || calculateGrade(parseFloat(pct));
                return (
                  <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{r.student?.rollNumber || "—"}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {r.student?.firstName?.charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-800">{r.student?.firstName} {r.student?.lastName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{examObj?.totalMarks || "—"}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.obtainedMarks}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, background: parseFloat(pct)>=80?"#10b981":parseFloat(pct)>=60?"#6366f1":parseFloat(pct)>=40?"#f59e0b":"#ef4444" }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${gradeColor(grade)}`}>{grade}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${r.status==="pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {r.status==="pass" ? "✓ Pass" : "✗ Fail"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelectedResult(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-md transition">
                        <FaEye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden p-4 space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading results...</div>
          ) : !selectedExam ? (
            <div className="p-8 text-center text-sm text-slate-400">Please select an exam first</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No results found — please enter marks first</div>
          ) : (
            filtered.map((r, idx) => {
              const pct   = examObj ? ((r.obtainedMarks / examObj.totalMarks)*100).toFixed(1) : 0;
              const grade = r.grade || calculateGrade(parseFloat(pct));
              const colors = ["bg-indigo-100 text-indigo-700", "bg-purple-100 text-purple-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];
              const avatarColor = colors[idx % colors.length];

              return (
                <div key={r._id} className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${avatarColor} font-bold text-xs flex items-center justify-center`}>
                        {r.student?.firstName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{r.student?.firstName} {r.student?.lastName}</p>
                        <p className="text-[10px] text-slate-400">Roll No: {r.student?.rollNumber || "—"}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                      ${r.status === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.status === "pass" ? "Pass" : "Fail"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Marks</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{r.obtainedMarks} / {examObj?.totalMarks || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Percentage</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{pct}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Grade</p>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold text-white ${gradeColor(grade)}`}>{grade}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-50">
                    <button onClick={() => setSelectedResult(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-md transition">
                      <FaEye className="w-3 h-3" /> View Detail
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} students</span>
            {examObj && <span>{examObj.name}</span>}
          </div>
        )}
      </div>

      {selectedResult && <ViewModal student={selectedResult} exam={examObj} onClose={() => setSelectedResult(null)} />}
    </div>
  );
}