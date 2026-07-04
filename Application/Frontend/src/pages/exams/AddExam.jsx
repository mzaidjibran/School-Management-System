import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaSave, FaPlus, FaUndo, FaTimes } from "react-icons/fa";
import { createExam } from "../../api/Exam_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";
import toast from "react-hot-toast";

const FloatingInput = ({ label, name, type = "text", value, onChange, required, error }) => (
  <div className="relative">
    <input type={type} name={name} value={value} onChange={onChange}
      className={`peer w-full px-3 py-2.5 text-sm border rounded-md bg-white text-slate-800 outline-none transition-all
        ${error ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"}`}
      placeholder=" " />
    <label className={`absolute left-3 bg-white px-1 text-slate-400 transition-all duration-200 pointer-events-none
      peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-500
      ${value ? "-top-2 text-xs text-indigo-500" : "top-2.5 text-sm"}`}>
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

const FloatingSelect = ({ label, name, options = [], value, onChange, required, error }) => (
  <div className="relative">
    <select name={name} value={value} onChange={onChange}
      className={`peer w-full px-3 py-2.5 text-sm border rounded-md bg-white text-slate-800 outline-none transition-all appearance-none
        ${error ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"}`}>
      <option value=""></option>
      {options.map((opt) => {
        const val = typeof opt === "object" ? opt.value : opt;
        const lbl = typeof opt === "object" ? opt.label : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
    <label className={`absolute left-3 bg-white px-1 text-slate-400 transition-all duration-200 pointer-events-none
      ${value ? "-top-2 text-xs text-indigo-500" : "top-2.5 text-sm"}`}>
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    <svg className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

const EXAM_TYPES = [
  { value: "mid_term", label: "Mid Term" },
  { value: "final_term", label: "Final Term" },
  { value: "unit_test", label: "Unit Test" },
  { value: "practical", label: "Practical" },
  { value: "quiz", label: "Quiz" },
];

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Urdu","Islamiyat","Computer Science","History","Geography","Pak Studies"];

export default function AddExam() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    name: "", examType: "", class: "", subject: "",
    examDate: "", endDate: "", totalMarks: "", passingMarks: "",
    duration: "", venue: "", session: "", instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveAnother, setSaveAnother] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    getAllClasses()
      .then((r) => setClasses(r.data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load classes: " + err.message);
      });
  }, []);

  const classOptions = classes.map((c) => ({ value: c._id, label: `${c.name} — Section ${c.section}` }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name      = "Required";
    if (!form.examType)     e.examType  = "Required";
    if (!form.class)        e.class     = "Required";
    if (!form.subject)      e.subject   = "Required";
    if (!form.examDate)     e.examDate  = "Required";
    if (!form.totalMarks)   e.totalMarks   = "Required";
    if (!form.passingMarks) e.passingMarks = "Required";
    if (form.examDate && form.endDate && form.examDate > form.endDate)
      e.endDate = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({ name:"", examType:"", class:"", subject:"", examDate:"", endDate:"", totalMarks:"", passingMarks:"", duration:"", venue:"", session:"", instructions:"" });
    setErrors({});
    setApiError("");
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSaveAnother(addAnother);
    setApiError("");
    const payload = {
      name: form.name.trim(), examType: form.examType, class: form.class,
      subject: form.subject, examDate: form.examDate,
      endDate: form.endDate || undefined,
      totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks),
      duration: form.duration ? Number(form.duration) : undefined,
      venue: form.venue.trim() || undefined,
      session: form.session.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      status: "scheduled",
    };
    try {
      await createExam(payload);
      setLoading(false);
      toast.success("Exam created successfully!");
      if (addAnother) resetForm();
      else navigate("/exams");
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Exam create nahi ho saka");
      setApiError(err.message || "Exam create nahi ho saka");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span className="hover:text-indigo-500 cursor-pointer" onClick={() => navigate("/exams")}>Dashboard</span>
          <span>/</span>
          <span className="hover:text-indigo-500 cursor-pointer" onClick={() => navigate("/exams")}>Exam Management</span>
          <span>/</span>
          <span className="text-indigo-600">Add Exam</span>
        </nav>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-md"><FaBook className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Add New Exam</h1>
            <p className="text-xs text-slate-500">Create exam schedule and configure details</p>
          </div>
        </div>
        <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Basic Information</p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput label="Exam Name" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
              <FloatingSelect label="Exam Type" name="examType" options={EXAM_TYPES} value={form.examType} onChange={handleChange} required error={errors.examType} />
              <FloatingSelect label="Class" name="class" options={classOptions} value={form.class} onChange={handleChange} required error={errors.class} />
              <FloatingSelect label="Subject" name="subject" options={SUBJECTS} value={form.subject} onChange={handleChange} required error={errors.subject} />
              <FloatingInput label="Session (e.g. 2025-26)" name="session" value={form.session} onChange={handleChange} />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Schedule</p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput label="Exam Date" type="date" name="examDate" value={form.examDate} onChange={handleChange} required error={errors.examDate} />
              <FloatingInput label="End Date" type="date" name="endDate" value={form.endDate} onChange={handleChange} error={errors.endDate} />
              <FloatingInput label="Duration (minutes)" type="number" name="duration" value={form.duration} onChange={handleChange} />
              <FloatingInput label="Venue / Exam Hall" name="venue" value={form.venue} onChange={handleChange} />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Marks</p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <FloatingInput label="Total Marks" type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} required error={errors.totalMarks} />
              <FloatingInput label="Passing Marks" type="number" name="passingMarks" value={form.passingMarks} onChange={handleChange} required error={errors.passingMarks} />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Instructions</label>
              <textarea name="instructions" value={form.instructions} onChange={handleChange} rows="3"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none"
                placeholder="Any special instructions for students" />
            </div>
            {apiError && <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-rose-600 text-xs">{apiError}</div>}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
                <FaSave className="w-3 h-3" /> {loading && !saveAnother ? "Saving..." : "Save Exam"}
              </button>
              <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 border border-indigo-300 text-indigo-600 text-sm rounded-md hover:bg-indigo-50 transition">
                <FaPlus className="w-3 h-3" /> Save & Add Another
              </button>
              <button type="button" onClick={resetForm} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition">
                <FaUndo className="w-3 h-3" /> Reset
              </button>
              <button type="button" onClick={() => navigate("/exams")} className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 text-sm transition">
                <FaTimes className="w-3 h-3" /> Cancel
              </button>
            </div>
          </form>
        </div>
        {success && (
          <div className="fixed bottom-5 right-5 bg-emerald-500 text-white text-sm px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 z-50">
            <FaSave className="w-3.5 h-3.5" />
            {saveAnother ? "Saved! Add another exam." : "Exam created successfully!"}
          </div>
        )}
      </div>
    </div>
  );
}