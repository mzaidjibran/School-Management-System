import { useState, useEffect, useRef } from "react";
import {
  FaSearch, FaEye, FaEdit, FaTrash,
  FaFileExcel, FaFilePdf,
  FaSave, FaTimes, FaBook, FaLayerGroup, FaCheckCircle, FaFlask, FaPlus,
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

const SUBJECT_TYPES = ["theory", "practical", "both"];
const STATUS_OPTS = ["active", "inactive"];

// ─── Badges ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
    {status}
  </span>
);
const TypeBadge = ({ type }) => {
  const s = { theory: "bg-blue-100 text-blue-700", practical: "bg-purple-100 text-purple-700", both: "bg-amber-100 text-amber-700" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s[type] || "bg-slate-100 text-slate-600"}`}>{type}</span>;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse px-4 py-3 space-y-2">
    <div className="h-8 bg-slate-200 rounded" />
    {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
  </div>
);

// ─── Input class helper ───────────────────────────────────────────────────────
const inputCls = (field, errors = {}) =>
  `w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors[field] ? "border-rose-400" : "border-slate-200"}`;

// ─── Class Multi-Select Dropdown ──────────────────────────────────────────────
const ClassMultiDropdown = ({ classes, selected, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next);
  };

  const label = selected.length === 0
    ? "Select class(es)…"
    : classes.filter((c) => selected.includes(c._id)).map((c) => c.name + (c.section ? ` - ${c.section}` : "")).join(", ");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-left ${error ? "border-rose-400" : "border-slate-200"}`}
      >
        <span className={`truncate ${selected.length === 0 ? "text-slate-400" : "text-slate-800"}`}>{label}</span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {classes.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">No classes found</p>
          ) : (
            classes.map((c) => {
              const checked = selected.includes(c._id);
              return (
                <label key={c._id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(c._id)}
                    className="w-3.5 h-3.5 accent-indigo-600 rounded"
                  />
                  <span className="text-sm text-slate-700">{c.name}{c.section ? ` - ${c.section}` : ""}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ subject, onClose, onEdit }) => {
  if (!subject) return null;

  // class can be: array of populated {_id, name, section} objects OR array of ObjectId strings
  const classNames = Array.isArray(subject.class) && subject.class.length > 0
    ? subject.class.map((c) => typeof c === "object" ? (c.name + (c.section ? ` - ${c.section}` : "")) : "—").join(", ")
    : subject.class?.name
      ? subject.class.name + (subject.class.section ? ` - ${subject.class.section}` : "")
      : "—";

  // teacher is populated as {_id, name} — Teacher model uses 'name' field directly
  const teacherName = subject.teacher
    ? (subject.teacher.name || `${subject.teacher.firstName || ""} ${subject.teacher.lastName || ""}`.trim() || "—")
    : "—";

  const rows = [
    ["Subject Code", <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">{subject.code || "—"}</code>],
    ["Subject Name", subject.name],
    ["Class(es)", classNames],
    ["Assigned Teacher", teacherName],
    ["Credit Hours", subject.creditHours ?? "—"],
    ["Type", <TypeBadge type={subject.type} />],
    ["Status", <StatusBadge status={subject.status} />],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
              <FaBook className="text-indigo-600 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Subject Details</h3>
              <p className="text-[10px] text-slate-400">Full record from database</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <div className="space-y-0 divide-y divide-slate-50">
            {rows.map(([label, val]) => (
              <div key={label} className="flex justify-between items-start py-2.5">
                <span className="text-xs text-slate-400 shrink-0 w-36">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right">{val || "—"}</span>
              </div>
            ))}
            {subject.description && (
              <div className="py-2.5">
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{subject.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors">Close</button>
          <button onClick={() => { onClose(); onEdit(subject); }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
            <FaEdit className="text-xs" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add / Edit Modal (shared) ────────────────────────────────────────────────
const SubjectFormModal = ({ mode = "add", subject, onClose, onSave, classes, teachers }) => {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    name: "", code: "", class: [], teacher: "",
    type: "theory", creditHours: "", description: "", status: "active",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isEdit && subject) {
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
  }, [subject, isEdit]);

  if (isEdit && !subject) return null;

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
    if (!form.class || form.class.length === 0) e.class = "At least one class required";
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
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        class: form.class,
        teacher: form.teacher || undefined,
        type: form.type,
        creditHours: Number(form.creditHours),
        description: form.description?.trim() || undefined,
        status: form.status,
      };
      let res;
      if (isEdit) {
        res = await updateSubject(subject._id, payload);
        toast.success("Subject updated successfully!");
      } else {
        res = await addSubject(payload);
        toast.success("Subject added successfully!");
      }
      onSave(res.data);
      onClose();
    } catch (err) {
      setApiError(err.message || "Error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${isEdit ? "bg-amber-100" : "bg-indigo-100"} rounded-md flex items-center justify-center`}>
              {isEdit ? <FaEdit className="text-amber-600 text-sm" /> : <FaPlus className="text-indigo-600 text-sm" />}
            </div>
            <h3 className="text-sm font-bold text-slate-800">{isEdit ? "Edit Subject" : "Add New Subject"}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="p-5 overflow-y-auto">
          {apiError && <p className="text-rose-500 text-xs bg-rose-50 rounded-md px-3 py-2 mb-4">{apiError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls("name", errors)} placeholder="e.g. Mathematics" />
              {errors.name && <p className="text-rose-500 text-xs mt-0.5">{errors.name}</p>}
            </div>
            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Code *</label>
              <input name="code" value={form.code} onChange={handleChange} className={inputCls("code", errors)} placeholder="e.g. MATH101" />
              {errors.code && <p className="text-rose-500 text-xs mt-0.5">{errors.code}</p>}
            </div>
            {/* Classes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Class(es) * <span className="text-slate-400 font-normal">(select one or more)</span>
              </label>
              <ClassMultiDropdown
                classes={classes}
                selected={form.class}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, class: val }));
                  if (errors.class) setErrors((prev) => ({ ...prev, class: "" }));
                }}
                error={!!errors.class}
              />
              {errors.class && <p className="text-rose-500 text-xs mt-0.5">{errors.class}</p>}
            </div>
            {/* Teacher */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned Teacher *</label>
              {teachers.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">No teachers found in database.</p>
              ) : (
                <select name="teacher" value={form.teacher} onChange={handleChange} className={inputCls("teacher", errors)}>
                  <option value="">Select teacher…</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim()}
                    </option>
                  ))}
                </select>
              )}
              {errors.teacher && <p className="text-rose-500 text-xs mt-0.5">{errors.teacher}</p>}
            </div>
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls("type", errors)}>
                {SUBJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-rose-500 text-xs mt-0.5">{errors.type}</p>}
            </div>
            {/* Credit Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credit Hours *</label>
              <input type="number" name="creditHours" value={form.creditHours} onChange={handleChange} className={inputCls("creditHours", errors)} placeholder="e.g. 3" min="1" />
              {errors.creditHours && <p className="text-rose-500 text-xs mt-0.5">{errors.creditHours}</p>}
            </div>
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls("status", errors)}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Brief description of this subject…" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <FaTimes className="text-xs" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-60">
            <FaSave className="text-xs" /> {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Subject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [showAddModal, setShowAddModal] = useState(false);

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const csvFileInputRef = useRef(null);
  const itemsPerPage = 10;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllSubjects();
      setSubjects(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      setError("Subjects load karne mein error: " + err.message);
      toast.error("Subjects load karne mein error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [classRes, teacherRes] = await Promise.all([
        getAllClasses(),
        getAllTeachers(),   // uses getHeaders() — includes auth token + x-section + x-branch-id
      ]);
      setClasses(classRes.data || []);
      setTeachers(teacherRes.data || []);
    } catch (err) {
      console.error("Dropdown load error:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    loadDropdowns();
    const handleUpdate = () => { fetchSubjects(); loadDropdowns(); };
    window.addEventListener("branch-changed", handleUpdate);
    return () => window.removeEventListener("branch-changed", handleUpdate);
  }, []);

  // ── Filters ────────────────────────────────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveAdd = (newSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const handleSaveEdit = (updated) => {
    setSubjects((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
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

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.status === "active").length;
  const practicalSubjects = subjects.filter((s) => s.type === "practical" || s.type === "both").length;
  const theorySubjects = subjects.filter((s) => s.type === "theory" || s.type === "both").length;

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((s) => ({
      Code: s.code,
      Subject: s.name,
      Class: Array.isArray(s.class) ? s.class.map((c) => c.name || c).join("; ") : s.class?.name || "—",
      Type: s.type,
      Teacher: s.teacher?.name || `${s.teacher?.firstName || ""} ${s.teacher?.lastName || ""}`.trim() || "—",
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
        s.teacher?.name || `${s.teacher?.firstName || ""} ${s.teacher?.lastName || ""}`.trim() || "—",
        s.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("subjects.pdf");
  };

  const handleBackupData = () => {
    const headers = ["code", "name", "className", "type", "teacherName", "creditHours", "status"];
    const rows = subjects.map((s) => [
      s.code || "",
      s.name || "",
      Array.isArray(s.class) 
        ? s.class.map((c) => (typeof c === "object" ? c?.name : c) || "").filter(Boolean).join("; ") 
        : (typeof s.class === "object" ? s.class?.name : s.class) || "",
      s.type || "theory",
      s.teacher?.name || `${s.teacher?.firstName || ""} ${s.teacher?.lastName || ""}`.trim() || "",
      s.creditHours || 0,
      s.status || "active",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "subjects_backup.csv");
    toast.success("Backup downloaded successfully!");
  };

  const parseCSV = (text) => {
    const lines = []; let row = [""]; let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i], nextChar = text[i + 1];
      if (char === '"') { if (inQuotes && nextChar === '"') { row[row.length - 1] += '"'; i++; } else { inQuotes = !inQuotes; } }
      else if (char === ',' && !inQuotes) { row.push(''); }
      else if ((char === '\r' || char === '\n') && !inQuotes) { if (char === '\r' && nextChar === '\n') i++; lines.push(row); row = ['']; }
      else { row[row.length - 1] += char; }
    }
    if (row.length > 1 || row[0] !== '') lines.push(row);
    const headers = lines[0].map(h => h.trim());
    return lines.slice(1).filter(r => r.length > 1 || r[0]).map(r => {
      const obj = {}; headers.forEach((h, i) => { obj[h] = (r[i] ?? "").trim(); }); return obj;
    });
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = parseCSV(evt.target.result);
        if (parsed.length === 0) { toast.error("CSV is empty"); return; }
        const [classesRes, teachersRes] = await Promise.all([
          getAllClasses({ section: "all" }),
          getAllTeachers()
        ]);
        const classesList = classesRes.data || [];
        const teachersList = teachersRes.data || [];
        let successCount = 0, failCount = 0;
        const tid = toast.loading("Uploading subjects…");
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

            const code = getVal(row, "code");
            const name = getVal(row, "name", "subject name", "subjectName");
            const classNameVal = getVal(row, "className", "class name", "class");
            const type = getVal(row, "type");
            const teacherNameVal = getVal(row, "teacherName", "teacher name", "teacher");
            const creditHours = getVal(row, "creditHours", "credit hours");
            const status = getVal(row, "status");

            if (!name) {
              console.warn("Skipping row: subject name is required.");
              failCount++;
              continue;
            }

            // Split by semicolon or comma to support multiple classes
            const classNames = classNameVal ? classNameVal.split(/[;,]/).map(c => c.trim()).filter(Boolean) : [];
            const matchedClassIds = [];
            for (const cn of classNames) {
              const found = classesList.find(c => c.name.toLowerCase() === cn.toLowerCase());
              if (found) {
                matchedClassIds.push(found._id);
              } else {
                console.warn(`Class named "${cn}" not found.`);
              }
            }

            const matchedTeacher = teachersList.find(t => {
              const full = `${t.firstName || ""} ${t.lastName || ""}`.trim().toLowerCase();
              return full === teacherNameVal.toLowerCase() || (t.name || "").toLowerCase() === teacherNameVal.toLowerCase();
            });

            const payload = {
              code: code || "",
              name: name || "",
              type: (type || "theory").toLowerCase(),
              creditHours: Number(creditHours) || 3,
              status: (status || "active").toLowerCase(),
            };
            if (matchedClassIds.length > 0) payload.class = matchedClassIds;
            if (matchedTeacher) payload.teacher = matchedTeacher._id;

            await addSubject(payload);
            successCount++;
          } catch (err) {
            const subjectName = getVal(row, "name", "subject name", "subjectName") || "Unknown";
            toast.error(`"${subjectName}": ${err.message}`);
            failCount++;
          }
        }
        toast.dismiss(tid);
        if (successCount > 0) { toast.success(`${successCount} subjects uploaded successfully!`); fetchSubjects(); }
        if (failCount > 0) toast.error(`${failCount} rows failed. Check console.`);
      } catch (err) {
        toast.error("CSV parse error: " + err.message);
      } finally {
        if (csvFileInputRef.current) csvFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filterInputCls = "h-9 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 px-2.5 w-full";

  const statCards = [
    { label: "Total Subjects", value: totalSubjects, icon: <FaLayerGroup />, bg: "bg-indigo-50", text: "text-indigo-700", icon_c: "text-indigo-600" },
    { label: "Active", value: activeSubjects, icon: <FaCheckCircle />, bg: "bg-emerald-50", text: "text-emerald-700", icon_c: "text-emerald-600" },
    { label: "Practical", value: practicalSubjects, icon: <FaFlask />, bg: "bg-purple-50", text: "text-purple-700", icon_c: "text-purple-600" },
    { label: "Theory", value: theorySubjects, icon: <FaBook />, bg: "bg-blue-50", text: "text-blue-700", icon_c: "text-blue-600" },
  ];

  return (
    <div className="space-y-3">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Dashboard / Subjects</p>
          <h1 className="text-xl font-bold text-slate-800">Subjects</h1>
          <p className="text-sm text-slate-500">Manage all school subjects, types and assignments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
          <button type="button" onClick={() => csvFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
          <button type="button" onClick={handleBackupData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup</button>
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition">
            <FaFileExcel className="text-green-600" /> Excel
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition">
            <FaFilePdf className="text-rose-500" /> PDF
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm transition">
            <FaPlus className="text-xs" /> Add Subject
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-md p-4 shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${c.text}`}>{c.value}</p>
            </div>
            <div className={`w-10 h-10 ${c.bg} rounded-md flex items-center justify-center text-lg ${c.icon_c}`}>{c.icon}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="relative col-span-2 sm:col-span-1">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input type="text" placeholder="Search name or code…" value={search} onChange={(e) => setSearch(e.target.value)}
              className={`${filterInputCls} pl-7`} />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={filterInputCls}>
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ""}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterInputCls}>
            <option value="">All Types</option>
            {SUBJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterInputCls}>
            <option value="">All Status</option>
            {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-md px-4 py-3">{error}</p>}

      {/* ── Table (desktop) + Cards (mobile) ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Subject Records</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-0.5 rounded-full">{filtered.length} subjects</span>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <FaBook className="text-slate-400 text-2xl" />
            </div>
            <p className="text-sm font-medium text-slate-600">No subjects found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Code", "Subject Name", "Class", "Type", "Teacher", "Cr. Hrs", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((s) => {
                    const classNames = Array.isArray(s.class)
                      ? s.class.map((c) => c.name || "—").join(", ")
                      : s.class?.name || "—";
                    const teacherName = s.teacher?.name || `${s.teacher?.firstName || ""} ${s.teacher?.lastName || ""}`.trim() || "—";
                    return (
                      <tr key={s._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <code className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs font-mono">{s.code || "—"}</code>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs max-w-[160px] truncate" title={classNames}>{classNames}</td>
                        <td className="py-3 px-4"><TypeBadge type={s.type} /></td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-xs">{teacherName}</td>
                        <td className="py-3 px-4 text-center text-slate-600 font-medium">{s.creditHours}</td>
                        <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewSubject(s)} title="View" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><FaEye className="text-sm" /></button>
                            <button onClick={() => setEditSubject(s)} title="Edit" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"><FaEdit className="text-sm" /></button>
                            <button onClick={() => handleDelete(s)} title="Delete" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><FaTrash className="text-sm" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden p-4 space-y-3">
              {paginatedData.map((s, idx) => {
                const classNames = Array.isArray(s.class)
                  ? s.class.map((c) => c.name || "—").join(", ")
                  : s.class?.name || "—";
                const teacherName = s.teacher?.name || `${s.teacher?.firstName || ""} ${s.teacher?.lastName || ""}`.trim() || "—";
                const colors = ["bg-indigo-100 text-indigo-700", "bg-purple-100 text-purple-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];
                return (
                  <div key={s._id} className="bg-white border border-slate-100 rounded-md shadow-sm p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm ${colors[idx % colors.length]}`}>
                          {s.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{s.name}</p>
                          <code className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{s.code || "—"}</code>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-md p-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Class</p>
                        <p className="text-slate-700 font-medium truncate">{classNames}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Teacher</p>
                        <p className="text-slate-700 font-medium truncate">{teacherName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Type</p>
                        <TypeBadge type={s.type} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Credit Hrs</p>
                        <p className="text-slate-700 font-bold">{s.creditHours}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-50">
                      <button onClick={() => setViewSubject(s)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"><FaEye /> View</button>
                      <button onClick={() => setEditSubject(s)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition"><FaEdit /> Edit</button>
                      <button onClick={() => handleDelete(s)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition"><FaTrash /> Del</button>
                    </div>
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
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
              <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-md">{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ViewModal subject={viewSubject} onClose={() => setViewSubject(null)} onEdit={(s) => setEditSubject(s)} />

      {showAddModal && (
        <SubjectFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveAdd}
          classes={classes}
          teachers={teachers}
        />
      )}

      {editSubject && (
        <SubjectFormModal
          mode="edit"
          subject={editSubject}
          onClose={() => setEditSubject(null)}
          onSave={handleSaveEdit}
          classes={classes}
          teachers={teachers}
        />
      )}
    </div>
  );
}