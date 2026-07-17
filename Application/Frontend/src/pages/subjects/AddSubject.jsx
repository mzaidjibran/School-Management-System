import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaSave, FaPlus, FaUndo, FaTimes } from "react-icons/fa";
import { addSubject } from "../../api/Subject_Api.js";
import { getAllClasses } from "../../Api/Class_Api.js";
import { getAllTeachers } from "../../Api/Teacher_Api.js";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const SUBJECT_TYPES = ["theory", "practical", "both"];
const STATUS_OPTS = ["active", "inactive"];

const EMPTY_FORM = {
  name: "",
  code: "",
  class: [],
  teacher: "",
  type: "theory",
  creditHours: "",
  description: "",
  status: "active",
};

// ✅ Component ke BAHAR define kiya - focus issue fix
const inputCls = (field, errors = {}) =>
  `w-full px-3 py-2.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${
    errors[field] ? "border-rose-400 focus:ring-rose-300" : "border-slate-200"
  }`;

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
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-left ${error ? "border-rose-400" : "border-slate-200"}`}
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

// ✅ Component ke BAHAR define kiya - focus issue fix
const Field = ({ label, name, type = "text", required, value, onChange, errors = {} }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={inputCls(name, errors)}
    />
    {errors[name] && <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>}
  </div>
);

// ✅ Component ke BAHAR define kiya - focus issue fix
const SelectField = ({
  label,
  name,
  options,
  required,
  value,
  onChange,
  errors = {},
  valueKey = "value",
  labelKey = "label",
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`${inputCls(name, errors)} appearance-none pr-8`}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o[valueKey] ?? o} value={o[valueKey] ?? o}>
            {o[labelKey] ?? o}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    {errors[name] && <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>}
  </div>
);

export default function AddSubject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveAnother, setSaveAnother] = useState(false);

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        // Use API helper functions — they send auth token + x-section + x-branch-id headers
        const [classRes, teacherRes] = await Promise.all([
          getAllClasses(),
          getAllTeachers(),
        ]);
        setClasses(classRes.data || []);
        setTeachers(teacherRes.data || []);
      } catch (err) {
        toast.error("Classes/Teachers load karne mein error: " + err.message);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);



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
    if (!form.name.trim()) e.name = "Subject name is required";
    if (!form.code.trim()) e.code = "Subject code is required";
    if (!form.class || form.class.length === 0) e.class = "At least one class is required";
    if (!form.teacher) e.teacher = "Teacher is required";
    if (!form.type) e.type = "Subject type is required";
    if (!form.creditHours) e.creditHours = "Credit hours required";
    else if (isNaN(form.creditHours) || +form.creditHours <= 0)
      e.creditHours = "Must be a positive number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSaveAnother(addAnother);

    try {
      await addSubject({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        class: form.class,
        teacher: form.teacher || undefined,
        type: form.type,
        creditHours: Number(form.creditHours),
        description: form.description.trim() || undefined,
        status: form.status,
      });

      toast.success(addAnother ? "Subject saved! Add another." : "Subject created successfully!");
      if (addAnother) resetForm();
      else navigate("/subjects");
    } catch (err) {
      toast.error(err.message || "An error occurred while creating subject.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate("/")}>
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span
            className="hover:text-indigo-600 cursor-pointer"
            onClick={() => navigate("/subjects")}
          >
            Subjects
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Add Subject</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
            <FaBook className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add Subject</h1>
            <p className="text-slate-500 text-sm">Create a new subject with all details</p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Subject Information</h2>
          </div>

          {loadingDropdowns ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              Loading classes and teachers...
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field
                  label="Subject Name"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  errors={errors}
                />

                <Field
                  label="Subject Code"
                  name="code"
                  required
                  value={form.code}
                  onChange={handleChange}
                  errors={errors}
                />

                {/* Classes dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Class(es) <span className="text-rose-500">*</span>
                    <span className="text-slate-400 font-normal ml-1">(select one or more)</span>
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
                  {errors.class && (
                    <p className="text-rose-500 text-xs mt-1">{errors.class}</p>
                  )}
                </div>

                {/* Teacher dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Assigned Teacher <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="teacher"
                      value={form.teacher}
                      onChange={handleChange}
                      className={`${inputCls("teacher", errors)} appearance-none pr-8`}
                    >
                      <option value="">Select Teacher…</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim()}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                  </div>
                  {errors.teacher && (
                    <p className="text-rose-500 text-xs mt-1">{errors.teacher}</p>
                  )}
                </div>

                <SelectField
                  label="Subject Type"
                  name="type"
                  options={SUBJECT_TYPES}
                  required
                  value={form.type}
                  onChange={handleChange}
                  errors={errors}
                />

                <Field
                  label="Credit Hours"
                  name="creditHours"
                  type="number"
                  required
                  value={form.creditHours}
                  onChange={handleChange}
                  errors={errors}
                />

                <SelectField
                  label="Status"
                  name="status"
                  options={STATUS_OPTS}
                  value={form.status}
                  onChange={handleChange}
                  errors={errors}
                />

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Optional description…"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-colors font-medium"
                >
                  <FaSave className="text-xs" />
                  {loading && !saveAnother ? "Saving…" : "Save Subject"}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="px-5 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-50 transition-colors font-medium"
                >
                  <FaPlus className="text-xs" />
                  {loading && saveAnother ? "Saving…" : "Save & Add Another"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <FaUndo className="text-xs" /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/subjects")}
                  className="px-5 py-2 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors"
                >
                  <FaTimes className="text-xs" /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>


    </div>
  );
}