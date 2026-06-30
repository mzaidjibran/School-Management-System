import { useState, useEffect } from "react";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf, FaEye, FaEdit, FaTrash, FaCheckCircle, FaClock, FaCalendarCheck, FaTimesCircle } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllExams, deleteExam, updateExam } from "../../api/Exam_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";

const STATUS_MAP = {
  scheduled: { label: "Scheduled", style: "bg-blue-50 text-blue-700 border border-blue-200",    icon: <FaClock className="w-2.5 h-2.5" /> },
  ongoing:   { label: "Ongoing",   style: "bg-amber-50 text-amber-700 border border-amber-200", icon: <FaCalendarCheck className="w-2.5 h-2.5" /> },
  completed: { label: "Completed", style: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <FaCheckCircle className="w-2.5 h-2.5" /> },
  cancelled: { label: "Cancelled", style: "bg-rose-50 text-rose-700 border border-rose-200",    icon: <FaTimesCircle className="w-2.5 h-2.5" /> },
};

const EXAM_TYPE_LABELS = {
  mid_term: "Mid Term", final_term: "Final Term",
  unit_test: "Unit Test", practical: "Practical", quiz: "Quiz",
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, style: "bg-slate-100 text-slate-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.style}`}>
      {s.icon} {s.label}
    </span>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse p-4 space-y-2">
    {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="text-sm font-medium text-slate-600">No exams found</p>
    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters</p>
  </div>
);

// ── Edit Modal ────────────────────────────────────────────────────
const EditModal = ({ exam, classes, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:         exam.name || "",
    status:       exam.status || "scheduled",
    venue:        exam.venue || "",
    totalMarks:   exam.totalMarks || "",
    passingMarks: exam.passingMarks || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const result = await updateExam(exam._id, {
        ...form, totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks),
      });
      onSave(result.data);
      onClose();
    } catch (error) {
      setErr(error.message || "Update fail ho gaya");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Edit Exam</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Exam Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Venue</label>
            <input name="venue" value={form.venue} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total Marks</label>
              <input type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Passing Marks</label>
              <input type="number" name="passingMarks" value={form.passingMarks} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>
          {err && <p className="text-rose-500 text-xs">{err}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Update Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ExamList() {
  const [exams, setExams]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [classes, setClasses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [classFilter, setClassFilter]   = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [editExam, setEditExam]     = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, classRes] = await Promise.all([getAllExams(), getAllClasses()]);
        setExams(examRes.data || []);
        setFiltered(examRes.data || []);
        setClasses(classRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = exams;
    if (search)       result = result.filter((e) => e.name?.toLowerCase().includes(search.toLowerCase()) || e.subject?.toLowerCase().includes(search.toLowerCase()));
    if (classFilter)  result = result.filter((e) => e.class?._id === classFilter);
    if (typeFilter)   result = result.filter((e) => e.examType === typeFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, classFilter, typeFilter, statusFilter, exams]);

  const totalPages    = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total:     exams.length,
    scheduled: exams.filter((e) => e.status === "scheduled").length,
    ongoing:   exams.filter((e) => e.status === "ongoing").length,
    completed: exams.filter((e) => e.status === "completed").length,
  };

  const handleDelete = (exam) => {
    confirmToast(
      `Delete "${exam.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteExam(exam._id);
          setExams((prev) => prev.filter((e) => e._id !== exam._id));
          toast.success("Exam deleted successfully!");
        } catch (err) {
          toast.error(err.message || "Failed to delete exam");
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  const handleSave = (updated) => {
    setExams((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
  };

  const flatRows = () => filtered.map((e) => ({
    "Exam Name": e.name, "Class": e.class?.name || "—", "Section": e.class?.section || "—",
    "Subject": e.subject, "Type": EXAM_TYPE_LABELS[e.examType] || e.examType,
    "Date": e.examDate ? new Date(e.examDate).toLocaleDateString() : "—",
    "Total Marks": e.totalMarks, "Status": e.status,
  }));

  const exportCSV = () => {
    const rows = flatRows();
    const headers = Object.keys(rows[0] || {});
    const csv = [headers, ...rows.map((r) => headers.map((h) => r[h]))].map((r) => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "exams.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(flatRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exams");
    XLSX.writeFile(wb, "exams.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Exam Schedule", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Exam Name","Class","Subject","Type","Date","Marks","Status"]],
      body: filtered.map((e) => [e.name, `${e.class?.name || "—"} ${e.class?.section || ""}`, e.subject, EXAM_TYPE_LABELS[e.examType] || e.examType, e.examDate ? new Date(e.examDate).toLocaleDateString() : "—", e.totalMarks, e.status]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("exams.pdf");
  };

  const classOptions = classes.map((c) => ({ value: c._id, label: `${c.name} — ${c.section}` }));

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <nav className="flex text-xs text-slate-400 mb-1 gap-1">
              <span>Dashboard</span><span>/</span>
              <span className="text-indigo-600">Exam Management</span>
            </nav>
            <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage all school exams, schedules, and results</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={exportCSV}   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition"><FaFileCsv className="text-emerald-600" /> CSV</button>
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-xs font-medium transition"><FaFileExcel className="text-green-600" /> Excel</button>
            <button onClick={exportPDF}   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-medium transition"><FaFilePdf className="text-rose-600" /> PDF</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label:"Total Exams", value:stats.total, icon:<FaCalendarCheck />, color:"text-indigo-600", bg:"bg-indigo-50" },
            { label:"Scheduled",   value:stats.scheduled, icon:<FaClock />, color:"text-blue-600", bg:"bg-blue-50" },
            { label:"Ongoing",     value:stats.ongoing, icon:<FaCalendarCheck />, color:"text-amber-600", bg:"bg-amber-50" },
            { label:"Completed",   value:stats.completed, icon:<FaCheckCircle />, color:"text-emerald-600", bg:"bg-emerald-50" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color} text-sm`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
              <input type="text" placeholder="Search exam or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
              <option value="">All Classes</option>
              {classOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
              <option value="">All Types</option>
              {Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
              <option value="">All Status</option>
              {Object.entries(STATUS_MAP).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Exam Name","Class","Subject","Type","Date","Marks","Status","Actions"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8"><TableSkeleton /></td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="8"><EmptyState /></td></tr>
                ) : paginatedData.map((exam) => (
                  <tr key={exam._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{exam.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{exam.class?.name} {exam.class?.section ? `— ${exam.class.section}` : ""}</td>
                    <td className="py-2.5 px-4 text-slate-600">{exam.subject}</td>
                    <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{EXAM_TYPE_LABELS[exam.examType] || exam.examType}</span></td>
                    <td className="py-2.5 px-4 text-slate-600">{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "—"}</td>
                    <td className="py-2.5 px-4 text-slate-600">{exam.totalMarks}</td>
                    <td className="py-2.5 px-4"><StatusBadge status={exam.status} /></td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditExam(exam)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"><FaEdit className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(exam)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"><FaTrash className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && paginatedData.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Showing {(currentPage-1)*itemsPerPage+1}–{Math.min(currentPage*itemsPerPage, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1.5">
                <button disabled={currentPage===1} onClick={() => setCurrentPage((p) => p-1)} className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
                <span className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-lg">{currentPage}</span>
                <button disabled={currentPage===totalPages} onClick={() => setCurrentPage((p) => p+1)} className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {editExam && <EditModal exam={editExam} classes={classes} onClose={() => setEditExam(null)} onSave={handleSave} />}
    </div>
  );
}