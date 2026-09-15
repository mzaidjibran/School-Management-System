import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaCalendarCheck,
  FaTimesCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllExams, deleteExam, updateExam } from "../../api/Exam_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";
import { useAuth } from "../auth/useAuth.js";

const STATUS_MAP = {
  scheduled: {
    label: "Scheduled",
    style: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <FaClock className="w-2.5 h-2.5" />,
  },
  ongoing: {
    label: "Ongoing",
    style: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <FaCalendarCheck className="w-2.5 h-2.5" />,
  },
  completed: {
    label: "Completed",
    style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <FaCheckCircle className="w-2.5 h-2.5" />,
  },
  cancelled: {
    label: "Cancelled",
    style: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: <FaTimesCircle className="w-2.5 h-2.5" />,
  },
};

const EXAM_TYPE_LABELS = {
  mid_term: "Mid Term",
  final_term: "Final Term",
  unit_test: "Unit Test",
  practical: "Practical",
  quiz: "Quiz",
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || {
    label: status,
    style: "bg-slate-100 text-slate-600",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.style}`}
    >
      {s.icon} {s.label}
    </span>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse p-4 space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 rounded-md" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
      <svg
        className="w-8 h-8 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <p className="text-sm font-medium text-slate-600">No exams found</p>
    <p className="text-xs text-slate-400 mt-0.5">
      Try adjusting your search or filters
    </p>
  </div>
);

const EditModal = ({ exam, classes, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: exam.name || "",
    status: exam.status || "scheduled",
    venue: exam.venue || "",
    totalMarks: exam.totalMarks || "",
    passingMarks: exam.passingMarks || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const result = await updateExam(exam._id, {
        ...form,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
      });
      toast.success("Exam updated successfully!");
      onSave(result.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Update failed.");
      setErr(error.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Edit Exam</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Exam Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            >
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Venue
            </label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                name="passingMarks"
                value={form.passingMarks}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
          {err && <p className="text-rose-500 text-xs">{err}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExamNoticeModal = ({ exam, schoolName, schoolLogo, onClose }) => {
  if (!exam) return null;
  const logoUrl = schoolLogo
    ? schoolLogo.startsWith("http")
      ? schoolLogo
      : `https://api.nullstacksloution.online${schoolLogo}`
    : null;

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${exam.name} - Exam Notice</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; margin: 0; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #326080; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-title { display: flex; align-items: center; gap: 15px; }
            .logo { width: 65px; height: 65px; object-fit: cover; border-radius: 50%; border: 2px solid #326080; }
            .school-name { font-size: 22px; font-weight: 800; color: #326080; margin: 0; }
            .notice-badge { font-size: 11px; font-weight: 700; color: #805232; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; }
            .exam-title-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
            .exam-name { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
            .exam-type { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; background: #ffffff; }
            .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 4px; }
            .instructions { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 12px; color: #92400e; line-height: 1.6; }
            .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; }
            .sig-line { border-bottom: 1px solid #000; width: 180px; margin-bottom: 6px; }
            .sig-text { font-size: 11px; font-weight: 700; color: #334155; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-title">
              ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : `<div style="width:60px;height:60px;border-radius:50%;background:#326080;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">${(schoolName || "S")[0]?.toUpperCase()}</div>`}
              <div>
                <h1 class="school-name">${schoolName || "Punjab Public High School"}</h1>
                <div class="notice-badge">Official Examination Notice & Schedule</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <strong>Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          <div class="exam-title-box">
            <div class="exam-type">${EXAM_TYPE_LABELS[exam.examType] || exam.examType || "Examination"}</div>
            <h2 class="exam-name">${exam.name}</h2>
          </div>

          <div class="grid">
            <div class="card"><div class="label">Class & Section</div><div class="val">${exam.class?.name || "—"} ${exam.class?.section ? `(${exam.class.section})` : ""}</div></div>
            <div class="card"><div class="label">Subject</div><div class="val" style="color:#326080;">${exam.subject}</div></div>
            <div class="card"><div class="label">Exam Date</div><div class="val">${exam.examDate ? new Date(exam.examDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "—"}</div></div>
            <div class="card"><div class="label">Time / Duration</div><div class="val">${exam.startTime || "Morning Session"} ${exam.duration ? `(${exam.duration} mins)` : ""}</div></div>
            <div class="card"><div class="label">Total Marks</div><div class="val">${exam.totalMarks} Marks</div></div>
            <div class="card"><div class="label">Passing Marks</div><div class="val" style="color:#805232;">${exam.passingMarks} Marks</div></div>
            <div class="card" style="grid-column: span 3;"><div class="label">Venue / Room</div><div class="val">${exam.venue || "Main Examination Hall / Respective Classroom"}</div></div>
          </div>

          <div class="instructions">
            <strong>📌 Examination Instructions:</strong><br/>
            ${(exam.instructions || "1. Students must bring their own stationery and admit card.\n2. Cell phones and unauthorized materials are strictly prohibited.\n3. Be present in the hall 15 minutes before the exam begins.").replace(/\n/g, "<br/>")}
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <div class="sig-text">Prepared By / Class Teacher</div>
            </div>
            <div style="text-align: right;">
              <div class="sig-line" style="margin-left: auto;"></div>
              <div class="sig-text">Principal Signature & Stamp</div>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print notice");
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden my-auto border border-slate-200">
        {/* Notice Header - School Branding */}
        <div className="bg-[#326080] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xl font-bold font-serif text-white">
                  {(schoolName || "S")[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-wide">
                {schoolName || "Punjab Public High School"}
              </h2>
              <p className="text-xs text-white/80 font-medium tracking-wider uppercase mt-0.5">
                Official Examination Notice & Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Notice Body */}
        <div className="p-6 space-y-5 bg-[#fffaf6]/40">
          {/* Main Title & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-[#805232] uppercase tracking-wider bg-[#805232]/10 px-2 py-0.5 rounded">
                {EXAM_TYPE_LABELS[exam.examType] || exam.examType || "Examination"}
              </span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {exam.name}
              </h3>
            </div>
            <StatusBadge status={exam.status} />
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Class & Section
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {exam.class?.name || "—"}{" "}
                {exam.class?.section ? `(${exam.class.section})` : ""}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Subject
              </span>
              <span className="font-bold text-[#326080] text-sm mt-0.5 block">
                {exam.subject}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Exam Date
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {exam.examDate
                  ? new Date(exam.examDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Time / Duration
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {exam.startTime || "Morning Session"}{" "}
                {exam.duration ? `(${exam.duration} mins)` : ""}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Total Marks
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {exam.totalMarks} Marks
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Passing Marks
              </span>
              <span className="font-bold text-[#805232] text-sm mt-0.5 block">
                {exam.passingMarks} Marks
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm col-span-2 sm:col-span-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Exam Venue / Hall
              </span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {exam.venue || "Main Examination Hall / Respective Classroom"}
              </span>
            </div>
          </div>

          {/* Instructions / Notice Notes */}
          <div className="bg-amber-50/70 border border-amber-200 rounded p-3.5 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold text-amber-950 uppercase tracking-wide block mb-1">
              📌 Instructions & Guidelines:
            </span>
            <p className="text-slate-700 whitespace-pre-wrap">
              {exam.instructions ||
                "1. Students must bring their own stationery and admit card.\n2. Cell phones, smart watches, and unauthorized materials are strictly prohibited.\n3. Students arriving more than 15 minutes after the start time will not be permitted."}
            </p>
          </div>

          {/* Signature Line */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p className="text-[10px] text-slate-400">Issued by Administration</p>
              <p className="font-bold text-slate-700">
                {schoolName || "School Administration"}
              </p>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-slate-300 w-32 mb-1"></div>
              <p className="font-bold text-slate-700">Principal Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
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
            onClick={handlePrint}
            className="px-4 py-2 bg-[#326080] hover:bg-[#254961] text-white rounded text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <FaPrint className="w-3.5 h-3.5" /> Print Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ExamList() {
  const { schoolName, schoolLogo } = useAuth();
  const [exams, setExams] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editExam, setEditExam] = useState(null);
  const [viewExam, setViewExam] = useState(null);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const [examRes, classRes] = await Promise.all([
        getAllExams(),
        getAllClasses(),
      ]);
      setExams(examRes.data || []);
      setFiltered(examRes.data || []);
      setClasses(classRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load exams: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    window.addEventListener("branch-changed", fetchData);
    return () => {
      window.removeEventListener("branch-changed", fetchData);
    };
  }, []);

  useEffect(() => {
    let result = exams;
    if (search)
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          e.subject?.toLowerCase().includes(search.toLowerCase()),
      );
    if (classFilter)
      result = result.filter((e) => e.class?._id === classFilter);
    if (typeFilter) result = result.filter((e) => e.examType === typeFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, classFilter, typeFilter, statusFilter, exams]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = {
    total: exams.length,
    scheduled: exams.filter((e) => e.status === "scheduled").length,
    ongoing: exams.filter((e) => e.status === "ongoing").length,
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
      {
        confirmText: "Delete",
        confirmClass:
          "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white",
      },
    );
  };

  const handleSave = (updated) => {
    setExams((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
  };

  const flatRows = () =>
    filtered.map((e) => ({
      "Exam Name": e.name,
      Class: e.class?.name || "—",
      Section: e.class?.section || "—",
      Subject: e.subject,
      Type: EXAM_TYPE_LABELS[e.examType] || e.examType,
      Date: e.examDate ? new Date(e.examDate).toLocaleDateString() : "—",
      "Total Marks": e.totalMarks,
      Status: e.status,
    }));

  const exportCSV = () => {
    const rows = flatRows();
    const headers = Object.keys(rows[0] || {});
    const csv = [headers, ...rows.map((r) => headers.map((h) => r[h]))]
      .map((r) => r.join(","))
      .join("\n");
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
      head: [
        ["Exam Name", "Class", "Subject", "Type", "Date", "Marks", "Status"],
      ],
      body: filtered.map((e) => [
        e.name,
        `${e.class?.name || "—"} ${e.class?.section || ""}`,
        e.subject,
        EXAM_TYPE_LABELS[e.examType] || e.examType,
        e.examDate ? new Date(e.examDate).toLocaleDateString() : "—",
        e.totalMarks,
        e.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("exams.pdf");
  };

  const classOptions = classes.map((c) => ({
    value: c._id,
    label: `${c.name} — ${c.section}`,
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <nav className="flex text-xs text-slate-400 mb-1 gap-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-indigo-600">Exam Management</span>
            </nav>
            <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage all school exams, schedules, and results
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition"
            >
              <FaFileCsv className="text-emerald-600" /> CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-xs font-medium transition"
            >
              <FaFileExcel className="text-green-600" /> Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-medium transition"
            >
              <FaFilePdf className="text-rose-600" /> PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Total Exams",
              value: stats.total,
              icon: <FaCalendarCheck />,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Scheduled",
              value: stats.scheduled,
              icon: <FaClock />,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Ongoing",
              value: stats.ongoing,
              icon: <FaCalendarCheck />,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: <FaCheckCircle />,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-md border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${c.bg} ${c.color} text-sm`}
              >
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-md border border-slate-100 shadow-sm px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
              <input
                type="text"
                placeholder="Search exam or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">All Classes</option>
              {classOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">All Types</option>
              {Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_MAP).map(([v, s]) => (
                <option key={v} value={v}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "Exam Name",
                    "Class",
                    "Subject",
                    "Type",
                    "Date",
                    "Marks",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((exam) => (
                    <tr
                      key={exam._id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition"
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {exam.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.class?.name}{" "}
                        {exam.class?.section ? `— ${exam.class.section}` : ""}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.subject}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          {EXAM_TYPE_LABELS[exam.examType] || exam.examType}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.examDate
                          ? new Date(exam.examDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.totalMarks}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewExam(exam)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="View Exam Notice"
                          >
                            <FaEye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditExam(exam)}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition"
                            title="Edit Exam"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition"
                            title="Delete Exam"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden p-4 space-y-3 bg-slate-50/50">
            {loading ? (
              <TableSkeleton />
            ) : paginatedData.length === 0 ? (
              <EmptyState />
            ) : (
              paginatedData.map((exam, idx) => {
                const colors = [
                  "bg-indigo-100 text-indigo-700",
                  "bg-purple-100 text-purple-700",
                  "bg-emerald-100 text-emerald-700",
                  "bg-amber-100 text-amber-700",
                ];
                const avatarColor = colors[idx % colors.length];
                return (
                  <div
                    key={exam._id}
                    className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex flex-col gap-3 transition duration-200 hover:shadow-md hover:border-indigo-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${avatarColor} font-bold text-xs flex items-center justify-center`}
                        >
                          {exam.name?.charAt(0) || "E"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {exam.name}
                          </p>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono border border-slate-200/40">
                            Class: {exam.class?.name || "—"}{" "}
                            {exam.class?.section
                              ? `— ${exam.class.section}`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={exam.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100/80 text-xs">
                      <div>
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase">
                          Subject
                        </p>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {exam.subject}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase">
                          Type
                        </p>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {EXAM_TYPE_LABELS[exam.examType] || exam.examType}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase">
                          Date
                        </p>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {exam.examDate
                            ? new Date(exam.examDate).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase">
                          Total Marks
                        </p>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {exam.totalMarks}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-50 pt-2.5">
                      <span>
                        Venue:{" "}
                        <strong className="text-slate-700">
                          {exam.venue || "—"}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewExam(exam)}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition"
                          title="View Exam Notice"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditExam(exam)}
                          className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition"
                          title="Edit"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam)}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition"
                          title="Delete"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {!loading && paginatedData.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Prev
                </button>
                <span className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-md">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {editExam && (
        <EditModal
          exam={editExam}
          classes={classes}
          onClose={() => setEditExam(null)}
          onSave={handleSave}
        />
      )}
      {viewExam && (
        <ExamNoticeModal
          exam={viewExam}
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          onClose={() => setViewExam(null)}
        />
      )}
    </div>
  );
}
