import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import createTeacher, { getAllTeachers, updateTeacher, deleteTeacher } from "../../api/Teacher_Api.js";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────
const getProfileImageUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `${API_BASE}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`;
};

const formatStatus = (status) => {
  if (!status) return "Active";
  const map = { active: "Active", inactive: "Inactive", on_leave: "On Leave" };
  return map[status.toLowerCase()] || status;
};

const toBackendStatus = (display) => {
  const map = { Active: "active", Inactive: "inactive", "On Leave": "on_leave" };
  return map[display] || display?.toLowerCase();
};

// ─── Sub-components ───────────────────────────────────────────────
const customStyles = {
  table: { style: { backgroundColor: "transparent" } },
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottomWidth: "1px",
      borderBottomColor: "#e2e8f0",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#475569",
    },
  },
  headCells: { style: { paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.875rem", paddingBottom: "0.875rem" } },
  rows: {
    style: {
      backgroundColor: "transparent",
      minHeight: "72px",
      "&:hover": { backgroundColor: "#f1f5f9" },
    },
  },
  cells: { style: { paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.875rem", paddingBottom: "0.875rem", fontSize: "0.875rem" } },
};

const StatusBadge = ({ status }) => {
  const display = formatStatus(status);
  const styles = { Active: "bg-emerald-100 text-emerald-700", "On Leave": "bg-amber-100 text-amber-700", Inactive: "bg-red-100 text-red-700" };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[display] || "bg-slate-100 text-slate-600"}`}>{display}</span>;
};

const Avatar = ({ src, name }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (!src || imgError) {
    return (
      <div className="w-9 h-9 rounded-full bg-indigo-100 ring-2 ring-slate-200 flex items-center justify-center text-indigo-600 text-xs font-bold">
        {initials}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setImgError(true)} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200" />;
};

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

const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-md shadow-sm border border-slate-100">
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

// ==================== TEACHER FORM MODAL ====================
const TeacherFormModal = ({ isOpen, onClose, teacher, mode, onSave }) => {
  const emptyForm = {
    fullName: "", gender: "", dateOfBirth: "", cnic: "", bloodGroup: "",
    maritalStatus: "", phone: "", alternatePhone: "", email: "", address: "",
    city: "", subject: "", qualification: "", specialization: "", university: "",
    passingYear: "", employeeId: "", joiningDate: "", experience: "", salary: "",
    salaryBasis: "monthly", biometricId: "",
    employmentStatus: "", schoolSection: localStorage.getItem("activeSection") || "girls",
    notes: "", emergencyName: "", emergencyPhone: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);
  const isViewOnly = mode === "view";

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("personal");
    setSaveError("");
    if (teacher) {
      setFormData({
        fullName: teacher.fullName || teacher.name || "",
        gender: teacher.gender || "",
        dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split("T")[0] : "",
        cnic: teacher.cnic || "",
        bloodGroup: teacher.bloodGroup || "",
        maritalStatus: teacher.maritalStatus || "",
        phone: teacher.phone || "",
        alternatePhone: teacher.alternatePhone || "",
        email: teacher.email || "",
        address: teacher.address || "",
        city: teacher.city || "",
        subject: teacher.subject || "",
        qualification: teacher.qualification || "",
        specialization: teacher.specialization || "",
        university: teacher.university || "",
        passingYear: teacher.passingYear || "",
        employeeId: teacher.employeeId || "",
        joiningDate: teacher.joiningDate ? teacher.joiningDate.split("T")[0] : "",
        experience: teacher.experience || "",
        salary: teacher.salary ? String(teacher.salary) : "",
        salaryBasis: teacher.salaryBasis || "monthly",
        biometricId: teacher.biometricId || "",
        employmentStatus: teacher.employmentStatus || "",
        schoolSection: teacher.schoolSection || "",
        notes: teacher.notes || "",
        emergencyName: teacher.emergencyName || "",
        emergencyPhone: teacher.emergencyPhone || "",
      });
      const imgUrl = getProfileImageUrl(teacher.profileImage);
      setImagePreview(imgUrl || null);
    } else {
      setFormData(emptyForm);
      setProfileImage(null);
      setImagePreview(null);
      setImageError("");
      setErrors({});
    }
  }, [teacher, isOpen]);

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
    if (!formData.fullName.trim()) e.fullName = "Required";
    if (!formData.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.phone.trim()) e.phone = "Required";
    if (!formData.gender) e.gender = "Required";
    if (!formData.subject) e.subject = "Required";
    if (!formData.qualification) e.qualification = "Required";
    if (!formData.employeeId) e.employeeId = "Required";
    if (!formData.joiningDate) e.joiningDate = "Required";
    if (!formData.employmentStatus) e.employmentStatus = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly || !validate()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) payload.append(key, value);
      });
      if (profileImage) payload.append("profileImage", profileImage);

      const result = await updateTeacher(teacher._id || teacher.id, payload);
      toast.success("Teacher updated successfully!");
      onSave(result.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Update failed. Please try again.");
      setSaveError(err.message || "Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const FI = ({ label, name, type = "text", required, colSpan }) => {
    const isDate = type === "date";
    const hasValue = !!formData[name];
    return (
      <div className={colSpan ? "col-span-1 md:col-span-2" : ""}>
        <div className="relative">
          <input
            type={type} name={name} id={name} value={formData[name] || ""} onChange={handleChange}
            disabled={isViewOnly} placeholder=" "
            style={isDate && !hasValue ? { color: "transparent" } : {}}
            onFocus={(e) => { if (isDate) e.target.style.color = "inherit"; }}
            onBlur={(e) => { if (isDate && !formData[name]) e.target.style.color = "transparent"; }}
            className={`peer w-full px-3 pt-5 pb-1.5 border rounded-md bg-white text-slate-800 outline-none transition-all text-sm
              ${errors[name] ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
              focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
          />
          <label htmlFor={name}
            className={`absolute left-3 pointer-events-none transition-all duration-150
              ${formData[name] ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
              peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
          >
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        </div>
        {errors[name] && <p className="text-red-400 text-[11px] mt-0.5 ml-1">{errors[name]}</p>}
      </div>
    );
  };

  const FS = ({ label, name, options = [], required }) => {
    if (isViewOnly) {
      const selectedOpt = options.find(o => typeof o === "object" ? o.value === formData[name] : o === formData[name]);
      const displayVal = selectedOpt ? (typeof selectedOpt === "object" ? selectedOpt.label : selectedOpt) : (formData[name] || "—");
      return (
        <div className="relative">
          <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 min-h-[52px]">
            {displayVal}
          </div>
          <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">{label}</label>
        </div>
      );
    }
    return (
      <div className="relative">
        <select name={name} id={name} value={formData[name] || ""} onChange={handleChange}
          className={`peer w-full px-3 pt-5 pb-1.5 border rounded-md bg-white text-slate-800 outline-none transition-all appearance-none text-sm
            ${errors[name] ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
            focus:ring-2`}
        >
          <option value=""></option>
          {options.map((o) => {
            const val = typeof o === "object" ? o.value : o;
            const lbl = typeof o === "object" ? o.label : o;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <label htmlFor={name}
          className={`absolute left-3 pointer-events-none transition-all duration-150
            ${formData[name] ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
            peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
        >
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <svg className="absolute right-2.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {errors[name] && <p className="text-red-400 text-[11px] mt-0.5 ml-1">{errors[name]}</p>}
      </div>
    );
  };

  const statusColors = { Active: "bg-emerald-100 text-emerald-700", "On Leave": "bg-amber-100 text-amber-700", Inactive: "bg-red-100 text-red-700" };
  const tabs = [{ id: "personal", label: "Personal" }, { id: "academic", label: "Academic" }, { id: "employment", label: "Employment" }];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {mode === "edit" ? "Edit Teacher" : mode === "add" ? "Add Teacher" : "Teacher Profile"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="hidden md:flex w-48 flex-shrink-0 bg-slate-50 border-r border-slate-100 flex-col items-center py-6 px-4 gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-slate-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              {!isViewOnly && (
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer shadow transition">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
                </label>
              )}
            </div>
            {imageError && <p className="text-red-400 text-[10px] text-center">{imageError}</p>}

            <div className="text-center w-full">
              <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{formData.fullName || "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{formData.subject || "No subject"}</p>
              {teacher?.status && (
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColors[formatStatus(teacher.status)] || "bg-slate-100 text-slate-600"}`}>
                  {formatStatus(teacher.status)}
                </span>
              )}
            </div>

            <div className="w-full space-y-3 mt-1">
              {[
                { icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2", label: "ID", value: formData.employeeId || "—" },
                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Joined", value: formData.joiningDate || "—" },
                { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Phone", value: formData.phone || "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 leading-none">{item.label}</p>
                    <p className="text-xs text-slate-600 font-medium break-all">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Tabbed Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-100 px-5 pt-3 gap-1">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition ${activeTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {saveError && (
                <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs">
                  {saveError}
                </div>
              )}
              <form onSubmit={handleSubmit} id="teacher-form">
                {activeTab === "personal" && (
                  <div className="space-y-5">
                    {/* Mobile Profile Photo (only on mobile) */}
                    <div className="flex md:hidden items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-100">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition">
                            Upload Photo
                            <input type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
                          </label>
                          {imageError && <p className="text-red-400 text-[11px] mt-1">{imageError}</p>}
                          <p className="text-xs text-slate-400 mt-1">JPG/PNG, max 2MB</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Personal</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FI label="Full Name" name="fullName" required />
                        <FS label="Gender" name="gender" options={["Male", "Female", "Other"]} required />
                        <FI label="Date of Birth" name="dateOfBirth" type="date" />
                        <FI label="CNIC" name="cnic" />
                        <FS label="Blood Group" name="bloodGroup" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
                        <FS label="Marital Status" name="maritalStatus" options={["Single", "Married", "Divorced", "Widowed"]} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Contact</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FI label="Phone" name="phone" type="tel" required />
                        <FI label="Alternate Phone" name="alternatePhone" type="tel" />
                        <FI label="Email" name="email" type="email" required />
                        <FI label="City" name="city" />
                        <FI label="Address" name="address" colSpan />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "academic" && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Academic</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FI label="Subject" name="subject" required />
                      <FI label="Qualification" name="qualification" required />
                      <FI label="Specialization" name="specialization" />
                      <FI label="University" name="university" />
                      <FI label="Passing Year" name="passingYear" type="number" />
                    </div>
                  </div>
                )}

                {activeTab === "employment" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Employment</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FI label="Employee ID" name="employeeId" required />
                        <FI label="Joining Date" name="joiningDate" type="date" required />
                        <FI label="Experience (years)" name="experience" type="number" />
                        <FI label="Salary (PKR)" name="salary" type="number" />
                        <FS label="Salary Basis" name="salaryBasis" options={[{value:"monthly",label:"Monthly"},{value:"weekly",label:"Weekly"},{value:"daily",label:"Daily"}]} />
                        <FI label="Biometric Machine ID (Enroll No)" name="biometricId" />
                        <FS label="Employment Status" name="employmentStatus" options={["Permanent", "Contract", "Probation", "Part-time"]} required />
                        <FS label="School Section" name="schoolSection" options={[{value:"girls",label:"Girls Section"},{value:"boys",label:"Boys Section"}]} required />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Emergency Contact</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FI label="Contact Name" name="emergencyName" />
                        <FI label="Contact Phone" name="emergencyPhone" type="tel" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} disabled={isViewOnly} rows={3}
                        placeholder="Any additional notes..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm text-slate-800 bg-white outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2.5">
              {!isViewOnly ? (
                <>
                  <button type="button" onClick={onClose} className="px-4 py-2 text-xs border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" form="teacher-form" disabled={isSaving}
                    className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isSaving && (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    {isSaving ? "Saving..." : "Update Teacher"}
                  </button>
                </>
              ) : (
                <button type="button" onClick={onClose} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DELETE CONFIRM MODAL ====================
const DeleteModal = ({ isOpen, teacher, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Delete Teacher</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete <span className="font-semibold text-slate-800">{teacher?.fullName || teacher?.name}</span>?
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {isDeleting && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function TeacherDataTable() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, teacher: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch teachers from API ───────────────────────────────────
  const fetchTeachers = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const result = await getAllTeachers();
      setTeachers(result.data || []);
      setFilteredTeachers(result.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load teachers.");
      setFetchError(err.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    window.addEventListener("branch-changed", fetchTeachers);
    return () => {
      window.removeEventListener("branch-changed", fetchTeachers);
    };
  }, []);

  // ─── Filter logic ──────────────────────────────────────────────
  useEffect(() => {
    let result = teachers;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((t) =>
        (t.fullName || t.name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        (t.phone || "").includes(searchTerm)
      );
    }
    if (subjectFilter) result = result.filter((t) => t.subject === subjectFilter);
    if (statusFilter) result = result.filter((t) => formatStatus(t.status) === statusFilter);
    setFilteredTeachers(result);
  }, [searchTerm, subjectFilter, statusFilter, teachers]);

  // ─── Stats ────────────────────────────────────────────────────
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newThisMonth = teachers.filter((t) => {
    if (!t.joiningDate && !t.createdAt) return false;
    const d = new Date(t.joiningDate || t.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // ─── Export ───────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Name", "Subject", "Phone", "Email", "Qualification", "Experience", "Joining Date", "Status"];
    const rows = filteredTeachers.map((t) => [
      t.fullName || t.name, t.subject, t.phone, t.email, t.qualification, t.experience, t.joiningDate?.split("T")[0], formatStatus(t.status),
    ]);
    saveAs(new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }), "teachers.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTeachers.map((t) => ({
      Name: t.fullName || t.name, Subject: t.subject, Phone: t.phone, Email: t.email,
      Qualification: t.qualification, Experience: t.experience,
      "Joining Date": t.joiningDate?.split("T")[0], Status: formatStatus(t.status),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teachers");
    XLSX.writeFile(wb, "teachers.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Teachers List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Subject", "Phone", "Email", "Qualification", "Experience", "Joining Date", "Status"]],
      body: filteredTeachers.map((t) => [
        t.fullName || t.name, t.subject, t.phone, t.email, t.qualification, t.experience, t.joiningDate?.split("T")[0], formatStatus(t.status),
      ]),
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("teachers.pdf");
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
      "firstName", "lastName", "gender", "email", "phone", "qualification",
      "experience", "subject", "salary", "address", "joiningDate", "status", "schoolSection"
    ];
    const rows = teachers.map((t) => [
      t.firstName || t.name?.split(" ")[0] || "",
      t.lastName || t.name?.split(" ").slice(1).join(" ") || "",
      t.gender || "",
      t.email || "",
      t.phone || "",
      t.qualification || "",
      t.experience || "",
      t.subject || "",
      t.salary || "",
      t.address || "",
      t.joiningDate ? t.joiningDate.split("T")[0] : "",
      t.status || "active",
      t.schoolSection || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "teachers_backup.csv");
    toast.success("Teachers backup downloaded successfully!");
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
        let successCount = 0;
        let failCount = 0;
        const loadingToastId = toast.loading("Uploading teachers...");
        for (const row of parsed) {
          try {
            const fd = new FormData();
            fd.append("firstName", row.firstName || "");
            fd.append("lastName", row.lastName || "");
            fd.append("gender", (row.gender || "male").toLowerCase());
            fd.append("email", row.email || "");
            fd.append("phone", row.phone || "");
            fd.append("qualification", row.qualification || "");
            fd.append("experience", row.experience || "");
            fd.append("subject", row.subject || "");
            fd.append("salary", row.salary || "");
            fd.append("address", row.address || "");
            fd.append("joiningDate", row.joiningDate || new Date().toISOString().split("T")[0]);
            fd.append("status", (row.status || "active").toLowerCase());
            fd.append("schoolSection", (row.schoolSection || localStorage.getItem("activeSection") || "girls").toLowerCase());
            await createTeacher(fd);
            successCount++;
          } catch (err) {
            console.error("Failed to create teacher from CSV row:", row, err);
            toast.error(`Row "${row.firstName} ${row.lastName}": ${err.message}`);
            failCount++;
          }
        }
        toast.dismiss(loadingToastId);
        if (successCount > 0) {
          toast.success(`${successCount} teachers uploaded successfully!`);
          fetchTeachers();
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

  // ─── Modal handlers ───────────────────────────────────────────
  const openModal = (teacher, mode) => { setSelectedTeacher(teacher); setModalMode(mode); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedTeacher(null); };

  const handleSaveTeacher = (updatedData) => {
    setTeachers((prev) => prev.map((t) => (t._id === updatedData._id ? updatedData : t)));
  };

  const handleDeleteClick = (teacher) => setDeleteModal({ open: true, teacher });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.teacher) return;
    setIsDeleting(true);
    try {
      await deleteTeacher(deleteModal.teacher._id);
      setTeachers((prev) => prev.filter((t) => t._id !== deleteModal.teacher._id));
      toast.success("Teacher deleted successfully!");
      setDeleteModal({ open: false, teacher: null });
    } catch (err) {
      toast.error(err.message || "Failed to delete teacher");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Unique subjects for filter dropdown ──────────────────────
  const uniqueSubjects = [...new Set(teachers.map((t) => t.subject).filter(Boolean))];

  const columns = [
    {
      name: "Photo",
      cell: (row) => <Avatar src={getProfileImageUrl(row.profileImage)} name={row.fullName || row.name} />,
      width: "80px",
    },
    { name: "Name", selector: (row) => row.fullName || row.name || "", sortable: true, grow: 2, minWidth: "150px" },
    { name: "Subject", selector: (row) => row.subject || "—", sortable: true, minWidth: "110px" },
    { name: "Phone", selector: (row) => row.phone || "—", sortable: true, minWidth: "120px" },
    { name: "Email", selector: (row) => row.email || "—", sortable: true, grow: 2, minWidth: "180px" },
    { name: "Qualification", selector: (row) => row.qualification || "—", sortable: true, minWidth: "130px" },
    { name: "Experience", selector: (row) => row.experience ? `${row.experience} yrs` : "—", sortable: true, minWidth: "100px" },
    { name: "Joining Date", selector: (row) => row.joiningDate ? row.joiningDate.split("T")[0] : "—", sortable: true, minWidth: "120px" },
    { name: "Status", cell: (row) => <StatusBadge status={row.status} />, sortable: true, minWidth: "100px" },
    {
      name: "Actions",
      cell: (row) => (
        <ActionButtons row={row} onView={() => openModal(row, "view")} onEdit={() => openModal(row, "edit")} onDelete={() => handleDeleteClick(row)} />
      ),
      width: "130px",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Teachers" value={totalTeachers} bgColor="bg-indigo-100" iconColor="text-indigo-600"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatsCard label="Active Teachers" value={activeTeachers} bgColor="bg-emerald-100" iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="New This Month" value={newThisMonth} bgColor="bg-blue-100" iconColor="text-blue-600"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Selected Rows" value={selectedRows.length} bgColor="bg-purple-100" iconColor="text-purple-600"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {fetchError}
          <button onClick={fetchTeachers} className="ml-auto text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" placeholder="Search by name, email, phone..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="file" accept=".csv" ref={csvFileInputRef} className="hidden" onChange={handleUploadCSV} />
            <button type="button" onClick={() => csvFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition">Upload CSV</button>
            <button type="button" onClick={handleBackupData} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition">Backup Data</button>
            <button onClick={exportExcel} title="Export Excel" className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition"><FaFileExcel className="text-green-600" /></button>
            <button onClick={exportPDF} title="Export PDF" className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition"><FaFilePdf className="text-red-600" /></button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredTeachers}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30]}
            selectableRows
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            responsive
            customStyles={customStyles}
            progressComponent={<div className="p-10 text-center text-slate-500 text-sm">Loading teachers...</div>}
            noDataComponent={<div className="p-10 text-center text-slate-500 text-sm">No teachers found</div>}
            highlightOnHover
            pointerOnHover
          />
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-md border border-slate-100 text-sm animate-pulse">Loading teachers...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white rounded-md border border-slate-100 text-sm">No teachers found</div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id || teacher._id} className="bg-white p-3 border border-slate-100 shadow-sm flex flex-col gap-2 rounded-md">
              <div className="flex items-center gap-2">
                <Avatar src={getProfileImageUrl(teacher.profileImage)} name={teacher.fullName || teacher.name} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{teacher.fullName || teacher.name}</h3>
                  <p className="text-xs text-slate-500">{teacher.subject || "No Subject"} • <span className="capitalize">{teacher.status || "—"}</span></p>
                </div>
                <ActionButtons
                  row={teacher}
                  onView={() => openModal(teacher, "view")}
                  onEdit={() => openModal(teacher, "edit")}
                  onDelete={() => handleDeleteClick(teacher)}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
                <div><span className="text-slate-400">Qual:</span> <strong className="text-slate-700 font-medium">{teacher.qualification || "—"}</strong></div>
                <div><span className="text-slate-400">Exp:</span> <strong className="text-slate-700 font-medium">{teacher.experience ? `${teacher.experience} yrs` : "—"}</strong></div>
                <div className="col-span-2"><span className="text-slate-400">Email:</span> <strong className="text-slate-700 font-medium truncate block">{teacher.email || "—"}</strong></div>
                <div className="col-span-2"><span className="text-slate-400">Phone:</span> <strong className="text-slate-700 font-medium">{teacher.phone || "—"}</strong></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / View Modal */}
      <TeacherFormModal isOpen={modalOpen} onClose={closeModal} teacher={selectedTeacher} mode={modalMode} onSave={handleSaveTeacher} />

      {/* Delete Confirm Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        teacher={deleteModal.teacher}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, teacher: null })}
        isDeleting={isDeleting}
      />
    </div>
  );
}