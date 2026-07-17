import { useState, useEffect, useRef } from "react";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllClasses } from "../../api/Class_Api.js";
import { getAttendanceByClassAndDate, markAttendance, deleteAttendance } from "../../api/Attendance_Api.js";
import { getAllStudents } from "../../api/Student_Api.js";
import { confirmToast } from "../../utils/toastHelpers.jsx";
import toast from "react-hot-toast";

// ---------- Skeleton ----------
const TableSkeleton = () => (
  <div className="animate-pulse px-4 py-3">
    <div className="h-8 bg-slate-200 rounded-md mb-2" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 mb-1 rounded-md" />
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
  // Get local timezone-safe date string (YYYY-MM-DD)
  const getLocalDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  };

  const [classes, setClasses]         = useState([]);
  const [records, setRecords]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate]   = useState(getLocalDateString());
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSection, setSelectedSection] = useState(
    localStorage.getItem("activeSection") || "girls"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset class when section changes
  useEffect(() => {
    setSelectedClass("");
  }, [selectedSection]);

  // ── Load classes ───────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getAllClasses({ section: "all" });
        setClasses(result.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load classes: " + e.message);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetch();
  }, []);

  // ── Load attendance jab class, date ya section change ho ───────────
  useEffect(() => {
    if (!selectedClass || !selectedDate || !selectedSection) {
      setRecords([]);
      setFiltered([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await getAttendanceByClassAndDate(selectedClass, selectedDate, selectedSection);
        setRecords(result.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load attendance records: " + e.message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedClass, selectedDate, selectedSection]);

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
    toast.success("Attendance CSV downloaded successfully!");
  };

  const parseCSV = (text) => {
    const lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') lines.push(row);
    const headers = lines[0].map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const r = lines[i];
      if (r.length === 0 || (r.length === 1 && !r[0])) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] !== undefined) ? r[idx].trim() : "";
      });
      data.push(obj);
    }
    return data;
  };

  const csvFileInputRef = useRef(null);

  const handleBackupData = () => {
    const headers = ["rollNumber", "studentName", "date", "className", "schoolSection", "status", "remarks"];
    const rows = records.map((r) => [
      r.student?.rollNumber || "",
      `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim(),
      r.date ? r.date.split("T")[0] : "",
      r.class?.name || "",
      r.schoolSection || r.section || "",
      r.status || "present",
      r.remarks || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "attendance_backup.csv");
    toast.success("Attendance backup downloaded successfully!");
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast.error("CSV file is empty");
          return;
        }
        const [classesRes, studentsRes] = await Promise.all([
          getAllClasses({ section: "all" }),
          getAllStudents()
        ]);
        const classesList = classesRes.data || [];
        const studentsList = studentsRes.data || [];
        let successCount = 0;
        let failCount = 0;
        const loadingToastId = toast.loading("Uploading attendance...");
        const markPayload = [];
        for (const row of parsed) {
          try {
            // Case-insensitive key lookup helper
            const getVal = (r, ...keys) => {
              for (const k of keys) {
                if (r[k] !== undefined) return r[k];
                const foundKey = Object.keys(r).find(
                  (rk) => rk.trim().toLowerCase() === k.toLowerCase()
                );
                if (foundKey) return r[foundKey];
              }
              return "";
            };

            const rollNo = getVal(row, "rollNumber", "roll number", "roll no", "rollNo");
            const className = getVal(row, "className", "class name", "class");
            const date = getVal(row, "date");
            const schoolSection = getVal(row, "schoolSection", "school section", "section");
            const status = getVal(row, "status");
            const remarks = getVal(row, "remarks", "remark");

            const matchedClass = className ? classesList.find(c => c.name.toLowerCase() === className.toLowerCase()) : null;
            const matchedStudent = studentsList.find(s => s.rollNumber === rollNo);
            if (!matchedStudent) {
              console.warn(`Student with roll number ${rollNo} not found.`);
              failCount++;
              continue;
            }
            markPayload.push({
              student: matchedStudent._id,
              class: matchedClass ? matchedClass._id : selectedClass || matchedStudent.class?._id || matchedStudent.class,
              date: date || selectedDate || getLocalDateString(),
              section: (schoolSection || selectedSection || "girls").toLowerCase(),
              status: (status || "present").toLowerCase(),
              remarks: remarks || "",
              lateMinutes: 0
            });
            successCount++;
          } catch (err) {
            console.error("Failed to map attendance CSV row:", row, err);
            toast.error(`Failed mapping row: ${err.message}`);
            failCount++;
          }
        }
        if (markPayload.length > 0) {
          await markAttendance(markPayload);
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) {
          toast.success(`${successCount} attendance records uploaded successfully!`);
          if (selectedClass && selectedDate && selectedSection) {
            const result = await getAttendanceByClassAndDate(selectedClass, selectedDate, selectedSection);
            setRecords(result.data || []);
          }
        }
        if (failCount > 0) {
          toast.error(`${failCount} rows failed to upload. Check console.`);
        }
      } catch (err) {
        toast.error("Failed to parse CSV: " + err.message);
      } finally {
        if (csvFileInputRef.current) csvFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(flatRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
    toast.success("Attendance Excel downloaded successfully!");
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
    toast.success("Attendance PDF downloaded successfully!");
  };

  const handleDelete = (id) => {
    confirmToast(
      "Are you sure you want to delete this attendance record?",
      async () => {
        try {
          await deleteAttendance(id);
          toast.success("Attendance record deleted successfully!");
          if (selectedClass && selectedDate && selectedSection) {
            const result = await getAttendanceByClassAndDate(selectedClass, selectedDate, selectedSection);
            setRecords(result.data || []);
          }
        } catch (e) {
          console.error(e);
          toast.error("Failed to delete attendance record: " + e.message);
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  const inputCls = "h-8 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Attendance Records</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
            <p className="text-slate-500 text-sm mt-0.5">Class aur date select karke records dekho</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
            <button type="button" onClick={() => csvFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
            <button type="button" onClick={handleBackupData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup Data</button>
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition">
              <FaFileExcel className="text-sm" /> Excel
            </button>
            <button onClick={exportPDF}   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition">
              <FaFilePdf className="text-sm" /> PDF
            </button>
          </div>
        </div>

        {/* Class + Date selector */}
        <div className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-white outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="girls">Girls</option>
                <option value="boys">Boys</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loadingClasses}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-white outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="">{loadingClasses ? "Loading..." : "-- Select Class --"}</option>
                {classes
                  .filter((c) => c.schoolSection === selectedSection)
                  .map((c) => (
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
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-white outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total",      value: records.length, color: "text-slate-800",   bg: "bg-indigo-100"  },
              { label: "Present",    value: presentCount,   color: "text-emerald-600", bg: "bg-emerald-100" },
              { label: "Absent",     value: absentCount,    color: "text-rose-600",    bg: "bg-rose-100"    },
              { label: "Leave",      value: leaveCount,     color: "text-amber-600",   bg: "bg-amber-100"   },
              { label: "Attendance", value: `${attendancePct}%`, color: "text-blue-600", bg: "bg-blue-100"  },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-md shadow-sm border border-slate-100 p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded`} />
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-md shadow-sm border border-slate-100 px-4 py-3">
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
        <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : !selectedClass ? (
            <EmptyState message="Please select a class and date first" />
          ) : paginatedData.length === 0 ? (
            <EmptyState message="No records found for this date" />
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["#", "Roll No", "Student Name", "Date", "Status", "Remarks", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record, idx) => (
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
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition duration-150"
                            title="Delete Attendance"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="block md:hidden p-4 space-y-3 bg-slate-50/50">
                {paginatedData.map((record, idx) => {
                  const avatarColor = idx % 2 === 0 ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700";
                  return (
                    <div key={record._id} className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex flex-col gap-3 transition duration-200 hover:shadow-md hover:border-indigo-100">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${avatarColor} font-bold text-xs flex items-center justify-center`}>
                            {record.student?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {record.student?.firstName} {record.student?.lastName}
                            </p>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono font-bold border border-slate-200/40">
                              Roll: {record.student?.rollNumber || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.status} />
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition duration-150 border border-transparent hover:border-rose-100"
                            title="Delete Attendance"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-50 pt-2.5">
                        <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                        <span className="text-slate-400">#{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                      </div>

                      {record.remarks && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100/80 italic mt-0.5">
                          <strong className="text-[10px] text-slate-400 uppercase font-bold not-italic block mb-0.5">Remarks</strong>
                          {record.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

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
                  className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-md">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
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