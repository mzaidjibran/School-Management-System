import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaSave, FaPlus, FaUndo, FaTimes } from "react-icons/fa";

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

const EMPTY_FORM = {
  subjectName: "",
  subjectCode: "",
  class: "",
  assignedTeacher: "",
  subjectType: "",
  weeklyLectures: "",
  passingMarks: "",
  totalMarks: "",
  description: "",
  status: "Active",
};

export default function AddSubject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [saveAnother, setSaveAnother] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.subjectName.trim()) e.subjectName = "Subject name is required";
    if (!form.subjectCode.trim()) e.subjectCode = "Subject code is required";
    if (!form.class) e.class = "Class is required";
    if (!form.assignedTeacher) e.assignedTeacher = "Teacher is required";
    if (!form.subjectType) e.subjectType = "Subject type is required";
    if (!form.weeklyLectures) e.weeklyLectures = "Weekly lectures required";
    else if (isNaN(form.weeklyLectures) || +form.weeklyLectures <= 0)
      e.weeklyLectures = "Must be a positive number";
    if (!form.passingMarks) e.passingMarks = "Passing marks required";
    else if (isNaN(form.passingMarks) || +form.passingMarks < 0)
      e.passingMarks = "Must be positive";
    if (!form.totalMarks) e.totalMarks = "Total marks required";
    else if (isNaN(form.totalMarks) || +form.totalMarks <= 0)
      e.totalMarks = "Must be greater than 0";
    if (
      form.passingMarks &&
      form.totalMarks &&
      +form.passingMarks > +form.totalMarks
    )
      e.passingMarks = "Cannot exceed total marks";
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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    showToast(
      addAnother
        ? "Subject saved! Add another."
        : "Subject created successfully!",
    );
    if (addAnother) resetForm();
    else navigate("/subjects");
  };

  // Shared styles
  const inputCls = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors[field] ? "border-rose-400 focus:ring-rose-300" : "border-slate-200"}`;

  const Field = ({ label, name, type = "text", required }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        className={inputCls(name)}
      />
      {errors[name] && (
        <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const Select = ({ label, name, options, required }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          className={`${inputCls(name)} appearance-none pr-8`}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
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
      {errors[name] && (
        <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span
            className="hover:text-indigo-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
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

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <FaBook className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add Subject</h1>
            <p className="text-slate-500 text-sm">
              Create a new subject with all details
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">
              Subject Information
            </h2>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Subject Name" name="subjectName" required />
              <Field label="Subject Code" name="subjectCode" required />
              <Select label="Class" name="class" options={CLASSES} required />
              <Select
                label="Assigned Teacher"
                name="assignedTeacher"
                options={TEACHERS}
                required
              />
              <Select
                label="Subject Type"
                name="subjectType"
                options={SUBJECT_TYPES}
                required
              />
              <Field
                label="Weekly Lectures"
                name="weeklyLectures"
                type="number"
                required
              />
              <Field
                label="Passing Marks"
                name="passingMarks"
                type="number"
                required
              />
              <Field
                label="Total Marks"
                name="totalMarks"
                type="number"
                required
              />
              <Select label="Status" name="status" options={STATUS_OPTS} />
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
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-colors font-medium"
              >
                <FaSave className="text-xs" />
                {loading && !saveAnother ? "Saving…" : "Save Subject"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-5 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-50 transition-colors font-medium"
              >
                <FaPlus className="text-xs" />
                {loading && saveAnother ? "Saving…" : "Save & Add Another"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 text-sm border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors"
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
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaSave className="text-xs" /> {toast}
        </div>
      )}
    </div>
  );
}
