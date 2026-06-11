import { useState, useEffect } from "react";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Data ----------
const generateAttendanceRecords = () => {
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
  ];
  const statuses = ["Present", "Absent", "Leave", "Late"];
  const dates = [
    "2025-03-10",
    "2025-03-11",
    "2025-03-12",
    "2025-03-13",
    "2025-03-14",
  ];
  const records = [];
  for (let i = 0; i < 35; i++) {
    records.push({
      id: i + 1,
      rollNo: students[i % students.length].rollNo,
      studentName: students[i % students.length].name,
      class: students[i % students.length].class,
      section: students[i % students.length].section,
      date: dates[Math.floor(Math.random() * dates.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      remarks: i % 5 === 0 ? "Medical leave" : "",
    });
  }
  return records;
};

// ---------- Skeleton Loader ----------
const TableSkeleton = () => (
  <div className="animate-pulse px-4 py-3">
    <div className="h-8 bg-slate-200 rounded mb-2" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 mb-1 rounded" />
    ))}
  </div>
);

// ---------- Empty State ----------
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
      <svg
        className="w-12 h-12 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    </div>
    <h3 className="mt-4 text-base font-medium text-slate-700">
      No attendance records found
    </h3>
    <p className="text-sm text-slate-400 mt-1">
      Try adjusting your search or filters
    </p>
  </div>
);

// ---------- Status Badge ----------
const StatusBadge = ({ status }) => {
  const styles = {
    Present: "bg-emerald-100 text-emerald-700",
    Absent: "bg-rose-100    text-rose-700",
    Leave: "bg-amber-100   text-amber-700",
    Late: "bg-blue-100    text-blue-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => {
      const data = generateAttendanceRecords();
      setRecords(data);
      setFiltered(data);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = records;
    if (search)
      result = result.filter(
        (r) =>
          r.studentName.toLowerCase().includes(search.toLowerCase()) ||
          r.rollNo.includes(search),
      );
    if (dateFilter) result = result.filter((r) => r.date === dateFilter);
    if (classFilter) result = result.filter((r) => r.class === classFilter);
    if (sectionFilter)
      result = result.filter((r) => r.section === sectionFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, dateFilter, classFilter, sectionFilter, statusFilter, records]);

  // Stats
  const totalStudents = [...new Set(records.map((r) => r.rollNo))].length;
  const today = new Date().toISOString().split("T")[0];
  const presentToday = records.filter(
    (r) => r.date === today && r.status === "Present",
  ).length;
  const absentToday = records.filter(
    (r) => r.date === today && r.status === "Absent",
  ).length;
  const attendancePercent = totalStudents
    ? ((presentToday / totalStudents) * 100).toFixed(1)
    : 0;

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Exports
  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Class",
      "Section",
      "Date",
      "Status",
      "Remarks",
    ];
    const rows = filtered.map((r) => [
      r.rollNo,
      r.studentName,
      r.class,
      r.section,
      r.date,
      r.status,
      r.remarks,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "attendance.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        "Roll No": r.rollNo,
        "Student Name": r.studentName,
        Class: r.class,
        Section: r.section,
        Date: r.date,
        Status: r.status,
        Remarks: r.remarks,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        ["Roll No", "Student", "Class", "Section", "Date", "Status", "Remarks"],
      ],
      body: filtered.map((r) => [
        r.rollNo,
        r.studentName,
        r.class,
        r.section,
        r.date,
        r.status,
        r.remarks,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("attendance.pdf");
  };

  const uniqueClasses = [...new Set(records.map((r) => r.class))];
  const uniqueSections = [...new Set(records.map((r) => r.section))];
  const uniqueDates = [...new Set(records.map((r) => r.date))];

  // Compact input style
  const inputCls =
    "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

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
            Attendance Records
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Attendance Records
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              View and manage student attendance history
            </p>
          </div>

          {/* Colorful export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FaFileCsv className="text-emerald-600 text-sm" /> CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <FaFileExcel className="text-green-600 text-sm" /> Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <FaFilePdf className="text-rose-500 text-sm" /> PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Students",
              value: totalStudents,
              color: "text-slate-800",
              bg: "bg-indigo-100",
              iconColor: "text-indigo-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ),
            },
            {
              label: "Present Today",
              value: presentToday,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
              iconColor: "text-emerald-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              label: "Absent Today",
              value: absentToday,
              color: "text-rose-600",
              bg: "bg-rose-100",
              iconColor: "text-rose-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ),
            },
            {
              label: "Attendance %",
              value: `${attendancePercent}%`,
              color: "text-blue-600",
              bg: "bg-blue-100",
              iconColor: "text-blue-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              ),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div
                className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}
              >
                <svg
                  className={`w-4 h-4 ${card.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {card.icon}
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Filters — compact single row */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 items-center">
            {/* Search */}
            <div className="relative lg:col-span-1">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Name or roll no…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
              />
            </div>

            {/* Date */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Dates</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Class */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
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
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Sections</option>
              {uniqueSections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Roll No",
                    "Student Name",
                    "Class",
                    "Section",
                    "Date",
                    "Status",
                    "Remarks",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-500">
                        {record.rollNo}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {record.studentName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {record.class}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {record.section}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {record.date}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 italic">
                        {record.remarks || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && paginatedData.length > 0 && (
            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-slate-100 gap-2">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                {filtered.length} entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-lg">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
