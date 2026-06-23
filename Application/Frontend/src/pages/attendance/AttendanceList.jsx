import { useState, useEffect } from "react";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllClasses } from "../../api/Class_Api.js";
import { getAttendanceByClassAndDate } from "../../api/Attendence_Api.js";

// ---------- Skeleton ----------
const TableSkeleton = () => (
  <div className="animate-pulse px-4 py-3">
    <div className="h-8 bg-slate-200 rounded mb-2" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 mb-1 rounded" />
    ))}
  </div>
);

// ---------- Empty State ----------
const EmptyState = ({ message = "No attendance records found" }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <h3 className="text-base font-medium text-slate-700">{message}</h3>
    <p className="text-sm text-slate-400 mt-1">Class aur date select karo records dekhne ke liye</p>
  </div>
);

// ---------- Status Badge ----------
const StatusBadge = ({ status }) => {
  const styles = {
    present: "bg-emerald-100 text-emerald-700",
    absent:  "bg-rose-100    text-rose-700",
    leave:   "bg-amber-100   text-amber-700",
    late:    "bg-blue-100    text-blue-700",
  };
  const labels = { present: "Present", absent: "Absent", leave: "Leave", late: "Late" };
  const key = status?.toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[key] || "bg-slate-100 text-slate-600"}`}>
      {labels[key] || status}
    </span>
  );
};

export default function AttendanceList() {
  const [classes, setClasses]         = useState([]);
  const [records, setRecords]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate]   = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Load classes ───────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getAllClasses();
        setClasses(result.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetch();
  }, []);

  // ── Load attendance jab class ya date change ho ───────────────
  useEffect(() => {
    if (!selectedClass || !selectedDate) {
      setRecords([]);
      setFiltered([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await getAttendanceByClassAndDate(selectedClass, selectedDate);
        setRecords(result.data || []);
      } catch (e) {
        console.error(e);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedClass, selectedDate]);

  // ── Client-side filters ───────────────────────────────────────
  useEffect(() => {
    let result = records;
    if (search) {
      result = result.filter((r) => {
        const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.toLowerCase();
        const roll = r.student?.rollNumber || "";
        return name.includes(search.toLowerCase()) || roll.includes(search);
      });
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, statusFilter, records]);

  // ── Stats ──────────────────────────────────────────────────────
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount  = records.filter((r) => r.status === "absent").length;
  const leaveCount   = records.filter((r) => r.status === "leave").length;
  const lateCount    = records.filter((r) => r.status === "late").length;
  const attendancePct = records.length
    ? ((presentCount / records.length) * 100).toFixed(1)
    : 0;

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages    = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Exports ────────────────────────────────────────────────────
  const flatRows = () =>
    filtered.map((r) => ({
      rollNo:      r.student?.rollNumber || "—",
      studentName: `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim(),
      date:        new Date(r.date).toLocaleDateString(),
      status:      r.status,
      remarks:     r.remarks || "",
    }));

  const exportCSV = () => {
    const headers = ["Roll No", "Student Name", "Date", "Status", "Remarks"];
    const rows    = flatRows().map((r) => [r.rollNo, r.studentName, r.date, r.status, r.remarks]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }),
      "attendance.csv"
    );
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(flatRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 10);
    autoTable(doc, {
      startY: 20,
      head:   [["Roll No", "Student", "Date", "Status", "Remarks"]],
      body:   flatRows().map((r) => [r.rollNo, r.studentName, r.date, r.status, r.remarks]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("attendance.pdf");
  };

  const inputCls = "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Attendance Records</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
            <p className="text-slate-500 text-sm mt-0.5">Class aur date select karke records dekho</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV}   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
              <FaFileCsv className="text-sm" /> CSV
            </button>
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition">
              <FaFileExcel className="text-sm" /> Excel
            </button>
            <button onClick={exportPDF}   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition">
              <FaFilePdf className="text-sm" /> PDF
            </button>
          </div>
        </div>

        {/* Class + Date selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loadingClasses}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">{loadingClasses ? "Loading..." : "-- Select Class --"}</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — Section {c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total",      value: records.length, color: "text-slate-800",   bg: "bg-indigo-100"  },
              { label: "Present",    value: presentCount,   color: "text-emerald-600", bg: "bg-emerald-100" },
              { label: "Absent",     value: absentCount,    color: "text-rose-600",    bg: "bg-rose-100"    },
              { label: "Leave",      value: leaveCount,     color: "text-amber-600",   bg: "bg-amber-100"   },
              { label: "Attendance", value: `${attendancePct}%`, color: "text-blue-600", bg: "bg-blue-100"  },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded-xl`} />
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Name ya roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["#", "Roll No", "Student Name", "Date", "Status", "Remarks"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6"><TableSkeleton /></td></tr>
                ) : !selectedClass ? (
                  <tr><td colSpan="6"><EmptyState message="Pehle class aur date select karo" /></td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="6"><EmptyState message="Is date ke liye koi record nahi mila" /></td></tr>
                ) : (
                  paginatedData.map((record, idx) => (
                    <tr key={record._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="py-2.5 px-4 text-slate-500">{record.student?.rollNumber || "—"}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {record.student?.firstName} {record.student?.lastName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {new Date(record.date).toLocaleDateString()}
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
                {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-lg">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
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