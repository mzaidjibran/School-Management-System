import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import createStudent, { getAllStudents, updateStudent, deleteStudent } from "../../Api/Student_Api";
import { getAllClasses } from "../../Api/Class_Api";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ---------- Floating Label Input ----------
const Input = ({ label, type = "text", name, value, onChange, required = false, disabled = false, error, className = "" }) => {
  const isDate = type === "date";
  const hasValue = !!value;
  return (
    <div className={`relative ${className}`}>
      <input
        type={type} name={name} id={name} value={value} onChange={onChange}
        disabled={disabled} placeholder=" "
        style={isDate && !hasValue ? { color: "transparent" } : {}}
        onFocus={(e) => { if (isDate) e.target.style.color = "inherit"; }}
        onBlur={(e) => { if (isDate && !value) e.target.style.color = "transparent"; }}
        className={`peer w-full px-3 pt-5 pb-1.5 border rounded-lg bg-white text-slate-800 outline-none transition-all text-sm
          ${error ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
          focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
      />
      <label htmlFor={name} className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {error && <p className="text-red-400 text-[11px] mt-0.5 ml-1">{error}</p>}
    </div>
  );
};

// ---------- Floating Label Select ----------
const Select = ({ label, name, options = [], value, onChange, required = false, disabled = false, error, className = "" }) => {
  if (disabled) {
    const selectedOpt = options.find(o => typeof o === "object" ? o.value === value : o === value);
    const displayVal = selectedOpt ? (typeof selectedOpt === "object" ? selectedOpt.label : selectedOpt) : (value || "—");
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 min-h-[44px]">
          {displayVal}
        </div>
        <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">{label}</label>
      </div>
    );
  }
  return (
    <div className={`relative ${className}`}>
      <select name={name} id={name} value={value} onChange={onChange}
        className={`peer w-full px-3 pt-5 pb-1.5 border rounded-lg bg-white text-slate-800 outline-none transition-all appearance-none text-sm
          ${error ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
          focus:ring-2`}>
        <option value=""></option>
        {options.map((o) => {
          const val = typeof o === "object" ? o.value : o;
          const lbl = typeof o === "object" ? o.label : o;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <label htmlFor={name} className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <svg className="absolute right-2.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
      {error && <p className="text-red-400 text-[11px] mt-0.5 ml-1">{error}</p>}
    </div>
  );
};

// ---------- Stats Card ----------
const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
    </div>
  </div>
);

// ---------- Custom Table Styles ----------
const customStyles = {
  table: { style: { backgroundColor: "transparent" } },
  headRow: {
    style: {
      backgroundColor: "#f8fafc", borderBottomWidth: "1px",
      borderBottomColor: "#e2e8f0", fontSize: "0.875rem",
      fontWeight: "600", color: "#475569",
    },
  },
  headCells: { style: { paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.875rem", paddingBottom: "0.875rem" } },
  rows: { style: { backgroundColor: "transparent", minHeight: "72px", "&:hover": { backgroundColor: "#f1f5f9" } } },
  cells: { style: { paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.875rem", paddingBottom: "0.875rem", fontSize: "0.875rem" } },
};

const Avatar = ({ src, name }) => (
  <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200" />
);

const ActionButtons = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-3">
    <button onClick={() => onView(row)} className="text-indigo-600 hover:text-indigo-800 transition" title="View">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
    <button onClick={() => onEdit(row)} className="text-amber-600 hover:text-amber-800 transition" title="Edit">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
    <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800 transition" title="Delete">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
);

// ---------- Student Form Modal ----------
const StudentFormModal = ({ isOpen, onClose, student, mode, onSave }) => {
  const emptyForm = {
    name: "", gender: "", dateOfBirth: "", bloodGroup: "", cnic: "",
    religion: "", nationality: "", phone: "", email: "", address: "",
    city: "", fatherName: "", motherName: "", parentPhone: "", class: "",
    rollNumber: "", section: "", admissionDate: "", previousSchool: "",
    medicalInfo: "", emergencyName: "", emergencyPhone: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const isViewOnly = mode === "view";
  const [classesList, setClassesList] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        setClassesList(res.data || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    };
    fetchClasses();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (student) {
      setFormData({
        name: student.name || "",
        gender: student.gender || "",
        dateOfBirth: student.dateOfBirth || "",
        bloodGroup: student.bloodGroup || "",
        cnic: student.cnic || "",
        religion: student.religion || "",
        nationality: student.nationality || "",
        phone: student.phone || "",
        email: student.email || "",
        address: student.address || "",
        city: student.city || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        parentPhone: student.parentPhone || "",
        class: student.classId || "",
        rollNumber: student.rollNumber || "",
        section: student.section || "",
        schoolSection: student.schoolSection || "",
        admissionDate: student.admissionDate || "",
        previousSchool: student.previousSchool || "",
        medicalInfo: student.medicalInfo || "",
        emergencyName: student.emergencyName || "",
        emergencyPhone: student.emergencyPhone || "",
      });
      setImagePreview(student.picture || null);
    } else {
      setFormData({
        name: "",
        gender: "",
        dateOfBirth: "",
        bloodGroup: "",
        cnic: "",
        religion: "",
        nationality: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        fatherName: "",
        motherName: "",
        parentPhone: "",
        class: "",
        rollNumber: "",
        section: "",
        schoolSection: localStorage.getItem("activeSection") || "girls",
        admissionDate: "",
        previousSchool: "",
        medicalInfo: "",
        emergencyName: "",
        emergencyPhone: "",
      });
      setProfileImage(null);
      setImagePreview(null);
      setImageError("");
      setErrors({});
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { setImageError("Only JPG or PNG allowed."); return; }
    if (file.size > 2 * 1024 * 1024) { setImageError("Max size 2MB."); return; }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError("");
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Required";
    if (!formData.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.phone.trim()) e.phone = "Required";
    if (!formData.gender) e.gender = "Required";
    if (!formData.class) e.class = "Required";
    if (!formData.rollNumber) e.rollNumber = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly || !validate()) return;
    setIsSaving(true);
    await onSave({ id: student?.id, ...formData }, profileImage);
    setIsSaving(false);
  };

  const SectionHeader = ({ title }) => (
    <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2 mb-3">{title}</h3>
  );

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {mode === "edit" ? "Edit Student" : "Student Profile"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form onSubmit={handleSubmit} id="student-form" className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {imagePreview && !isViewOnly && (
                  <button type="button" onClick={() => { setProfileImage(null); setImagePreview(null); }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {!isViewOnly && (
                <div>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                    Upload Photo
                    <input type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
                  </label>
                  {imageError && <p className="text-red-400 text-[11px] mt-1">{imageError}</p>}
                  <p className="text-xs text-slate-400 mt-1">JPG/PNG, max 2MB</p>
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div>
              <SectionHeader title="Personal Information" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required error={errors.name} disabled={isViewOnly} />
                <Select label="Gender" name="gender" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleChange} required error={errors.gender} disabled={isViewOnly} />
                <Input label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={isViewOnly} />
                <Select label="Blood Group" name="bloodGroup" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} value={formData.bloodGroup} onChange={handleChange} disabled={isViewOnly} />
                <Input label="CNIC (optional)" name="cnic" value={formData.cnic} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Religion" name="religion" value={formData.religion} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} disabled={isViewOnly} />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <SectionHeader title="Contact Information" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required error={errors.phone} disabled={isViewOnly} />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required error={errors.email} disabled={isViewOnly} />
                <Input label="Address" name="address" value={formData.address} onChange={handleChange} disabled={isViewOnly} />
                <Input label="City" name="city" value={formData.city} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Parent/Guardian Phone" type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} disabled={isViewOnly} />
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <SectionHeader title="Academic Information" />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Class"
                  name="class"
                  options={classesList.map((c) => ({ value: c._id, label: `${c.name} (${c.section})` }))}
                  value={formData.class}
                  onChange={handleChange}
                  required
                  error={errors.class}
                  disabled={isViewOnly}
                />
                <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required error={errors.rollNumber} disabled={isViewOnly} />
                <Input label="Class Section (e.g. A, B)" name="section" value={formData.section} onChange={handleChange} disabled={isViewOnly} />
                <Select
                  label="School Section"
                  name="schoolSection"
                  options={[
                    { value: "girls", label: "Girls Section" },
                    { value: "boys", label: "Boys Section" },
                  ]}
                  value={formData.schoolSection}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  required
                />
                <Input label="Admission Date" type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} disabled={isViewOnly} />
                <Input label="Previous School" name="previousSchool" value={formData.previousSchool} onChange={handleChange} disabled={isViewOnly} />
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <SectionHeader title="Additional Information" />
              <div className="space-y-3">
                {isViewOnly ? (
                  <div className="relative">
                    <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 min-h-[60px]">
                      {formData.medicalInfo || "—"}
                    </div>
                    <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">Medical Info / Allergies</label>
                  </div>
                ) : (
                  <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows={2}
                    placeholder="Medical Information / Allergies..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Emergency Contact Name" name="emergencyName" value={formData.emergencyName} onChange={handleChange} disabled={isViewOnly} />
                  <Input label="Emergency Contact Phone" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} disabled={isViewOnly} />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          {!isViewOnly ? (
            <>
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" form="student-form" disabled={isSaving}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-60 flex items-center gap-1.5">
                {isSaving && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isSaving ? "Saving..." : "Update Student"}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [apiError, setApiError] = useState("");

  const parseDate = (d) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "";
      // Handle extreme years that would throw in toISOString
      if (date.getFullYear() > 9999 || date.getFullYear() < 1000) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getAllStudents();
      const list = (res.data || []).map((s) => ({
        id: s._id,
        name: s.Name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        gender: s.gender || "",
        dateOfBirth: s.dateofBirth || s.dateOfBirth ? parseDate(s.dateofBirth || s.dateOfBirth) : "",
        bloodGroup: s.bloodGroup || "",
        cnic: s.cnic || s.CNIC || "",
        religion: s.religion || "",
        nationality: s.nationality || "",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || "",
        city: s.city || "",
        fatherName: s.guardian?.name || "",
        motherName: s.motherName || "",
        parentPhone: s.guardian?.phone || "",
        classId: s.currentClass?._id || s.currentClass || "",
        class: s.currentClass?.name || s.class || "",
        rollNumber: s.rollNumber || "",
        section: s.section || "",
        schoolSection: s.schoolSection || "",
        admissionDate: s.admissionDate ? parseDate(s.admissionDate) : "",
        previousSchool: s.previousSchool || "",
        medicalInfo: s.medicalInfo || "",
        emergencyName: s.emergencyName || "",
        emergencyPhone: s.emergencyPhone || "",
        picture: s.profileImage
          ? `${API_BASE}${s.profileImage}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              s.Name || s.firstName || "S"
            )}&background=3b82f6&color=fff`,
        isNewThisMonth:
          new Date(s.admissionDate || s.createdAt).getMonth() === new Date().getMonth() &&
          new Date(s.admissionDate || s.createdAt).getFullYear() === new Date().getFullYear(),
      }));
      setStudents(list);
      setFilteredStudents(list);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Students load nahi ho sake: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    window.addEventListener("branch-changed", fetchStudents);
    return () => {
      window.removeEventListener("branch-changed", fetchStudents);
    };
  }, []);

  useEffect(() => {
    let result = students;
    if (searchTerm)
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.includes(searchTerm)
      );
    if (classFilter) result = result.filter((s) => s.class === classFilter);
    setFilteredStudents(result);
  }, [searchTerm, classFilter, students]);

  const totalStudents = students.length;
  const newThisMonth = students.filter((s) => s.isNewThisMonth).length;
  const uniqueClasses = [...new Set(students.map((s) => s.class).filter(Boolean))];

  const exportCSV = () => {
    const headers = ["Name", "Class", "Roll No", "Section", "Phone", "Email", "Father Name", "Admission Date"];
    const rows = filteredStudents.map((s) => [s.name, s.class, s.rollNumber, s.section, s.phone, s.email, s.fatherName, s.admissionDate]);
    saveAs(new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }), "students.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStudents.map((s) => ({
      Name: s.name, Class: s.class, "Roll No": s.rollNumber, Section: s.section,
      Phone: s.phone, Email: s.email, "Father Name": s.fatherName, "Admission Date": s.admissionDate,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Students List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Class", "Roll No", "Phone", "Email", "Father Name"]],
      body: filteredStudents.map((s) => [s.name, s.class, s.rollNumber, s.phone, s.email, s.fatherName]),
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });
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
    const headers = [
      "firstName", "lastName", "gender", "dateOfBirth", "email", "phone",
      "address", "city", "fatherName", "parentPhone", "rollNumber", "section", "schoolSection",
      "admissionDate", "className", "cnic", "bloodGroup", "religion",
      "nationality", "previousSchool", "medicalInfo", "emergencyName", "emergencyPhone"
    ];
    const rows = students.map((s) => [
      s.firstName || "",
      s.lastName || "",
      s.gender || "",
      s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
      s.email || "",
      s.phone || "",
      s.address || "",
      s.city || "",
      s.guardian?.name || s.fatherName || "",
      s.guardian?.phone || s.parentPhone || "",
      s.rollNumber || "",
      s.section || "",
      s.schoolSection || "",
      s.admissionDate ? s.admissionDate.split("T")[0] : "",
      s.class?.name || s.className || "",
      s.CNIC || "",
      s.bloodGroup || "",
      s.religion || "",
      s.nationality || "",
      s.previousSchool || "",
      s.medicalInfo || "",
      s.emergencyName || "",
      s.emergencyPhone || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "students_backup.csv");
    toast.success("Students backup downloaded successfully!");
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
        const classesRes = await getAllClasses();
        const classesList = classesRes.data || [];
        let successCount = 0;
        let failCount = 0;
        const loadingToastId = toast.loading("Uploading students...");
        for (const row of parsed) {
          try {
            const matchedClass = classesList.find(c => c.name.toLowerCase() === (row.className || "").toLowerCase());
            const fd = new FormData();
            fd.append("firstName", row.firstName || "");
            fd.append("lastName", row.lastName || "");
            fd.append("gender", (row.gender || "male").toLowerCase());
            fd.append("dateOfBirth", row.dateOfBirth || "");
            fd.append("email", row.email || "");
            fd.append("phone", row.phone || "");
            fd.append("address", row.address || "");
            fd.append("city", row.city || "");
            fd.append("guardian[name]", row.fatherName || "");
            fd.append("guardian[phone]", row.parentPhone || "");
            fd.append("guardian[relationship]", "father");
            fd.append("rollNumber", row.rollNumber || "");
            fd.append("section", row.section || "");
            fd.append("schoolSection", (row.schoolSection || localStorage.getItem("activeSection") || "girls").toLowerCase());
            fd.append("admissionDate", row.admissionDate || new Date().toISOString().split("T")[0]);
            if (matchedClass) fd.append("class", matchedClass._id);
            if (row.cnic) fd.append("CNIC", row.cnic);
            if (row.bloodGroup) fd.append("bloodGroup", row.bloodGroup);
            if (row.religion) fd.append("religion", row.religion);
            if (row.nationality) fd.append("nationality", row.nationality);
            if (row.previousSchool) fd.append("previousSchool", row.previousSchool);
            if (row.medicalInfo) fd.append("medicalInfo", row.medicalInfo);
            if (row.emergencyName) fd.append("emergencyName", row.emergencyName);
            if (row.emergencyPhone) fd.append("emergencyPhone", row.emergencyPhone);
            await createStudent(fd);
            successCount++;
          } catch (err) {
            console.error("Failed to create student from CSV row:", row, err);
            toast.error(`Row "${row.firstName} ${row.lastName}": ${err.message}`);
            failCount++;
          }
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) {
          toast.success(`${successCount} students uploaded successfully!`);
          fetchStudents();
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

  const openModal = (student, mode) => { setSelectedStudent(student); setModalMode(mode); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedStudent(null); };

  const handleSaveStudent = async (data, imageFile) => {
    try {
      const fd = new FormData();
      const nameParts = (data.name || "").trim().split(/\s+/);
      fd.append("firstName", nameParts[0] || "");
      fd.append("lastName", nameParts.slice(1).join(" ") || "");
      fd.append("gender", (data.gender || "").toLowerCase());
      fd.append("email", data.email || "");
      fd.append("phone", data.phone || "");
      fd.append("rollNumber", data.rollNumber || "");
      fd.append("section", data.section || "");
      fd.append("schoolSection", data.schoolSection || "");
      fd.append("admissionDate", data.admissionDate || "");
      fd.append("guardian[name]", data.fatherName || "");
      fd.append("guardian[phone]", data.parentPhone || "");
      fd.append("guardian[relationship]", data.fatherName ? "father" : "mother");
      if (data.dateOfBirth)    fd.append("dateOfBirth", data.dateOfBirth);
      if (data.bloodGroup)     fd.append("bloodGroup", data.bloodGroup);
      if (data.cnic)           fd.append("CNIC", data.cnic);
      if (data.class)          fd.append("class", data.class);
      if (data.previousSchool) fd.append("previousSchool", data.previousSchool);
      if (data.medicalInfo)    fd.append("medicalInfo", data.medicalInfo);
      if (data.emergencyName)  fd.append("emergencyName", data.emergencyName);
      if (data.emergencyPhone) fd.append("emergencyPhone", data.emergencyPhone);
      if (data.religion)       fd.append("religion", data.religion);
      if (data.nationality)    fd.append("nationality", data.nationality);
      if (data.address)        fd.append("address", data.address);
      if (data.city)           fd.append("city", data.city);
      if (data.motherName)     fd.append("motherName", data.motherName);
      if (imageFile)           fd.append("profileImage", imageFile);

      await updateStudent(data.id, fd);
      toast.success("Student updated successfully!");
      await fetchStudents();
      closeModal();
    } catch (err) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleDeleteStudent = (student) => {
    confirmToast(
      `Delete "${student.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteStudent(student.id);
          setStudents((prev) => prev.filter((s) => s.id !== student.id));
          toast.success("Student deleted successfully!");
        } catch (err) {
          toast.error(err.message || "Failed to delete student");
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  const columns = [
    { name: "Photo", selector: (row) => row.picture, cell: (row) => <Avatar src={row.picture} name={row.name} />, width: "80px" },
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 2 },
    { name: "Class", selector: (row) => row.class, sortable: true },
    { name: "Roll No", selector: (row) => row.rollNumber, sortable: true },
    { name: "Section", selector: (row) => row.section, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true, grow: 2 },
    { name: "Father Name", selector: (row) => row.fatherName, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <ActionButtons
          row={row}
          onView={() => openModal(row, "view")}
          onEdit={() => openModal(row, "edit")}
          onDelete={() => handleDeleteStudent(row)}
        />
      ),
      width: "130px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatsCard label="Total Students" value={totalStudents} bgColor="bg-indigo-100" iconColor="text-indigo-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatsCard label="New This Month" value={newThisMonth} bgColor="bg-emerald-100" iconColor="text-emerald-600" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Classes" value={uniqueClasses.length} bgColor="bg-blue-100" iconColor="text-blue-600" icon="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <StatsCard label="Selected Rows" value={selectedRows.length} bgColor="bg-purple-100" iconColor="text-purple-600" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </div>

      {/* API Error */}
      {apiError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {apiError}
        </div>
      )}

      {/* Search + Filter + Export */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text" placeholder="Search by name, email, roll no..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Classes</option>
            {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
            <button type="button" onClick={() => csvFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
            <button type="button" onClick={handleBackupData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup Data</button>
            <button onClick={exportExcel} title="Export Excel" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"><FaFileExcel className="text-green-600" /></button>
            <button onClick={exportPDF} title="Export PDF" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"><FaFilePdf className="text-red-600" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredStudents}
          progressPending={loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30]}
          selectableRows
          onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
          responsive
          customStyles={customStyles}
          progressComponent={<div className="p-10 text-center text-slate-500 text-sm">Loading students...</div>}
          noDataComponent={<div className="p-10 text-center text-slate-500 text-sm">No students found</div>}
          highlightOnHover
          pointerOnHover
        />
      </div>

      <StudentFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        student={selectedStudent}
        mode={modalMode}
        onSave={handleSaveStudent}
      />
    </div>
  );
}