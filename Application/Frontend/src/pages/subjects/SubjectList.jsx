import { useState, useEffect, useRef } from "react";
import {
  FaSearch, FaEye, FaEdit, FaTrash,
  FaFileCsv, FaFileExcel, FaFilePdf,
  FaSave, FaTimes, FaBook, FaLayerGroup, FaCheckCircle, FaFlask,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllSubjects, updateSubject, deleteSubject, addSubject } from "../../api/Subject_Api.js";
import { getAllClasses } from "../../Api/Class_Api.js";
import { getAllTeachers } from "../../Api/Teacher_Api.js";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const SUBJECT_TYPES = ["theory", "practical", "both"];
const STATUS_OPTS = ["active", "inactive"];

// ---------- Badges ----------
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
    {status}
  </span>
);
const TypeBadge = ({ type }) => {
  const s = {
    theory: "bg-blue-100 text-blue-700",
    practical: "bg-purple-100 text-purple-700",
    both: "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s[type] || "bg-slate-100 text-slate-600"}`}>{type}</span>;
};

// ---------- Skeleton ----------
const TableSkeleton = () => (
  <div className="animate-pulse px-4 py-3">
    <div className="h-8 bg-slate-200 rounded mb-2" />
    {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 mb-1 rounded" />)}
  </div>
);

// ---------- Empty State ----------
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="mt-3 text-base font-medium text-slate-700">No subjects found</h3>
    <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
  </div>
);

// ---------- View Modal ----------
const ViewModal = ({ subject, onClose, onEdit }) => {
  if (!subject) return null;

  // Populated class array
  const classNames = Array.isArray(subject.class)
    ? subject.class.map((c) => c.name || c).join(", ")
    : subject.class?.name || "—";
  const teacherName = subject.teacher?.name || "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaBook className="text-indigo-600 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Subject Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">✕</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            ["Subject Code", subject.code],
            ["Subject Name", subject.name],
            ["Class(es)", classNames],
            ["Credit Hours", subject.creditHours],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-slate-800">{val || "—"}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Assigned Teacher</p>
            <p className="text-sm font-medium text-slate-800">{teacherName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Status</p>
            <StatusBadge status={subject.status} />
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Subject Type</p>
            <TypeBadge type={subject.type} />
          </div>
          {subject.description && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400 mb-0.5">Description</p>
              <p className="text-sm text-slate-600">{subject.description}</p>
            </div>
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
          <button onClick={() => { onClose(); onEdit(subject); }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
            <FaEdit className="text-xs" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Edit Modal ----------
const EditModal = ({ subject, onClose, onSave, classes, teachers }) => {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (subject) {
      setForm({
        name: subject.name || "",
        code: subject.code || "",
        class: Array.isArray(subject.class)
          ? subject.class.map((c) => c._id || c)
          : subject.class ? [subject.class._id || subject.class] : [],
        teacher: subject.teacher?._id || subject.teacher || "",
        type: subject.type || "theory",
        creditHours: subject.creditHours || "",
        description: subject.description || "",
        status: subject.status || "active",
      });
    }
  }, [subject]);

  if (!subject || !form) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClassChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((prev) => ({ ...prev, class: selected }));
    if (errors.class) setErrors((prev) => ({ ...prev, class: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Required";
    if (!form.code?.trim()) e.code = "Required";
    if (!form.class || form.class.length === 0) e.class = "Required";
    if (!form.teacher) e.teacher = "Required";
    if (!form.type) e.type = "Required";
    if (!form.creditHours) e.creditHours = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      const res = await updateSubject(subject._id, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        class: form.class,
        teacher: form.teacher || undefined,
        type: form.type,
        creditHours: Number(form.creditHours),
        description: form.description.trim() || undefined,
        status: form.status,
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setApiError(err.message || "Update karne mein error aayi.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors[field] ? "border-rose-400" : "border-slate-200"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <FaEdit className="text-amber-600 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Edit Subject</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {apiError && <p className="text-rose-500 text-xs bg-rose-50 rounded-lg px-3 py-2 mb-4">{apiError}</p>}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls("name")} />
              {errors.name && <p className="text-rose-500 text-xs mt-0.5">{errors.name}</p>}
            </div>
            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Code *</label>
              <input name="code" value={form.code} onChange={handleChange} className={inputCls("code")} />
              {errors.code && <p className="text-rose-500 text-xs mt-0.5">{errors.code}</p>}
            </div>
            {/* Classes */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Class(es) * <span className="text-slate-400 font-normal">(Ctrl+click for multiple)</span>
              </label>
              <select multiple value={form.class} onChange={handleClassChange} className={`${inputCls("class")} h-24`}>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ""}</option>
                ))}
              </select>
              {errors.class && <p className="text-rose-500 text-xs mt-0.5">{errors.class}</p>}
            </div>
            {/* Teacher */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Teacher *</label>
              <select name="teacher" value={form.teacher} onChange={handleChange} className={inputCls("teacher")}>
                <option value="">Select…</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              {errors.teacher && <p className="text-rose-500 text-xs mt-0.5">{errors.teacher}</p>}
            </div>
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls("type")}>
                {SUBJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-rose-500 text-xs mt-0.5">{errors.type}</p>}
            </div>
            {/* Credit Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credit Hours *</label>
              <input type="number" name="creditHours" value={form.creditHours} onChange={handleChange} className={inputCls("creditHours")} />
              {errors.creditHours && <p className="text-rose-500 text-xs mt-0.5">{errors.creditHours}</p>}
            </div>
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls("status")}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <FaTimes className="text-xs" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-60">
            <FaSave className="text-xs" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewSubject, setViewSubject] = useState(null);
  const [editSubject, setEditSubject] = useState(null);

  // Dropdown data for edit modal
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const itemsPerPage = 10;

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllSubjects();
      setSubjects(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      toast.error("Subjects load karne mein error: " + err.message);
      setError("Subjects load karne mein error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [classRes, teacherRes] = await Promise.all([
        getAllClasses(),
        getAllTeachers(),
      ]);
      setClasses(classRes.data || []);
      setTeachers(teacherRes.data || []);
    } catch {
      // silently fail — edit modal mein error dikhega
    }
  };

  useEffect(() => {
    fetchSubjects();
    loadDropdowns();

    const handleUpdate = () => {
      fetchSubjects();
      loadDropdowns();
    };

    window.addEventListener("branch-changed", handleUpdate);
    return () => {
      window.removeEventListener("branch-changed", handleUpdate);
    };
  }, []);

  // Frontend filters
  useEffect(() => {
    let result = subjects;
    if (search)
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code?.toLowerCase().includes(search.toLowerCase())
      );
    if (classFilter)
      result = result.filter((s) =>
        Array.isArray(s.class)
          ? s.class.some((c) => (c._id || c) === classFilter)
          : (s.class?._id || s.class) === classFilter
      );
    if (typeFilter) result = result.filter((s) => s.type === typeFilter);
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, classFilter, typeFilter, statusFilter, subjects]);

  const handleSaveEdit = (updated) => {
    setSubjects((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    toast.success("Subject updated successfully!");
  };

  const handleDelete = (subject) => {
    confirmToast(
      `Delete "${subject.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteSubject(subject._id);
          setSubjects((prev) => prev.filter((s) => s._id !== subject._id));
          toast.success("Subject deleted.");
        } catch (err) {
          toast.error(err.message || "Failed to delete subject");
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  // Stats
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.status === "active").length;
  const practicalSubjects = subjects.filter((s) => s.type === "practical" || s.type === "both").length;
  const theorySubjects = subjects.filter((s) => s.type === "theory" || s.type === "both").length;

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Exports
  const exportCSV = () => {
    const headers = ["Code", "Subject Name", "Class", "Type", "Teacher", "Credit Hours", "Status"];
    const rows = filtered.map((s) => [
      s.code,
      s.name,
      Array.isArray(s.class) ? s.class.map((c) => c.name || c).join("; ") : s.class?.name || "—",
      s.type,
      s.teacher?.name || "—",
      s.creditHours,
      s.status,
    ]);
    saveAs(new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }), "subjects.csv");
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
    const headers = ["code", "name", "className", "type", "teacherName", "creditHours", "status"];
    const rows = subjects.map((s) => [
      s.code || "",
      s.name || "",
      Array.isArray(s.class) ? s.class.map((c) => c.name || c).join("; ") : s.class?.name || "",
      s.type || "theory",
      s.teacher?.name || "",
      s.creditHours || 0,
      s.status || "active"
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "subjects_backup.csv");
    toast.success("Subjects backup downloaded successfully!");
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
        const [classesRes, teachersRes] = await Promise.all([
          getAllClasses(),
          getAllTeachers()
        ]);
        const classesList = classesRes.data || [];
        const teachersList = teachersRes.data || [];
        let successCount = 0;
        let failCount = 0;
        const loadingToastId = toast.loading("Uploading subjects...");
        for (const row of parsed) {
          try {
            const matchedClass = classesList.find(c => c.name.toLowerCase() === (row.className || "").toLowerCase());
            const matchedTeacher = teachersList.find(t => {
              const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim().toLowerCase();
              return fullName === (row.teacherName || "").toLowerCase();
            });
            const payload = {
              code: row.code || "",
              name: row.name || "",
              type: (row.type || "theory").toLowerCase(),
              creditHours: Number(row.creditHours) || 3,
              status: (row.status || "active").toLowerCase(),
            };
            if (matchedClass) {
              payload.class = matchedClass._id;
            }
            if (matchedTeacher) {
              payload.teacher = matchedTeacher._id;
            }
            await addSubject(payload);
            successCount++;
          } catch (err) {
            console.error("Failed to create subject from CSV row:", row, err);
            toast.error(`Row "${row.name}": ${err.message}`);
            failCount++;
          }
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) {
          toast.success(`${successCount} subjects uploaded successfully!`);
          fetchSubjects();
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
    const ws = XLSX.utils.json_to_sheet(filtered.map((s) => ({
      Code: s.code,
      Subject: s.name,
      Class: Array.isArray(s.class) ? s.class.map((c) => c.name || c).join("; ") : s.class?.name || "—",
      Type: s.type,
      Teacher: s.teacher?.name || "—",
      "Credit Hours": s.creditHours,
      Status: s.status,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Subjects List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Code", "Subject", "Class", "Type", "Teacher", "Status"]],
      body: filtered.map((s) => [
        s.code,
        s.name,
        Array.isArray(s.class) ? s.class.map((c) => c.name || c).join("; ") : s.class?.name || "—",
        s.type,
        s.teacher?.name || "—",
        s.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("subjects.pdf");
  };

  const inputCls = "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  const statCards = [
    { label: "Total Subjects", value: totalSubjects, icon: <FaLayerGroup className="text-indigo-600" />, bg: "bg-indigo-50", text: "text-indigo-700" },
    { label: "Active Subjects", value: activeSubjects, icon: <FaCheckCircle className="text-emerald-600" />, bg: "bg-emerald-50", text: "text-emerald-700" },
    { label: "Practical", value: practicalSubjects, icon: <FaFlask className="text-purple-600" />, bg: "bg-purple-50", text: "text-purple-700" },
    { label: "Theory", value: theorySubjects, icon: <FaBook className="text-blue-600" />, bg: "bg-blue-50", text: "text-blue-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Subjects</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage all school subjects, types, and assignments</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
            <button type="button" onClick={() => csvFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
            <button type="button" onClick={handleBackupData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup Data</button>
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              <FaFileExcel className="text-green-600" /> Excel
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors">
              <FaFilePdf className="text-rose-500" /> PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${c.text}`}>{c.value}</p>
              </div>
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-lg`}>{c.icon}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input type="text" placeholder="Search name or code…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} pl-7 pr-2.5`} />
            </div>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={`${inputCls} px-2.5`}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ""}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`${inputCls} px-2.5`}>
              <option value="">All Types</option>
              {SUBJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} px-2.5`}>
              <option value="">All Status</option>
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Code", "Subject Name", "Class", "Type", "Teacher", "Credit Hours", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="p-0"><TableSkeleton /></td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="8"><EmptyState /></td></tr>
                ) : (
                  paginatedData.map((s) => {
                    const classNames = Array.isArray(s.class)
                      ? s.class.map((c) => c.name || "—").join(", ")
                      : s.class?.name || "—";
                    return (
                      <tr key={s._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-xs text-slate-500">{s.code || "—"}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-4 text-slate-600 text-xs">{classNames}</td>
                        <td className="py-2.5 px-4"><TypeBadge type={s.type} /></td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{s.teacher?.name || "—"}</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{s.creditHours}</td>
                        <td className="py-2.5 px-4"><StatusBadge status={s.status} /></td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewSubject(s)} title="View" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FaEye className="text-sm" /></button>
                            <button onClick={() => setEditSubject(s)} title="Edit" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><FaEdit className="text-sm" /></button>
                            <button onClick={() => handleDelete(s)} title="Delete" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash className="text-sm" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && paginatedData.length > 0 && (
            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-slate-100 gap-2">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-1.5">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
                <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-lg">{currentPage}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewModal subject={viewSubject} onClose={() => setViewSubject(null)} onEdit={(s) => setEditSubject(s)} />
      <EditModal subject={editSubject} onClose={() => setEditSubject(null)} onSave={handleSaveEdit} classes={classes} teachers={teachers} />

    </div>
  );
}