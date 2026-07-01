import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { createClass } from "../../api/Class_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import { getAllTeachers } from "../../api/Teacher_Api.js"; // path apne folder structure ke hisaab se adjust kar lein
import toast from "react-hot-toast";

// ---------- Floating Input ----------
const FloatingInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  error,
}) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white text-slate-800 outline-none transition-all text-sm
        ${error ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}
        focus:ring-2`}
    />
    <label
      className={`absolute left-4 pointer-events-none transition-all duration-200 text-slate-400
        ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm"}
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
    >
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

// ---------- Floating Select ----------
// options ab dono support karta hai: array of strings (Shift, Status)
// ya array of {value, label} objects (Class Teacher dropdown)
const FloatingSelect = ({
  label,
  name,
  options,
  value,
  onChange,
  required,
  error,
}) => (
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
      {options.map((opt) => {
        const optValue = typeof opt === "object" ? opt.value : opt;
        const optLabel = typeof opt === "object" ? opt.label : opt;
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
      {label} {required && <span className="text-rose-500">*</span>}
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

export default function AddClass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [savingAnother, setSavingAnother] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Teacher list fetch karo dropdown ke liye
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

  const teacherOptions = teachers
    .map((t) => ({
      value: t._id,
      label: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Model ke hisaab se sirf yeh teen fields actually required hain
  const requiredFields = ["className", "section", "academicYear"];
  const filledCount = requiredFields.filter((f) => form[f]?.trim()).length;
  const progressPercent = (filledCount / requiredFields.length) * 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.className.trim()) newErrors.className = "Class name is required";
    if (!form.section.trim()) newErrors.section = "Section is required";
    if (!form.academicYear.trim())
      newErrors.academicYear = "Academic year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
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
    setErrors({});
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSavingAnother(addAnother);
    setApiError("");

    const payload = {
      name: form.className.trim(),
      section: form.section.trim(),
      academicYear: form.academicYear.trim(),
      room: form.roomNumber.trim() || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      shift: form.shift,
      description: form.description.trim(),
      isActive: form.status === "Active",
    };
    if (form.classTeacher) payload.classTeacher = form.classTeacher;

    try {
      await createClass(payload);
      setLoading(false);
      toast.success("Class created successfully!");
      if (addAnother) resetForm();
      else navigate(-1);
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Class create nahi ho saki");
      setApiError(error.message || "Class create nahi ho saki");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span
            className="hover:text-indigo-600 cursor-pointer"
            onClick={() => navigate("/schools")}
          >
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span
            className="hover:text-indigo-600 cursor-pointer"
            onClick={() => navigate("/classes")}
          >
            Class Management
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Add Class</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <FaBook className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add New Class</h1>
            <p className="text-slate-500 text-sm">
              Create a new class and assign teacher, room, and shift
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">
              Form completion
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FloatingInput
                label="Class Name"
                name="className"
                value={form.className}
                onChange={handleChange}
                required
                error={errors.className}
              />
              <FloatingInput
                label="Section"
                name="section"
                value={form.section}
                onChange={handleChange}
                required
                error={errors.section}
              />
              <FloatingInput
                label="Academic Year"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                required
                error={errors.academicYear}
              />
              <FloatingSelect
                label="Class Teacher"
                name="classTeacher"
                options={teacherOptions}
                value={form.classTeacher}
                onChange={handleChange}
              />
              <FloatingInput
                label="Room Number"
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
              />
              <FloatingInput
                label="Capacity"
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
              />
              <FloatingSelect
                label="Shift"
                name="shift"
                options={["Morning", "Evening"]}
                value={form.shift}
                onChange={handleChange}
              />
              <FloatingSelect
                label="Status"
                name="status"
                options={["Active", "Inactive"]}
                value={form.status}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional information about this class..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading && !savingAnother && (
                  <svg
                    className="animate-spin h-4 w-4"
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
                {loading && !savingAnother ? "Saving..." : "Save Class"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-6 py-2.5 text-sm border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition disabled:opacity-50"
              >
                {loading && savingAnother ? "Saving..." : "Save & Add Another"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 text-sm border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {success && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <FaCheckCircle className="w-5 h-5" />
            <span>Class saved successfully!</span>
          </div>
        )}

        {apiError && (
          <div className="fixed bottom-6 right-6 bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <FaExclamationCircle className="w-5 h-5" />
            <span>{apiError}</span>
          </div>
        )}
      </div>
    </div>
  );
}