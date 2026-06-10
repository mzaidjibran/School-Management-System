import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

const generateTeachers = () => {
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Urdu",
    "Islamiyat",
    "Computer Science",
  ];
  const names = [
    "Ali Raza",
    "Sana Khan",
    "Imran Ali",
    "Fatima Ahmed",
    "Usman Chaudhry",
    "Ayesha Siddiqui",
    "Hamza Ali",
    "Zara Tariq",
    "Bilal Aslam",
    "Hina Naeem",
  ];
  const statuses = [
    "Active",
    "Active",
    "Active",
    "On Leave",
    "Active",
    "Inactive",
    "Active",
    "Active",
    "On Leave",
    "Active",
  ];
  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  return Array.from({ length: 35 }, (_, i) => {
    const name = names[i % names.length] + (Math.floor(i / names.length) + 1);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const joiningDate = new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    )
      .toISOString()
      .split("T")[0];
    const isNewThisMonth =
      new Date(joiningDate).getMonth() === new Date().getMonth() &&
      new Date(joiningDate).getFullYear() === new Date().getFullYear();
    return {
      id: i + 1,
      name,
      subject,
      phone: `03${Math.floor(Math.random() * 9) + 1}${Math.floor(
        Math.random() * 10000000,
      )
        .toString()
        .padStart(7, "0")}`,
      email: `${name.toLowerCase().replace(/\s/g, ".")}@pphs.edu.pk`,
      qualification: ["M.Sc", "M.A", "B.Ed", "M.Ed", "Ph.D"][
        Math.floor(Math.random() * 5)
      ],
      experience: `${Math.floor(Math.random() * 20) + 1} years`,
      joiningDate,
      isNewThisMonth,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
      address: `${Math.floor(Math.random() * 500) + 1}, ${["Main St", "College Rd", "Gulberg", "Defence", "Johar Town"][Math.floor(Math.random() * 5)]}, Lahore`,
      gender: Math.random() > 0.5 ? "male" : "female",
      picture: `https://ui-avatars.com/api/?background=${Math.random() > 0.5 ? "3b82f6" : "8b5cf6"}&color=fff&name=${name.replace(" ", "+")}`,
      cnic: `${Math.floor(Math.random() * 100000) + 10000}-${Math.floor(Math.random() * 10000000) + 1000000}-${Math.floor(Math.random() * 9) + 1}`,
      maritalStatus: ["Single", "Married", "Divorced"][
        Math.floor(Math.random() * 3)
      ],
      alternatePhone: `03${Math.floor(Math.random() * 9) + 1}${Math.floor(
        Math.random() * 10000000,
      )
        .toString()
        .padStart(7, "0")}`,
      city: ["Lahore", "Karachi", "Islamabad", "Rawalpindi"][
        Math.floor(Math.random() * 4)
      ],
      specialization: ["Algebra", "Mechanics", "Organic", "Literature"][
        Math.floor(Math.random() * 4)
      ],
      university: ["PU", "UET", "NUST", "LUMS"][Math.floor(Math.random() * 4)],
      passingYear: (2015 + Math.floor(Math.random() * 8)).toString(),
      employeeId: `EMP${1000 + i}`,
      salary: (50000 + Math.floor(Math.random() * 100000)).toString(),
      employmentStatus: ["Permanent", "Contract", "Probation"][
        Math.floor(Math.random() * 3)
      ],
      notes: "Dedicated teacher",
      emergencyName: "Family Member",
      emergencyPhone: `03${Math.floor(Math.random() * 9) + 1}${Math.floor(
        Math.random() * 10000000,
      )
        .toString()
        .padStart(7, "0")}`,
    };
  });
};

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
  headCells: {
    style: {
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.875rem",
      paddingBottom: "0.875rem",
    },
  },
  rows: {
    style: {
      backgroundColor: "transparent",
      minHeight: "72px",
      "&:hover": { backgroundColor: "#f1f5f9" },
    },
  },
  cells: {
    style: {
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.875rem",
      paddingBottom: "0.875rem",
      fontSize: "0.875rem",
    },
  },
};

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700",
    "On Leave": "bg-amber-100 text-amber-700",
    Inactive: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};
const Avatar = ({ src, name }) => (
  <img
    src={src}
    alt={name}
    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
  />
);
const ActionButtons = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => onView(row)}
      className="text-indigo-600 hover:text-indigo-800 transition"
      title="View"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>
    <button
      onClick={() => onEdit(row)}
      className="text-amber-600 hover:text-amber-800 transition"
      title="Edit"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>
    <button
      onClick={() => onDelete(row)}
      className="text-red-600 hover:text-red-800 transition"
      title="Delete"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
);
const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <svg
          className={`w-5 h-5 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
    </div>
  </div>
);

// ==================== TEACHER FORM MODAL ====================
const TeacherFormModal = ({ isOpen, onClose, teacher, mode, onSave }) => {
  const emptyForm = {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    cnic: "",
    bloodGroup: "",
    maritalStatus: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    subject: "",
    qualification: "",
    specialization: "",
    university: "",
    passingYear: "",
    employeeId: "",
    joiningDate: "",
    experience: "",
    salary: "",
    employmentStatus: "",
    notes: "",
    emergencyName: "",
    emergencyPhone: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);
  const isViewOnly = mode === "view";

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("personal");
    if (teacher) {
      setFormData({
        fullName: teacher.name || "",
        gender: teacher.gender || "",
        dateOfBirth: teacher.dateOfBirth || "",
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
        joiningDate: teacher.joiningDate || "",
        experience: teacher.experience || "",
        salary: teacher.salary || "",
        employmentStatus: teacher.employmentStatus || "",
        notes: teacher.notes || "",
        emergencyName: teacher.emergencyName || "",
        emergencyPhone: teacher.emergencyPhone || "",
      });
      setImagePreview(teacher.picture || null);
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
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setImageError("Only JPG or PNG allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Max size 2MB.");
      return;
    }
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
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    onSave(
      { id: teacher?.id, ...formData, picture: imagePreview },
      profileImage,
    );
    onClose();
  };

  // Floating label input — date fields ka mm/dd/yyyy placeholder hidden rakha jab tak value ya focus na ho
  const FI = ({ label, name, type = "text", required, colSpan }) => {
    const isDate = type === "date";
    const hasValue = !!formData[name];

    return (
      <div className={colSpan ? "col-span-2" : ""}>
        <div className="relative">
          <input
            type={type}
            name={name}
            id={name}
            value={formData[name] || ""}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder=" "
            style={isDate && !hasValue ? { color: "transparent" } : {}}
            onFocus={(e) => {
              if (isDate) e.target.style.color = "inherit";
            }}
            onBlur={(e) => {
              if (isDate && !formData[name])
                e.target.style.color = "transparent";
            }}
            className={`peer w-full px-3 pt-5 pb-1.5 border rounded-lg bg-white text-slate-800 outline-none transition-all text-sm
              ${errors[name] ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
              focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
          />
          <label
            htmlFor={name}
            className={`absolute left-3 pointer-events-none transition-all duration-150
              ${
                formData[name]
                  ? "top-1 text-[10px] text-indigo-500"
                  : "top-3.5 text-sm text-slate-400"
              }
              peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
          >
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        </div>
        {errors[name] && (
          <p className="text-red-400 text-[11px] mt-0.5 ml-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  // Floating label select
  const FS = ({ label, name, options, required }) => {
    if (isViewOnly) {
      return (
        <div className="relative">
          <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 min-h-[52px]">
            {formData[name] || "—"}
          </div>
          <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">
            {label}
          </label>
        </div>
      );
    }
    return (
      <div className="relative">
        <select
          name={name}
          id={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className={`peer w-full px-3 pt-5 pb-1.5 border rounded-lg bg-white text-slate-800 outline-none transition-all appearance-none text-sm
            ${errors[name] ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}
            focus:ring-2`}
        >
          <option value=""></option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label
          htmlFor={name}
          className={`absolute left-3 pointer-events-none transition-all duration-150
            ${
              formData[name]
                ? "top-1 text-[10px] text-indigo-500"
                : "top-3.5 text-sm text-slate-400"
            }
            peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <svg
          className="absolute right-2.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none"
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
        {errors[name] && (
          <p className="text-red-400 text-[11px] mt-0.5 ml-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  const statusColors = {
    Active: "bg-emerald-100 text-emerald-700",
    "On Leave": "bg-amber-100 text-amber-700",
    Inactive: "bg-red-100 text-red-700",
  };
  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "academic", label: "Academic" },
    { id: "employment", label: "Employment" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {mode === "edit"
              ? "Edit Teacher"
              : mode === "add"
                ? "Add Teacher"
                : "Teacher Profile"}
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

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="w-48 flex-shrink-0 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-6 px-4 gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-slate-200">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <svg
                      className="w-9 h-9"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {!isViewOnly && (
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer shadow transition">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>
              )}
            </div>
            {imageError && (
              <p className="text-red-400 text-[10px] text-center">
                {imageError}
              </p>
            )}

            {/* Name + status */}
            <div className="text-center w-full">
              <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                {formData.fullName || "—"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {formData.subject || "No subject"}
              </p>
              {teacher?.status && (
                <span
                  className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColors[teacher.status]}`}
                >
                  {teacher.status}
                </span>
              )}
            </div>

            {/* Quick info */}
            <div className="w-full space-y-3 mt-1">
              {[
                {
                  icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2",
                  label: "ID",
                  value: formData.employeeId || "—",
                },
                {
                  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  label: "Joined",
                  value: formData.joiningDate || "—",
                },
                {
                  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                  label: "Phone",
                  value: formData.phone || "—",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 leading-none">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-600 font-medium break-all">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Tabbed Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-5 pt-3 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition
                    ${activeTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <form onSubmit={handleSubmit} id="teacher-form">
                {activeTab === "personal" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        Personal
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <FI label="Full Name" name="fullName" required />
                        <FS
                          label="Gender"
                          name="gender"
                          options={["Male", "Female", "Other"]}
                          required
                        />
                        <FI
                          label="Date of Birth"
                          name="dateOfBirth"
                          type="date"
                        />
                        <FI label="CNIC" name="cnic" />
                        <FS
                          label="Blood Group"
                          name="bloodGroup"
                          options={[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "O+",
                            "O-",
                            "AB+",
                            "AB-",
                          ]}
                        />
                        <FS
                          label="Marital Status"
                          name="maritalStatus"
                          options={["Single", "Married", "Divorced", "Widowed"]}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        Contact
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <FI label="Phone" name="phone" type="tel" required />
                        <FI
                          label="Alternate Phone"
                          name="alternatePhone"
                          type="tel"
                        />
                        <FI label="Email" name="email" type="email" required />
                        <FI label="City" name="city" />
                        <FI label="Address" name="address" colSpan />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "academic" && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                      Academic
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <FI label="Subject" name="subject" required />
                      <FI label="Qualification" name="qualification" required />
                      <FI label="Specialization" name="specialization" />
                      <FI label="University" name="university" />
                      <FI
                        label="Passing Year"
                        name="passingYear"
                        type="number"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "employment" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        Employment
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <FI label="Employee ID" name="employeeId" required />
                        <FI
                          label="Joining Date"
                          name="joiningDate"
                          type="date"
                          required
                        />
                        <FI
                          label="Experience (years)"
                          name="experience"
                          type="number"
                        />
                        <FI label="Salary (PKR)" name="salary" type="number" />
                        <FS
                          label="Employment Status"
                          name="employmentStatus"
                          options={[
                            "Permanent",
                            "Contract",
                            "Probation",
                            "Part-time",
                          ]}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                        Emergency Contact
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <FI label="Contact Name" name="emergencyName" />
                        <FI
                          label="Contact Phone"
                          name="emergencyPhone"
                          type="tel"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Notes
                      </p>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        rows={3}
                        placeholder="Any additional notes..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2.5">
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
                    form="teacher-form"
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
                    {isSaving
                      ? "Saving..."
                      : mode === "edit"
                        ? "Update Teacher"
                        : "Add Teacher"}
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
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function TeacherDataTable() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = generateTeachers();
      setTeachers(data);
      setFilteredTeachers(data);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let result = teachers;
    if (searchTerm)
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.phone.includes(searchTerm),
      );
    if (subjectFilter)
      result = result.filter((t) => t.subject === subjectFilter);
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    setFilteredTeachers(result);
  }, [searchTerm, subjectFilter, statusFilter, teachers]);

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "Active").length;
  const newThisMonth = teachers.filter((t) => t.isNewThisMonth).length;

  const exportCSV = () => {
    const headers = [
      "Name",
      "Subject",
      "Phone",
      "Email",
      "Qualification",
      "Experience",
      "Joining Date",
      "Status",
    ];
    const rows = filteredTeachers.map((t) => [
      t.name,
      t.subject,
      t.phone,
      t.email,
      t.qualification,
      t.experience,
      t.joiningDate,
      t.status,
    ]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
        type: "text/csv;charset=utf-8;",
      }),
      "teachers.csv",
    );
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTeachers.map((t) => ({
        Name: t.name,
        Subject: t.subject,
        Phone: t.phone,
        Email: t.email,
        Qualification: t.qualification,
        Experience: t.experience,
        "Joining Date": t.joiningDate,
        Status: t.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teachers");
    XLSX.writeFile(wb, "teachers.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Teachers List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Name",
          "Subject",
          "Phone",
          "Email",
          "Qualification",
          "Experience",
          "Joining Date",
          "Status",
        ],
      ],
      body: filteredTeachers.map((t) => [
        t.name,
        t.subject,
        t.phone,
        t.email,
        t.qualification,
        t.experience,
        t.joiningDate,
        t.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("teachers.pdf");
  };

  const openModal = (teacher, mode) => {
    setSelectedTeacher(teacher);
    setModalMode(mode);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeacher(null);
  };
  const handleSaveTeacher = (data) => {
    setTeachers((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    closeModal();
  };
  const handleDeleteTeacher = (teacher) => {
    if (window.confirm(`Delete ${teacher.name}?`))
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
  };

  const columns = [
    {
      name: "Photo",
      selector: (row) => row.picture,
      cell: (row) => <Avatar src={row.picture} name={row.name} />,
      width: "80px",
    },
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 2 },
    { name: "Subject", selector: (row) => row.subject, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true, grow: 2 },
    {
      name: "Qualification",
      selector: (row) => row.qualification,
      sortable: true,
    },
    { name: "Experience", selector: (row) => row.experience, sortable: true },
    {
      name: "Joining Date",
      selector: (row) => row.joiningDate,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <ActionButtons
          row={row}
          onView={() => openModal(row, "view")}
          onEdit={() => openModal(row, "edit")}
          onDelete={() => handleDeleteTeacher(row)}
        />
      ),
      width: "130px",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatsCard
          label="Total Teachers"
          value={totalTeachers}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <StatsCard
          label="Active Teachers"
          value={activeTeachers}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="New This Month"
          value={newThisMonth}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Selected Rows"
          value={selectedRows.length}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {[...new Set(teachers.map((t) => t.subject))].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              <FaFileCsv className="text-slate-600" />
            </button>
            <button
              onClick={exportExcel}
              title="Export Excel"
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              <FaFileExcel className="text-green-600" />
            </button>
            <button
              onClick={exportPDF}
              title="Export PDF"
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              <FaFilePdf className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredTeachers}
          progressPending={loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30]}
          selectableRows
          onSelectedRowsChange={({ selectedRows }) =>
            setSelectedRows(selectedRows)
          }
          responsive
          customStyles={customStyles}
          progressComponent={
            <div className="p-10 text-center text-slate-500 text-sm">
              Loading teachers...
            </div>
          }
          noDataComponent={
            <div className="p-10 text-center text-slate-500 text-sm">
              No teachers found
            </div>
          }
          highlightOnHover
          pointerOnHover
        />
      </div>

      <TeacherFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        teacher={selectedTeacher}
        mode={modalMode}
        onSave={handleSaveTeacher}
      />
    </div>
  );
}
