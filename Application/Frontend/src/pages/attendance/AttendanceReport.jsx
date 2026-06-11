import { useState, useEffect } from "react";
import {
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
  FaBed,
  FaClock,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Data ----------
const generateStudentReports = () => {
  const students = [
    {
      id: 1,
      name: "Ali Raza",
      rollNo: "2024-001",
      class: "10th",
      section: "A",
    },
    {
      id: 2,
      name: "Sana Khan",
      rollNo: "2024-002",
      class: "10th",
      section: "A",
    },
    {
      id: 3,
      name: "Imran Ali",
      rollNo: "2024-003",
      class: "10th",
      section: "B",
    },
    {
      id: 4,
      name: "Fatima Ahmed",
      rollNo: "2024-004",
      class: "9th",
      section: "A",
    },
    {
      id: 5,
      name: "Usman Chaudhry",
      rollNo: "2024-005",
      class: "9th",
      section: "B",
    },
    {
      id: 6,
      name: "Ayesha Siddiqui",
      rollNo: "2024-006",
      class: "11th",
      section: "A",
    },
  ];
  return students.map((s) => {
    const present = Math.floor(Math.random() * 180) + 20;
    const totalDays = 200;
    const absent = totalDays - present - Math.floor(Math.random() * 15);
    const leave = Math.floor(Math.random() * 10);
    const late = Math.floor(Math.random() * 8);
    const percent = ((present / totalDays) * 100).toFixed(1);
    return {
      ...s,
      present,
      absent,
      leave,
      late,
      totalDays,
      percent: parseFloat(percent),
    };
  });
};

const generateMonthlySummary = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m) => ({
    month: m,
    present: Math.floor(Math.random() * 180) + 20,
    absent: Math.floor(Math.random() * 20),
    leave: Math.floor(Math.random() * 8),
    late: Math.floor(Math.random() * 6),
  }));
};

const generateClassWiseSummary = () => {
  const classes = ["9th", "10th", "11th", "12th"];
  return classes.map((c) => ({
    class: c,
    totalStudents: Math.floor(Math.random() * 40) + 20,
    avgAttendance: Math.floor(Math.random() * 20) + 75,
  }));
};

export default function AttendanceReport() {
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [monthlyData] = useState(generateMonthlySummary());
  const [classWiseData] = useState(generateClassWiseSummary());
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-03-31");

  useEffect(() => {
    setTimeout(() => {
      const data = generateStudentReports();
      setStudentData(data);
      setFilteredData(data);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = studentData;
    if (classFilter) result = result.filter((s) => s.class === classFilter);
    if (sectionFilter)
      result = result.filter((s) => s.section === sectionFilter);
    if (studentFilter)
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(studentFilter.toLowerCase()) ||
          s.rollNo.includes(studentFilter),
      );
    setFilteredData(result);
  }, [classFilter, sectionFilter, studentFilter, studentData]);

  // Statistics
  const totalPresentDays = filteredData.reduce((acc, s) => acc + s.present, 0);
  const totalAbsentDays = filteredData.reduce((acc, s) => acc + s.absent, 0);
  const totalLeaveDays = filteredData.reduce((acc, s) => acc + s.leave, 0);
  const totalLateDays = filteredData.reduce((acc, s) => acc + s.late, 0);
  const totalPossible = filteredData.reduce((acc, s) => acc + s.totalDays, 0);
  const overallPercent = totalPossible
    ? ((totalPresentDays / totalPossible) * 100).toFixed(1)
    : 0;

  const getPercentColor = (percent) => {
    if (percent >= 90) return "text-emerald-600 bg-emerald-50";
    if (percent >= 75) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const topPerformers = filteredData
    .filter((s) => s.percent >= 90)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
  const lowAttendance = filteredData
    .filter((s) => s.percent < 75)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 5);

  // Export functions
  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Class",
      "Section",
      "Present",
      "Absent",
      "Leave",
      "Late",
      "Attendance %",
    ];
    const rows = filteredData.map((s) => [
      s.rollNo,
      s.name,
      s.class,
      s.section,
      s.present,
      s.absent,
      s.leave,
      s.late,
      s.percent,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "attendance_report.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((s) => ({
        "Roll No": s.rollNo,
        "Student Name": s.name,
        Class: s.class,
        Section: s.section,
        Present: s.present,
        Absent: s.absent,
        Leave: s.leave,
        Late: s.late,
        "Attendance %": s.percent,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "attendance_report.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Roll No",
          "Student",
          "Class",
          "Section",
          "Present",
          "Absent",
          "Leave",
          "Late",
          "Att %",
        ],
      ],
      body: filteredData.map((s) => [
        s.rollNo,
        s.name,
        s.class,
        s.section,
        s.present,
        s.absent,
        s.leave,
        s.late,
        `${s.percent}%`,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("attendance_report.pdf");
  };

  const uniqueClasses = [...new Set(studentData.map((s) => s.class))];
  const uniqueSections = [...new Set(studentData.map((s) => s.section))];

  // Shared compact input style
  const inputCls =
    "h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">
            Attendance Reports
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Attendance Reports
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Analytics and insights on student attendance
            </p>
          </div>

          {/* Colorful export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FaFileCsv className="text-emerald-600 text-sm" />
              CSV
            </button>
            <button
              onClick={exportExcel}
              title="Export Excel"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <FaFileExcel className="text-green-600 text-sm" />
              Excel
            </button>
            <button
              onClick={exportPDF}
              title="Export PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <FaFilePdf className="text-rose-500 text-sm" />
              PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "Overall Attendance",
              value: `${overallPercent}%`,
              color: "text-indigo-600",
              icon: <FaChartLine className="text-indigo-300 text-xl" />,
            },
            {
              label: "Present %",
              value: `${totalPossible ? ((totalPresentDays / totalPossible) * 100).toFixed(1) : 0}%`,
              color: "text-emerald-600",
              icon: <FaUserCheck className="text-emerald-300 text-xl" />,
            },
            {
              label: "Absent %",
              value: `${totalPossible ? ((totalAbsentDays / totalPossible) * 100).toFixed(1) : 0}%`,
              color: "text-rose-600",
              icon: <FaUserTimes className="text-rose-300   text-xl" />,
            },
            {
              label: "Leave %",
              value: `${totalPossible ? ((totalLeaveDays / totalPossible) * 100).toFixed(1) : 0}%`,
              color: "text-amber-600",
              icon: <FaBed className="text-amber-300  text-xl" />,
            },
            {
              label: "Late %",
              value: `${totalPossible ? ((totalLateDays / totalPossible) * 100).toFixed(1) : 0}%`,
              color: "text-blue-600",
              icon: <FaClock className="text-blue-300   text-xl" />,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-slate-500 leading-tight">
                  {card.label}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              {card.icon}
            </div>
          ))}
        </div>

        {/* Filters — compact row */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-center">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search name or roll no…"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Class */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={inputCls}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Section */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className={inputCls}
            >
              <option value="">All Sections</option>
              {uniqueSections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Date range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-7">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  {[
                    "Roll No",
                    "Student",
                    "Class",
                    "Section",
                    "Present",
                    "Absent",
                    "Leave",
                    "Late",
                    "Attendance %",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-slate-400">
                      Loading…
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-slate-400">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-500">{s.rollNo}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-4">{s.class}</td>
                      <td className="py-2.5 px-4">{s.section}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-medium">
                        {s.present}
                      </td>
                      <td className="py-2.5 px-4 text-rose-500">{s.absent}</td>
                      <td className="py-2.5 px-4 text-amber-500">{s.leave}</td>
                      <td className="py-2.5 px-4 text-blue-500">{s.late}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPercentColor(s.percent)}`}
                        >
                          {s.percent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Monthly Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">
              Monthly Attendance Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="text-left py-2 font-medium">Month</th>
                    <th className="text-center py-2 font-medium text-emerald-600">
                      Present
                    </th>
                    <th className="text-center py-2 font-medium text-rose-500">
                      Absent
                    </th>
                    <th className="text-center py-2 font-medium text-amber-500">
                      Leave
                    </th>
                    <th className="text-center py-2 font-medium text-blue-500">
                      Late
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr
                      key={m.month}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-1.5 font-medium text-slate-700">
                        {m.month}
                      </td>
                      <td className="py-1.5 text-center text-emerald-600">
                        {m.present}
                      </td>
                      <td className="py-1.5 text-center text-rose-500">
                        {m.absent}
                      </td>
                      <td className="py-1.5 text-center text-amber-500">
                        {m.leave}
                      </td>
                      <td className="py-1.5 text-center text-blue-500">
                        {m.late}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Wise */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm">
              Class Wise Attendance
            </h3>
            <div className="space-y-4">
              {classWiseData.map((c) => (
                <div key={c.class}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      Class {c.class}
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {c.avgAttendance}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${c.avgAttendance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers & Low Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-emerald-700 mb-3 text-sm">
              🏆 Top Performers (≥90%)
            </h3>
            {topPerformers.length ? (
              <ul className="divide-y divide-slate-100">
                {topPerformers.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center py-2 text-sm"
                  >
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-emerald-600 font-semibold">
                      {s.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">No students in top range</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-rose-600 mb-3 text-sm">
              ⚠️ Low Attendance (&lt;75%)
            </h3>
            {lowAttendance.length ? (
              <ul className="divide-y divide-slate-100">
                {lowAttendance.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center py-2 text-sm"
                  >
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-rose-500 font-semibold">
                      {s.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">
                All students have good attendance ✓
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
