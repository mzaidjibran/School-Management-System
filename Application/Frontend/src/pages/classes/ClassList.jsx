import { useState, useEffect, useRef } from "react";
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
import { getAllClasses, updateClass, deleteClass, createClass } from "../../api/Class_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import { getAllTeachers } from "../../api/Teacher_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
      className={`peer w-full px-4 pt-5 pb-2 border rounded-md bg-white text-slate-800 outline-none transition-all text-sm
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
        <div className="w-full px-4 pt-5 pb-2 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 min-h-[52px]">
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
        className={`peer w-full px-4 pt-5 pb-2 border rounded-md bg-white text-slate-800 outline-none transition-all appearance-none text-sm
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
    <div className="h-10 bg-slate-200 rounded-md"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-md"></div>
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
  const [imgError, setImgError] = useState(false);
  if (!teacher) {
    return <span className="text-xs text-slate-400 italic">Not Assigned</span>;
  }
  const name = teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "-";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getProfileImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const src = getProfileImageUrl(teacher.profileImage);

  return (
    <div className="flex items-center gap-2">
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold ring-1 ring-slate-200">
          {initials}
        </div>
      )}
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
      setErrors((prev) => ({ ...prev, submit: error.message || "Update failed" }));
    }
  };

  if (!isOpen) return null;

 const classTeacherDisplayName = cls?.classTeacher
  ? cls.classTeacher.name || `${cls.classTeacher.firstName || ""} ${cls.classTeacher.lastName || ""}`.trim()
  : "Not Assigned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {mode === "edit" ? "Edit Class" : "Class Details"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Description
                </label>
                {isViewOnly ? (
                  <div className="w-full px-4 py-3 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 min-h-[72px]">
                    {formData.description || "—"}
                  </div>
                ) : (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional information..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-4 py-2 text-xs border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="class-form"
                disabled={isSaving}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-60 flex items-center gap-1.5"
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
              className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
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

  const fetchTeachersList = async () => {
    try {
      const result = await getAllTeachers();
      setTeachers(result.data || []);
    } catch (error) {
      console.error(error);
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachersList();

    const handleUpdate = () => {
      fetchClasses();
      fetchTeachersList();
    };

    window.addEventListener("branch-changed", handleUpdate);
    return () => {
      window.removeEventListener("branch-changed", handleUpdate);
    };
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
      "Description",
      "Status",
    ];
    const rows = filtered.map((c) => [
      c.name || "",
      c.section || "",
      c.academicYear || "",
      c.classTeacher ? `${c.classTeacher.firstName || ""} ${c.classTeacher.lastName || ""}`.trim() : "Not Assigned",
      c.capacity || "40",
      c.room || "",
      c.shift || "Morning",
      c.description || "",
      c.isActive ? "Active" : "Inactive",
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(
      new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      }),
      "classes.csv",
    );
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
    const headers = ["name", "section", "academicYear", "teacherName", "capacity", "room", "shift", "isActive"];
    const rows = classes.map((c) => [
      c.name || "",
      c.section || "",
      c.academicYear || "",
      c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}`.trim() : "",
      c.capacity || "",
      c.room || "",
      c.shift || "",
      c.isActive !== undefined ? c.isActive : true
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "classes_backup.csv");
    toast.success("Classes backup downloaded successfully!");
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
        const teachersRes = await getAllTeachers();
        const teachersList = teachersRes.data || [];
        let successCount = 0;
        let failCount = 0;
        const loadingToastId = toast.loading("Uploading classes...");
        for (const row of parsed) {
          try {
            // Case-insensitive key lookup helper
            const getVal = (r, ...keys) => {
              for (const k of keys) {
                if (r[k] !== undefined) return r[k];
                const foundKey = Object.keys(r).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
                if (foundKey) return r[foundKey];
              }
              return "";
            };

            const classNameVal = getVal(row, "name", "class", "className", "class name");
            const teacherNameVal = getVal(row, "teacherName", "teacher", "classTeacher", "class teacher", "teacherName");

            const matchedTeacher = teachersList.find(t => {
              const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim().toLowerCase();
              return fullName === teacherNameVal.toLowerCase() || (t.name || "").toLowerCase() === teacherNameVal.toLowerCase();
            });

            const statusVal = getVal(row, "status", "isActive", "active");
            const isActive = statusVal ? (statusVal.toLowerCase() === "active" || statusVal.toLowerCase() === "true" || statusVal === "1") : true;

            const payload = {
              name: classNameVal,
              section: getVal(row, "section"),
              academicYear: getVal(row, "academicYear", "academic year", "year") || new Date().getFullYear().toString(),
              capacity: Number(getVal(row, "capacity")) || 40,
              room: getVal(row, "room", "room no", "room number", "roomNo"),
              shift: getVal(row, "shift") || "Morning",
              description: getVal(row, "description", "desc"),
              isActive: isActive,
            };
            if (matchedTeacher) {
              payload.classTeacher = matchedTeacher._id;
            }
            await createClass(payload);
            successCount++;
          } catch (err) {
            console.error("Failed to create class from CSV row:", row, err);
            const className = row.Class || row.name || row.className || "Class";
            toast.error(`Row "${className}": ${err.message}`);
            failCount++;
          }
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) {
          toast.success(`${successCount} classes uploaded successfully!`);
          fetchClasses();
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
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Class Management</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="bg-white rounded-md shadow-sm border border-slate-100 p-5 hover:shadow-md transition"
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
                  className={`w-10 h-10 ${s.bg} rounded-md flex items-center justify-center`}
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
        <div className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search by class name or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            {/* Shift filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {/* Exports — colorful */}
            <div className="flex flex-wrap gap-2 items-center ml-auto">
              <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
              <button type="button" onClick={() => csvFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
              <button type="button" onClick={handleBackupData} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup Data</button>
              <button
                onClick={exportExcel}
                title="Export Excel"
                className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
              >
                <FaFileExcel className="text-emerald-600 w-4 h-4" />
              </button>
              <button
                onClick={exportPDF}
                title="Export PDF"
                className="p-2 bg-rose-50 hover:bg-rose-100 rounded-md transition"
              >
                <FaFilePdf className="text-rose-600 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="w-full min-w-[900px]">
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
                        <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
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
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openModal(cls, "edit")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
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

        {/* Mobile Card List View */}
        <div className="block md:hidden space-y-2.5">
          {loading ? (
            <div className="p-10 text-center text-slate-500 bg-white rounded-md border border-slate-100 text-sm animate-pulse">Loading classes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-white rounded-md border border-slate-100 text-sm">No classes found</div>
          ) : (
            filtered.map((cls) => (
              <div key={cls._id} className="bg-white p-3 border border-slate-100 shadow-sm flex flex-col gap-2 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{cls.name}</h3>
                    <p className="text-xs text-slate-500">Section {cls.section} • {cls.shift} Shift</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(cls, "view")}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                      title="View"
                    >
                      <FaEye size={14} />
                    </button>
                    <button
                      onClick={() => openModal(cls, "edit")}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cls)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
                  <div><span className="text-slate-400">Teacher:</span> <strong className="text-slate-700 font-medium">{cls.classTeacher ? (cls.classTeacher.name || `${cls.classTeacher.firstName || ""} ${cls.classTeacher.lastName || ""}`.trim()) : "—"}</strong></div>
                  <div><span className="text-slate-400">Room No:</span> <strong className="text-slate-700 font-medium">{cls.room || "—"}</strong></div>
                  <div><span className="text-slate-400">Capacity:</span> <strong className="text-slate-700 font-medium">{cls.capacity}</strong></div>
                  <div><span className="text-slate-400">Status:</span> <strong className={`font-medium ${cls.isActive ? "text-emerald-600" : "text-slate-500"}`}>{cls.isActive ? "Active" : "Inactive"}</strong></div>
                </div>
              </div>
            ))
          )}
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