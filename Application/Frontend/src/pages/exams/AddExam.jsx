import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaSave, FaPlus, FaUndo, FaTimes } from "react-icons/fa";

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
      className={`peer w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-slate-800 outline-none transition-all
        ${error ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"}`}
      placeholder=" "
    />
    <label
      className={`absolute left-3 bg-white px-1 text-slate-400 transition-all duration-200 pointer-events-none
      peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm
      peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-500
      ${value ? "-top-2 text-xs text-indigo-500" : "top-2.5 text-sm"}`}
    >
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

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
      className={`peer w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-slate-800 outline-none transition-all appearance-none
        ${error ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"}`}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <label
      className={`absolute left-3 bg-white px-1 text-slate-400 transition-all duration-200 pointer-events-none
      ${value ? "-top-2 text-xs text-indigo-500" : "top-2.5 text-sm"}`}
    >
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    <svg
      className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"
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

export default function AddExam() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    examName: "",
    examType: "",
    class: "",
    subject: "",
    startDate: "",
    endDate: "",
    totalMarks: "",
    passingMarks: "",
    duration: "",
    examHall: "",
    instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveAnother, setSaveAnother] = useState(false);

  const examTypes = ["Theory", "Practical", "Both"];
  const classes = ["9th", "10th", "11th", "12th"];
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.examName.trim()) newErrors.examName = "Required";
    if (!form.examType) newErrors.examType = "Required";
    if (!form.class) newErrors.class = "Required";
    if (!form.subject) newErrors.subject = "Required";
    if (!form.startDate) newErrors.startDate = "Required";
    if (!form.endDate) newErrors.endDate = "Required";
    if (!form.totalMarks) newErrors.totalMarks = "Required";
    if (!form.passingMarks) newErrors.passingMarks = "Required";
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      newErrors.endDate = "Must be after start date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      examName: "",
      examType: "",
      class: "",
      subject: "",
      startDate: "",
      endDate: "",
      totalMarks: "",
      passingMarks: "",
      duration: "",
      examHall: "",
      instructions: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSaveAnother(addAnother);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    if (addAnother) resetForm();
    else navigate("/exams");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span
            className="hover:text-indigo-500 cursor-pointer"
            onClick={() => navigate("/exams")}
          >
            Dashboard
          </span>
          <span>/</span>
          <span
            className="hover:text-indigo-500 cursor-pointer"
            onClick={() => navigate("/exams")}
          >
            Exam Management
          </span>
          <span>/</span>
          <span className="text-indigo-600">Add Exam</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <FaBook className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Add New Exam</h1>
            <p className="text-xs text-slate-500">
              Create exam schedule and configure details
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-5">
            {/* Section: Basic Info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Basic Information
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput
                label="Exam Name"
                name="examName"
                value={form.examName}
                onChange={handleChange}
                required
                error={errors.examName}
              />
              <FloatingSelect
                label="Exam Type"
                name="examType"
                options={examTypes}
                value={form.examType}
                onChange={handleChange}
                required
                error={errors.examType}
              />
              <FloatingSelect
                label="Class"
                name="class"
                options={classes}
                value={form.class}
                onChange={handleChange}
                required
                error={errors.class}
              />
              <FloatingSelect
                label="Subject"
                name="subject"
                options={subjects}
                value={form.subject}
                onChange={handleChange}
                required
                error={errors.subject}
              />
            </div>

            {/* Section: Schedule */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Schedule
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput
                label="Start Date"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                error={errors.startDate}
              />
              <FloatingInput
                label="End Date"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                error={errors.endDate}
              />
              <FloatingInput
                label="Duration (hours)"
                name="duration"
                value={form.duration}
                onChange={handleChange}
              />
              <FloatingInput
                label="Exam Hall"
                name="examHall"
                value={form.examHall}
                onChange={handleChange}
              />
            </div>

            {/* Section: Marks */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Marks
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput
                label="Total Marks"
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                required
                error={errors.totalMarks}
              />
              <FloatingInput
                label="Passing Marks"
                type="number"
                name="passingMarks"
                value={form.passingMarks}
                onChange={handleChange}
                required
                error={errors.passingMarks}
              />
            </div>

            {/* Instructions */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none"
                placeholder="Any special instructions for students"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <FaSave className="w-3 h-3" />{" "}
                {loading ? "Saving..." : "Save Exam"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-300 text-indigo-600 text-sm rounded-lg hover:bg-indigo-50 transition"
              >
                <FaPlus className="w-3 h-3" /> Save & Add Another
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition"
              >
                <FaUndo className="w-3 h-3" /> Reset
              </button>
              <button
                type="button"
                onClick={() => navigate("/exams")}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 text-sm transition"
              >
                <FaTimes className="w-3 h-3" /> Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="fixed bottom-5 right-5 bg-emerald-500 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50">
            <FaSave className="w-3.5 h-3.5" />
            {saveAnother
              ? "Saved! Add another exam."
              : "Exam created successfully!"}
          </div>
        )}
      </div>
    </div>
  );
}
