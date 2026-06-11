import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaSave,
  FaUndo,
  FaTimes,
  FaBook,
  FaLayerGroup,
  FaCheckCircle,
  FaFlask,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Data ----------
const generateSubjects = () => [
  {
    id: 1,
    code: "MATH-101",
    name: "Mathematics",
    class: "10th",
    type: "Theory",
    teacher: "Mr. Ahmed",
    weeklyLectures: 5,
    passingMarks: 40,
    totalMarks: 100,
    status: "Active",
    description: "Core mathematics including algebra, geometry, and calculus.",
  },
  {
    id: 2,
    code: "PHY-101",
    name: "Physics",
    class: "10th",
    type: "Practical",
    teacher: "Dr. Sana",
    weeklyLectures: 4,
    passingMarks: 33,
    totalMarks: 75,
    status: "Active",
    description: "Physics with lab experiments.",
  },
  {
    id: 3,
    code: "CHEM-101",
    name: "Chemistry",
    class: "10th",
    type: "Both",
    teacher: "Ms. Fatima",
    weeklyLectures: 5,
    passingMarks: 40,
    totalMarks: 100,
    status: "Active",
    description: "Theory and practical chemistry.",
  },
  {
    id: 4,
    code: "ENG-101",
    name: "English",
    class: "9th",
    type: "Theory",
    teacher: "Mr. Imran",
    weeklyLectures: 4,
    passingMarks: 40,
    totalMarks: 100,
    status: "Inactive",
    description: "English literature and grammar.",
  },
  {
    id: 5,
    code: "CS-101",
    name: "Computer Science",
    class: "11th",
    type: "Practical",
    teacher: "Ms. Ayesha",
    weeklyLectures: 3,
    passingMarks: 33,
    totalMarks: 75,
    status: "Active",
    description: "Programming and computer fundamentals.",
  },
];

const CLASSES = ["9th", "10th", "11th", "12th"];
const SUBJECT_TYPES = ["Theory", "Practical", "Both"];
const TEACHERS = [
  "Mr. Ahmed",
  "Dr. Sana",
  "Ms. Fatima",
  "Mr. Imran",
  "Ms. Ayesha",
];
const STATUS_OPTS = ["Active", "Inactive"];

// ---------- Badges ----------
const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
  >
    {status}
  </span>
);
const TypeBadge = ({ type }) => {
  const s = {
    Theory: "bg-blue-100 text-blue-700",
    Practical: "bg-purple-100 text-purple-700",
    Both: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s[type]}`}
    >
      {type}
    </span>
  );
};

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
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
      <svg
        className="w-10 h-10 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </div>
    <h3 className="mt-3 text-base font-medium text-slate-700">
      No subjects found
    </h3>
    <p className="text-sm text-slate-400">
      Try adjusting your search or filters
    </p>
  </div>
);

// ---------- View Modal ----------
const ViewModal = ({ subject, onClose, onEdit }) => {
  if (!subject) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaBook className="text-indigo-600 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Subject Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            ["Subject Code", subject.code],
            ["Subject Name", subject.name],
            ["Class", subject.class],
            ["Weekly Lectures", subject.weeklyLectures],
            ["Passing Marks", subject.passingMarks],
            ["Total Marks", subject.totalMarks],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-slate-800">{val}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Assigned Teacher</p>
            <p className="text-sm font-medium text-slate-800">
              {subject.teacher}
            </p>
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(subject);
            }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <FaEdit className="text-xs" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Edit Modal ----------
const EditModal = ({ subject, onClose, onSave }) => {
  const [form, setForm] = useState(subject ? { ...subject } : {});
  const [errors, setErrors] = useState({});

  if (!subject) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Required";
    if (!form.code?.trim()) e.code = "Required";
    if (!form.class) e.class = "Required";
    if (!form.teacher) e.teacher = "Required";
    if (!form.type) e.type = "Required";
    if (!form.weeklyLectures) e.weeklyLectures = "Required";
    if (!form.passingMarks) e.passingMarks = "Required";
    if (!form.totalMarks) e.totalMarks = "Required";
    if (
      form.passingMarks &&
      form.totalMarks &&
      parseInt(form.passingMarks) > parseInt(form.totalMarks)
    )
      e.passingMarks = "Cannot exceed total marks";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors[field] ? "border-rose-400" : "border-slate-200"}`;

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        className={inputCls(name)}
      />
      {errors[name] && (
        <p className="text-rose-500 text-xs mt-0.5">{errors[name]}</p>
      )}
    </div>
  );

  const Select = ({ label, name, options }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        className={inputCls(name)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-rose-500 text-xs mt-0.5">{errors[name]}</p>
      )}
    </div>
  );

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
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject Name *" name="name" />
            <Field label="Subject Code *" name="code" />
            <Select label="Class *" name="class" options={CLASSES} />
            <Select label="Teacher *" name="teacher" options={TEACHERS} />
            <Select
              label="Subject Type *"
              name="type"
              options={SUBJECT_TYPES}
            />
            <Field
              label="Weekly Lectures *"
              name="weeklyLectures"
              type="number"
            />
            <Field label="Passing Marks *" name="passingMarks" type="number" />
            <Field label="Total Marks *" name="totalMarks" type="number" />
            <Select label="Status" name="status" options={STATUS_OPTS} />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <FaTimes className="text-xs" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <FaSave className="text-xs" /> Save Changes
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
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewSubject, setViewSubject] = useState(null);
  const [editSubject, setEditSubject] = useState(null);
  const [toast, setToast] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => {
      const data = generateSubjects();
      setSubjects(data);
      setFiltered(data);
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    let result = subjects;
    if (search)
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.code.toLowerCase().includes(search.toLowerCase()),
      );
    if (classFilter) result = result.filter((s) => s.class === classFilter);
    if (typeFilter) result = result.filter((s) => s.type === typeFilter);
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, classFilter, typeFilter, statusFilter, subjects]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveEdit = (updated) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast("Subject updated successfully!");
  };

  const handleDelete = (subject) => {
    if (window.confirm(`Delete "${subject.name}"?`)) {
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      showToast("Subject deleted.");
    }
  };

  // Stats
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.status === "Active").length;
  const practicalSubjects = subjects.filter(
    (s) => s.type === "Practical" || s.type === "Both",
  ).length;
  const theorySubjects = subjects.filter(
    (s) => s.type === "Theory" || s.type === "Both",
  ).length;

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Exports
  const exportCSV = () => {
    const headers = [
      "Code",
      "Subject Name",
      "Class",
      "Type",
      "Teacher",
      "Lectures",
      "Status",
    ];
    const rows = filtered.map((s) => [
      s.code,
      s.name,
      s.class,
      s.type,
      s.teacher,
      s.weeklyLectures,
      s.status,
    ]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
        type: "text/csv",
      }),
      "subjects.csv",
    );
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((s) => ({
        Code: s.code,
        Subject: s.name,
        Class: s.class,
        Type: s.type,
        Teacher: s.teacher,
        Lectures: s.weeklyLectures,
        Status: s.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Subjects List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        ["Code", "Subject", "Class", "Type", "Teacher", "Lectures", "Status"],
      ],
      body: filtered.map((s) => [
        s.code,
        s.name,
        s.class,
        s.type,
        s.teacher,
        s.weeklyLectures,
        s.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("subjects.pdf");
  };

  const uniqueClasses = [...new Set(subjects.map((s) => s.class))];
  const inputCls =
    "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  const statCards = [
    {
      label: "Total Subjects",
      value: totalSubjects,
      icon: <FaLayerGroup className="text-indigo-600" />,
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Active Subjects",
      value: activeSubjects,
      icon: <FaCheckCircle className="text-emerald-600" />,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Practical",
      value: practicalSubjects,
      icon: <FaFlask className="text-purple-600" />,
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      label: "Theory",
      value: theorySubjects,
      icon: <FaBook className="text-blue-600" />,
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Subjects</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage all school subjects, types, and assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FaFileCsv className="text-emerald-600" /> CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <FaFileExcel className="text-green-600" /> Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <FaFilePdf className="text-rose-500" /> PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${c.text}`}>
                  {c.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-lg`}
              >
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search name or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
              />
            </div>
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Types</option>
              {SUBJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Status</option>
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Code",
                    "Subject Name",
                    "Class",
                    "Type",
                    "Teacher",
                    "Lectures",
                    "Status",
                    "Actions",
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
                    <td colSpan="8" className="p-0">
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
                  paginatedData.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                        {s.code}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{s.class}</td>
                      <td className="py-2.5 px-4">
                        <TypeBadge type={s.type} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                        {s.teacher}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-600">
                        {s.weeklyLectures}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewSubject(s)}
                            title="View"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => setEditSubject(s)}
                            title="Edit"
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            title="Delete"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
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
                  Prev
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

      {/* Modals */}
      <ViewModal
        subject={viewSubject}
        onClose={() => setViewSubject(null)}
        onEdit={(s) => setEditSubject(s)}
      />
      <EditModal
        subject={editSubject}
        onClose={() => setEditSubject(null)}
        onSave={handleSaveEdit}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaSave className="text-xs" /> {toast}
        </div>
      )}
    </div>
  );
}
