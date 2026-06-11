import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  FaFileCsv,
  FaFileExcel,
  FaPrint,
  FaSearch,
  FaEye,
} from "react-icons/fa";

// ---------- Dummy Data ----------
const generateResults = () => {
  const students = [
    {
      id: 1,
      rollNo: "2024-001",
      name: "Ali Raza",
      class: "10th",
      section: "A",
    },
    {
      id: 2,
      rollNo: "2024-002",
      name: "Sana Khan",
      class: "10th",
      section: "A",
    },
    {
      id: 3,
      rollNo: "2024-003",
      name: "Imran Ali",
      class: "10th",
      section: "B",
    },
    {
      id: 4,
      rollNo: "2024-004",
      name: "Fatima Ahmed",
      class: "9th",
      section: "A",
    },
    {
      id: 5,
      rollNo: "2024-005",
      name: "Usman Chaudhry",
      class: "9th",
      section: "B",
    },
    {
      id: 6,
      rollNo: "2024-006",
      name: "Ayesha Siddiqui",
      class: "11th",
      section: "A",
    },
  ];
  return students.map((s) => {
    const totalMarks = 500;
    const obtained = Math.floor(Math.random() * 150) + 300;
    const percentage = ((obtained / totalMarks) * 100).toFixed(1);
    const grade = calculateGrade(percentage);
    const status = percentage >= 40 ? "Pass" : "Fail";
    return {
      ...s,
      totalMarks,
      obtained,
      percentage: parseFloat(percentage),
      grade,
      status,
      examName: "Final Term 2025",
    };
  });
};

const calculateGrade = (p) => {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
};

const gradeColor = (grade) => {
  const map = {
    "A+": "bg-indigo-600",
    A: "bg-violet-600",
    B: "bg-blue-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };
  return map[grade] || "bg-slate-500";
};

// ---------- Stats Card ----------
const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <svg
          className={`w-5 h-5 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
    </div>
  </div>
);

// ---------- View Modal ----------
const StudentResultModal = ({ student, onClose }) => {
  if (!student) return null;
  const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Urdu"];
  const subjectMarks = subjects.map((s) => ({
    subject: s,
    obtained: Math.floor(Math.random() * 80) + 20,
    total: 100,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-1">
              Student Result
            </p>
            <h2 className="text-xl font-bold text-white">{student.name}</h2>
            <p className="text-sm text-indigo-200 mt-1">
              Roll No: {student.rollNo} &nbsp;·&nbsp; Class: {student.class}{" "}
              &nbsp;·&nbsp; {student.examName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total Marks",
                value: student.totalMarks,
                color: "text-slate-700",
              },
              {
                label: "Obtained",
                value: student.obtained,
                color: "text-indigo-600",
              },
              {
                label: "Percentage",
                value: `${student.percentage}%`,
                color: "text-violet-600",
              },
              { label: "Grade", value: student.grade, color: "text-slate-800" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-slate-50 border border-slate-100 rounded-xl p-4"
              >
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Status Banner */}
          <div
            className={`rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold border
            ${
              student.status === "Pass"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{student.status === "Pass" ? "🎉" : "⚠️"}</span>
            {student.status === "Pass"
              ? `Passed with ${student.grade} Grade`
              : "Failed — Improvement Required"}
          </div>

          {/* Subject Table */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Subject-wise Breakdown
            </p>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Subject",
                      "Obtained",
                      "Total",
                      "Percentage",
                      "Grade",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjectMarks.map((s, i) => {
                    const pct = ((s.obtained / s.total) * 100).toFixed(1);
                    const g = calculateGrade(pct);
                    return (
                      <tr
                        key={s.subject}
                        className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                      >
                        <td className="px-4 py-3 font-medium text-slate-700 border-b border-slate-50">
                          {s.subject}
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-b border-slate-50">
                          {s.obtained}
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-b border-slate-50">
                          {s.total}
                        </td>
                        <td className="px-4 py-3 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-9">
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-slate-50">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${gradeColor(g)}`}
                          >
                            {g}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function ResultReport() {
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = generateResults();
      setResults(data);
      setFiltered(data);
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    let r = results;
    if (examFilter) r = r.filter((x) => x.examName === examFilter);
    if (classFilter) r = r.filter((x) => x.class === classFilter);
    if (studentFilter)
      r = r.filter((x) =>
        x.name.toLowerCase().includes(studentFilter.toLowerCase()),
      );
    setFiltered(r);
  }, [examFilter, classFilter, studentFilter, results]);

  const totalStudents = filtered.length;
  const passed = filtered.filter((r) => r.status === "Pass").length;
  const failed = filtered.filter((r) => r.status === "Fail").length;
  const passPercent = totalStudents
    ? ((passed / totalStudents) * 100).toFixed(1)
    : 0;

  const uniqueExams = [...new Set(results.map((r) => r.examName))];
  const uniqueClasses = [...new Set(results.map((r) => r.class))];

  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Class",
      "Total Marks",
      "Obtained",
      "Percentage",
      "Grade",
      "Result",
    ];
    const rows = filtered.map((r) => [
      r.rollNo,
      r.name,
      r.class,
      r.totalMarks,
      r.obtained,
      r.percentage,
      r.grade,
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "results.csv";
    a.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        "Roll No": r.rollNo,
        "Student Name": r.name,
        Class: r.class,
        "Total Marks": r.totalMarks,
        Obtained: r.obtained,
        Percentage: r.percentage,
        Grade: r.grade,
        Result: r.status,
      })),
    );
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
          <p className="text-sm text-slate-500 mt-0.5">
            Final Term 2025 — Student performance overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Total Students"
          value={totalStudents}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <StatsCard
          label="Passed"
          value={passed}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Failed"
          value={failed}
          bgColor="bg-red-100"
          iconColor="text-red-500"
          icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Pass Rate"
          value={`${passPercent}%`}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </div>

      {/* Filters + Exports in one box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search student name..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          {/* Exam filter */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Exams</option>
            {uniqueExams.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
          {/* Class filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {/* Exports */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FaFileCsv className="text-slate-600 w-4 h-4" />
            </button>
            <button
              onClick={exportExcel}
              title="Export Excel"
              className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              <FaFileExcel className="text-emerald-600 w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              title="Print"
              className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <FaPrint className="text-indigo-600 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">Students</span>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  "Roll No",
                  "Student Name",
                  "Class",
                  "Total",
                  "Obtained",
                  "Percentage",
                  "Grade",
                  "Result",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-400 text-sm"
                  >
                    Loading results...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-400 text-sm"
                  >
                    No students match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3.5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                        {r.rollNo}
                      </code>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {r.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Section {r.section}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-xs font-semibold">
                        {r.class}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {r.totalMarks}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {r.obtained}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.percentage}%`,
                              background:
                                r.percentage >= 80
                                  ? "#10b981"
                                  : r.percentage >= 60
                                    ? "#6366f1"
                                    : r.percentage >= 40
                                      ? "#f59e0b"
                                      : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {r.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${gradeColor(r.grade)}`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${r.status === "Pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {r.status === "Pass" ? "✓" : "✗"} {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedStudent(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition"
                      >
                        <FaEye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-between text-xs text-slate-400">
            <span>
              Showing {filtered.length} of {results.length} students
            </span>
            <span>Final Term 2025</span>
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentResultModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
