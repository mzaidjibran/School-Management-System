import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FaFileCsv, FaFileExcel, FaPrint, FaSearch, FaEye } from "react-icons/fa";
import { getAllExams, getExamResults } from "../../api/Exam_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";

const calculateGrade = (p) => {
  if (p >= 90) return "A+"; if (p >= 80) return "A";
  if (p >= 70) return "B";  if (p >= 60) return "C";
  if (p >= 50) return "D";  return "F";
};

const gradeColor = (g) => ({
  "A+":"bg-indigo-600","A":"bg-violet-600","B":"bg-blue-500",
  "C":"bg-amber-500","D":"bg-orange-500","F":"bg-red-500",
}[g] || "bg-slate-500");

const EXAM_TYPE_LABELS = {
  mid_term:"Mid Term", final_term:"Final Term",
  unit_test:"Unit Test", practical:"Practical", quiz:"Quiz",
};

const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
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

const ViewModal = ({ student, exam, onClose }) => {
  if (!student) return null;
  const pct   = exam ? ((student.obtainedMarks / exam.totalMarks) * 100).toFixed(1) : 0;
  const grade = student.grade || calculateGrade(parseFloat(pct));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex justify-between items-start rounded-t-2xl">
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-1">Student Result</p>
            <h2 className="text-xl font-bold text-white">{student.student?.firstName} {student.student?.lastName}</h2>
            <p className="text-sm text-indigo-200 mt-1">Roll No: {student.student?.rollNumber || "—"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Total Marks",  value: exam?.totalMarks || "—", color:"text-slate-700" },
              { label:"Obtained",     value: student.obtainedMarks,   color:"text-indigo-600" },
              { label:"Percentage",   value: `${pct}%`,              color:"text-violet-600" },
              { label:"Grade",        value: grade,                   color:"text-slate-800" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold border
            ${student.status === "pass" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <span>{student.status === "pass" ? "🎉" : "⚠️"}</span>
            {student.status === "pass" ? `Passed with ${grade} Grade` : "Failed — Improvement Required"}
          </div>
          {student.remarks && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Remarks</p>
              <p className="text-sm text-slate-700">{student.remarks}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default function ResultReport() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Dashboard / Results</p>
          <h1 className="text-2xl font-bold text-slate-800">Result Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Exam-wise student performance</p>
        </div>
      </div>

      {/* Exam selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Exam</label>
        <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full md:w-96 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-400">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" placeholder="Search student name or roll no..." value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV}   className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"><FaFileCsv className="text-slate-600 w-4 h-4" /></button>
            <button onClick={exportExcel} className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"><FaFileExcel className="text-emerald-600 w-4 h-4" /></button>
            <button onClick={() => window.print()} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><FaPrint className="text-indigo-600 w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">
            {examObj ? `${examObj.name} — ${examObj.subject}` : "Select an exam to view results"}
          </span>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
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
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">Pehle exam select karo</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">Koi result nahi mila — pehle marks enter karo</td></tr>
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition">
                        <FaEye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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