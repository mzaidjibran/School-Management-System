import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getAllStudents } from "../../api/Student_Api.js";
import { getAttendanceByStudent } from "../../api/Attendence_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";
import toast from "react-hot-toast";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Search,
  Award,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

// ---------- Helpers ----------
const avatarColors = ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500"];
const getBarColor  = (pct) =>
  pct >= 90 ? "linear-gradient(90deg,#10b981,#34d399)"
  : pct >= 75 ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
  : "linear-gradient(90deg,#ef4444,#f87171)";
const getPctBadge  = (pct) =>
  pct >= 90 ? { bg: "#d1fae5", color: "#065f46" }
  : pct >= 75 ? { bg: "#fef3c7", color: "#92400e" }
  : { bg: "#fee2e2", color: "#991b1b" };

export default function AttendanceReport() {
  const [classes, setClasses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [reportData, setReportData]     = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading]           = useState(false);

  const [classFilter, setClassFilter]     = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("girls");

  // Current month default
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year,  setYear]  = useState(String(now.getFullYear()));

  // ── Load classes ───────────────────────────────────────────────
  useEffect(() => {
    getAllClasses()
      .then((r) => setClasses(r.data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load classes: " + err.message);
      });
  }, []);

  // ── Load students jab class ya section filter change ho ────────
  useEffect(() => {
    const params = {};
    if (classFilter) params.currentClass = classFilter;
    if (sectionFilter) params.section = sectionFilter;
    getAllStudents(params)
      .then((r) => setStudents(r.data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load students: " + err.message);
      });
  }, [classFilter, sectionFilter]);

  // ── Build report: har student ki attendance summary ───────────
  useEffect(() => {
    if (students.length === 0) {
      setReportData([]);
      setFilteredData([]);
      return;
    }
    setLoading(true);
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled(
          students.map((s) =>
            getAttendanceByStudent(s._id, parseInt(month), parseInt(year))
          )
        );

        const data = students.map((s, i) => {
          const res = results[i];
          if (res.status === "rejected") {
            return { ...s, present: 0, absent: 0, leave: 0, late: 0, total: 0, percent: 0 };
          }
          const summary = res.value.summary || {};
          const total   = summary.total || 0;
          const present = summary.present || 0;
          const percent = total ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
          return {
            ...s,
            present,
            absent:  summary.absent || 0,
            leave:   summary.leave  || 0,
            late:    summary.late   || 0,
            total,
            percent,
          };
        });

        setReportData(data);
        setFilteredData(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to compile attendance reports: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [students, month, year]);

  // ── Client-side name filter ────────────────────────────────────
  useEffect(() => {
    if (!studentFilter) {
      setFilteredData(reportData);
      return;
    }
    setFilteredData(
      reportData.filter((s) => {
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        return name.includes(studentFilter.toLowerCase()) ||
          (s.rollNumber || "").includes(studentFilter);
      })
    );
  }, [studentFilter, reportData]);

  // ── Totals ─────────────────────────────────────────────────────
  const totalPresent  = filteredData.reduce((a, s) => a + s.present, 0);
  const totalAbsent   = filteredData.reduce((a, s) => a + s.absent,  0);
  const totalLeave    = filteredData.reduce((a, s) => a + s.leave,   0);
  const totalLate     = filteredData.reduce((a, s) => a + s.late,    0);
  const totalPossible = filteredData.reduce((a, s) => a + s.total,   0);
  const overallPct    = totalPossible
    ? ((totalPresent / totalPossible) * 100).toFixed(1)
    : 0;

  const topPerformers = [...filteredData].filter((s) => s.percent >= 90).sort((a, b) => b.percent - a.percent).slice(0, 5);
  const lowAttendance = [...filteredData].filter((s) => s.percent < 75 && s.total > 0).sort((a, b) => a.percent - b.percent).slice(0, 5);

  // ── Exports ────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Roll No","Name","Present","Absent","Leave","Late","Total","Attendance %"];
    const rows    = filteredData.map((s) => [s.rollNumber,`${s.firstName} ${s.lastName}`,s.present,s.absent,s.leave,s.late,s.total,s.percent]);
    const a       = document.createElement("a");
    a.href        = URL.createObjectURL(new Blob([[headers,...rows].map((r) => r.join(",")).join("\n")],{type:"text/csv"}));
    a.download    = "attendance_report.csv";
    a.click();
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map((s) => ({
      "Roll No": s.rollNumber, Name: `${s.firstName} ${s.lastName}`,
      Present: s.present, Absent: s.absent, Leave: s.leave, Late: s.late,
      Total: s.total, "Attendance %": s.percent,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "attendance_report.xlsx");
  };

  const statCards = [
    { label: "Overall",  value: `${overallPct}%`, color: "text-slate-800",   icon: <TrendingUp className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
    { label: "Present",  value: totalPresent,      color: "text-emerald-600", icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
    { label: "Absent",   value: totalAbsent,       color: "text-rose-600",    icon: <XCircle className="w-5 h-5 text-rose-600" />, bg: "bg-rose-50" },
    { label: "Leave",    value: totalLeave,        color: "text-amber-600",   icon: <Briefcase className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
    { label: "Late",     value: totalLate,         color: "text-blue-600",    icon: <Clock className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
  ];

  const months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = ["2024","2025","2026","2027"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Attendance Reports</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-black text-slate-800 font-serif">Attendance Reports</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monthly analytics and insights on student attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition duration-150 cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition duration-150 cursor-pointer"
            >
              Excel
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statCards.map(({ label, value, color, icon, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm flex justify-between items-center h-22"
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className={`text-2xl font-black ${color} mt-1 block`}>{value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filter Records</label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search name or roll no..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:border-indigo-400 focus:bg-white outline-none transition font-semibold text-slate-700"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — Section {c.section}
                </option>
              ))}
            </select>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="girls">Girls</option>
              <option value="boys">Boys</option>
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700 cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={m} value={m}>
                  {monthNames[i]}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="font-bold text-sm text-slate-800 font-serif">Student Attendance</span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
              {filteredData.length} Students
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Roll No", "Student", "Present", "Absent", "Leave", "Late", "Attendance"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex justify-center mb-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                      Loading records...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex justify-center mb-2">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s, i) => {
                    const badge = getPctBadge(s.percent);
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-500 font-bold border border-slate-200/50">
                            {s.rollNumber || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${avatarColors[i % avatarColors.length]}`}>
                              {s.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-xs">{s.firstName} {s.lastName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">Total: {s.total} days</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-emerald-600 font-bold">{s.present}</td>
                        <td className="px-4 py-3 text-xs text-rose-600 font-bold">{s.absent}</td>
                        <td className="px-4 py-3 text-xs text-amber-600 font-bold">{s.leave}</td>
                        <td className="px-4 py-3 text-xs text-blue-600 font-bold">{s.late}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${s.percent}%`, background: getBarColor(s.percent) }}
                              />
                            </div>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                              {s.percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top & Low */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
            <div className="px-4 py-3.5 border-b border-slate-100/80 bg-emerald-50/50 flex items-center gap-2 font-bold text-xs text-emerald-800 uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Top Performers ≥ 90%</span>
            </div>
            <div className="divide-y divide-slate-100">
              {topPerformers.length ? (
                topPerformers.map((s, i) => (
                  <div key={s._id} className="flex justify-between items-center px-5 py-3 hover:bg-emerald-50/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${avatarColors[i % avatarColors.length]}`}>
                        {s.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{s.firstName} {s.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{s.rollNumber || "—"}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xs">
                      {s.percent}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-400 text-xs font-medium">No students in top range</div>
              )}
            </div>
          </div>

          {/* Low Attendance */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
            <div className="px-4 py-3.5 border-b border-slate-100/80 bg-rose-50/50 flex items-center gap-2 font-bold text-xs text-rose-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Low Attendance &lt; 75%</span>
            </div>
            <div className="divide-y divide-slate-100">
              {lowAttendance.length ? (
                lowAttendance.map((s, i) => (
                  <div key={s._id} className="flex justify-between items-center px-5 py-3 hover:bg-rose-50/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                        {s.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{s.firstName} {s.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{s.rollNumber || "—"}</div>
                      </div>
                    </div>
                    <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-bold text-xs">
                      {s.percent}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> All students have good attendance
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}