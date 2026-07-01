import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllClasses, updateClass, deleteClass } from "../../api/Class_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import { getAllTeachers } from "../../api/Teacher_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";

// ---------- Floating Input ----------
const FloatingInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  error,
  disabled,
}) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder=" "
      className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white text-slate-800 outline-none transition-all text-sm
        ${error ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}
        focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed`}
    />
    <label
      className={`absolute left-4 pointer-events-none transition-all duration-200 text-slate-400
      ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm"}
      peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
    >
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

// ---------- Floating Select (disabled = plain text) ----------
// options ab dono support karta hai: array of strings, ya array of
// {value, label} objects (Class Teacher dropdown). displayValue use
// hota hai sirf jab disabled=true ho aur value ko name mein resolve
// karna ho (jaise Teacher ID ki jagah Teacher ka naam dikhana).
const FloatingSelect = ({
  label,
  name,
  options = [],
  value,
  onChange,
  required,
  error,
  disabled,
  displayValue,
}) => {
  if (disabled) {
    return (
      <div className="relative">
        <div className="w-full px-4 pt-5 pb-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-700 min-h-[52px]">
          {displayValue !== undefined ? displayValue || "—" : value || "—"}
        </div>
        <label className="absolute left-4 top-1.5 text-[10px] text-indigo-600 pointer-events-none">
          {label}
        </label>
      </div>
    );
  }
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white text-slate-800 outline-none transition-all appearance-none text-sm
          ${error ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}
          focus:ring-2`}
      >
        <option value=""></option>
        {options.map((o) => {
          const optValue = typeof o === "object" ? o.value : o;
          const optLabel = typeof o === "object" ? o.label : o;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 text-slate-400
        ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm"}
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <svg
        className="absolute right-3 top-4 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ---------- Skeleton ----------
const TableSkeleton = () => (
  <div className="animate-pulse p-4 space-y-2">
    <div className="h-10 bg-slate-200 rounded-lg"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
    ))}
  </div>
);

// ---------- Empty State ----------
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
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
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-slate-700">No classes found</h3>
    <p className="text-slate-400 text-sm">
      Try adjusting your search or filter
    </p>
  </div>
);

// ---------- Status Badge ----------
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ${status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`}
    />
    {status}
  </span>
);

// ---------- Teacher Avatar ----------
const TeacherAvatar = ({ teacher }) => {
  if (!teacher) {
    return <span className="text-xs text-slate-400 italic">Not Assigned</span>;
  }
  const name = teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "—";
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
        {name.charAt(0)}
      </div>
      <span className="text-sm font-medium text-slate-700">{name}</span>
    </div>
  );
};

// ---------- View/Edit Modal ----------
const ClassModal = ({ isOpen, onClose, cls, mode, onSave, teachers }) => {
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    academicYear: "",
    classTeacher: "",
    roomNumber: "",
    capacity: "",
    shift: "Morning",
    status: "Active",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const isViewOnly = mode === "view";

  const teacherOptions = teachers
    .map((t) => ({
      value: t._id,
      label: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    if (!isOpen) return;
    if (cls) {
      setFormData({
        className: cls.name || "",
        section: cls.section || "",
        academicYear: cls.academicYear || "",
        classTeacher: cls.classTeacher?._id || cls.classTeacher || "",
        roomNumber: cls.room || "",
        capacity: cls.capacity?.toString() || "",
        shift: cls.shift || "Morning",
        status: cls.isActive ? "Active" : "Inactive",
        description: cls.description || "",
      });
    }
    setErrors({});
  }, [cls, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.className.trim()) e.className = "Required";
    if (!formData.section.trim()) e.section = "Required";
    if (!formData.academicYear.trim()) e.academicYear = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log("formData:", JSON.stringify(formData));
    if (isViewOnly || !validate()) return;

    setIsSaving(true);

    const payload = {
      name: formData.className.trim(),
      section: formData.section.trim(),
      academicYear: formData.academicYear.trim(),
      room: formData.roomNumber.trim() || undefined,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
      shift: formData.shift,
      description: formData.description.trim(),
      isActive: formData.status === "Active",
    };
    if (formData.classTeacher) payload.classTeacher = formData.classTeacher;

    try {
      const result = await updateClass(cls._id, payload);
      toast.success("Class updated successfully!");
      setIsSaving(false);
      onSave(result.data);
      // onClose();
    } catch (error) {
      toast.error(error.message || "Update failed.");
      setIsSaving(false);
      setErrors((prev) => ({ ...prev, submit: error.message || "Update fail ho gaya" }));
    }
  };

  if (!isOpen) return null;

 const classTeacherDisplayName = cls?.classTeacher
  ? cls.classTeacher.name || `${cls.classTeacher.firstName || ""} ${cls.classTeacher.lastName || ""}`.trim()
  : "Not Assigned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {mode === "edit" ? "Edit Class" : "Class Details"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form onSubmit={handleSubmit} id="class-form">
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label="Class Name"
                name="className"
                value={formData.className}
                onChange={handleChange}
                required
                error={errors.className}
                disabled={isViewOnly}
              />
              <FloatingInput
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                error={errors.section}
                disabled={isViewOnly}
              />
              <FloatingInput
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                error={errors.academicYear}
                disabled={isViewOnly}
              />
              <FloatingSelect
                label="Class Teacher"
                name="classTeacher"
                options={teacherOptions}
                value={formData.classTeacher}
                onChange={handleChange}
                disabled={isViewOnly}
                displayValue={classTeacherDisplayName}
              />
              <FloatingInput
                label="Room Number"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              <FloatingInput
                label="Capacity"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              <FloatingSelect
                label="Shift"
                name="shift"
                options={["Morning", "Evening"]}
                value={formData.shift}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              <FloatingSelect
                label="Status"
                name="status"
                options={["Active", "Inactive"]}
                value={formData.status}
                onChange={handleChange}
                disabled={isViewOnly}
              />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Description
                </label>
                {isViewOnly ? (
                  <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-700 min-h-[72px]">
                    {formData.description || "—"}
                  </div>
                ) : (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional information..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
            {errors.submit && (
              <p className="text-rose-500 text-xs mt-3">{errors.submit}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          {!isViewOnly ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="class-form"
                disabled={isSaving}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSaving && (
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                {isSaving ? "Saving..." : "Update Class"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const result = await getAllClasses();
        setClasses(result.data || []);
        setFiltered(result.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load classes: " + error.message);
        setClasses([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Teacher list — ClassModal ke "Class Teacher" dropdown ke liye
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const result = await getAllTeachers();
        setTeachers(result.data || []);
      } catch (error) {
        console.error(error);
        setTeachers([]);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    let result = classes;
    if (search) {
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          (c.classTeacher &&
            `${c.classTeacher.firstName} ${c.classTeacher.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase()))
      );
    }
    if (shiftFilter) result = result.filter((c) => c.shift === shiftFilter);
    if (statusFilter)
      result = result.filter((c) =>
        statusFilter === "Active" ? c.isActive : !c.isActive
      );
    setFiltered(result);
  }, [search, shiftFilter, statusFilter, classes]);

  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) => c.isActive).length;
  const totalCapacity = classes.reduce((acc, c) => acc + (c.capacity || 0), 0);
  const totalTeachers = [
    ...new Set(classes.filter((c) => c.classTeacher).map((c) => c.classTeacher._id)),
  ].length;

  const exportCSV = () => {
    const headers = [
      "Class",
      "Section",
      "Academic Year",
      "Teacher",
      "Capacity",
      "Room No",
      "Shift",
      "Status",
    ];
    const rows = filtered.map((c) => [
      c.name,
      c.section,
      c.academicYear,
      c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : "Not Assigned",
      c.capacity,
      c.room,
      c.shift,
      c.isActive ? "Active" : "Inactive",
    ]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
        type: "text/csv",
      }),
      "classes.csv",
    );
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((c) => ({
        Class: c.name,
        Section: c.section,
        "Academic Year": c.academicYear,
        Teacher: c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : "Not Assigned",
        Capacity: c.capacity,
        "Room No": c.room,
        Shift: c.shift,
        Status: c.isActive ? "Active" : "Inactive",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Classes List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        ["Class", "Section", "Academic Year", "Teacher", "Capacity", "Room", "Shift", "Status"],
      ],
      body: filtered.map((c) => [
        c.name,
        c.section,
        c.academicYear,
        c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : "Not Assigned",
        c.capacity,
        c.room,
        c.shift,
        c.isActive ? "Active" : "Inactive",
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("classes.pdf");
  };

  const openModal = (cls, mode) => {
    setSelectedClass(cls);
    setModalMode(mode);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedClass(null);
  };
const handleSave = (updatedClass) => {
  setClasses((prev) =>
    prev.map((c) => (c._id === updatedClass._id ? updatedClass : c))
  );
  closeModal();
};
  const handleDelete = (cls) => {
    confirmToast(
      `Delete "${cls.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteClass(cls._id);
          setClasses((prev) => prev.filter((c) => c._id !== cls._id));
          toast.success("Class deleted successfully!");
        } catch (error) {
          toast.error(error.message || "Failed to delete class");
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Class Management</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Class Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Manage all school classes, sections, and assignments
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              label: "Total Classes",
              value: totalClasses,
              bg: "bg-indigo-100",
              ic: "text-indigo-600",
              path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              label: "Active Classes",
              value: activeClasses,
              bg: "bg-emerald-100",
              ic: "text-emerald-600",
              path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              label: "Total Capacity",
              value: totalCapacity,
              bg: "bg-blue-100",
              ic: "text-blue-600",
              path: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
            },
            {
              label: "Class Teachers",
              value: totalTeachers,
              bg: "bg-purple-100",
              ic: "text-purple-600",
              path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {s.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}
                >
                  <svg
                    className={`w-5 h-5 ${s.ic}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={s.path}
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters + Exports — all in one box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search by class name or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            {/* Shift filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {/* Exports — colorful */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={exportCSV}
                title="Export CSV"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <FaFileCsv className="text-slate-600 w-4 h-4" />
              </button>
              <button
                onClick={exportExcel}
                title="Export Excel"
                className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
              >
                <FaFileExcel className="text-emerald-600 w-4 h-4" />
              </button>
              <button
                onClick={exportPDF}
                title="Export PDF"
                className="p-2 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
              >
                <FaFilePdf className="text-rose-600 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Class Name",
                      "Section",
                      "Academic Year",
                      "Class Teacher",
                      "Capacity",
                      "Room No",
                      "Shift",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-4 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cls) => (
                    <tr
                      key={cls._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-3.5 px-5 font-medium text-slate-800 text-sm">
                        {cls.name}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-sm">
                        {cls.section}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-sm">
                        {cls.academicYear}
                      </td>
                      <td className="py-3.5 px-5">
                        <TeacherAvatar teacher={cls.classTeacher} />
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-sm">
                        {cls.capacity}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-sm">
                        {cls.room || "—"}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                          {cls.shift}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={cls.isActive ? "Active" : "Inactive"} />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(cls, "view")}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openModal(cls, "edit")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ClassModal
        isOpen={modalOpen}
        onClose={closeModal}
        cls={selectedClass}
        mode={modalMode}
        onSave={handleSave}
        teachers={teachers}
      />
    </div>
  );
}