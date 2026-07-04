import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaPlus, FaUndo, FaTimes, FaPaperclip } from "react-icons/fa";
import { createNotice, getNoticeById, updateNotice } from "../../api/Notice_Api.js";
import toast from "react-hot-toast";

// ── Backend enum values (lowercase) ──────────────────────────────
const CATEGORIES  = ["general", "examination", "fee", "holiday", "events", "admission", "staff"];
const PRIORITIES  = ["normal", "important", "urgent"];
const AUDIENCES   = ["all", "students", "teachers", "parents", "staff"];
const STATUSES    = ["draft", "published"];

const EMPTY_FORM = {
  title:         "",
  targetAudience: "all",
  priority:      "normal",
  publishDate:   new Date().toISOString().split("T")[0],
  expiryDate:    "",
  content:       "",
  status:        "draft",
};

// ── Reusable field components (defined OUTSIDE to avoid focus bug) ─
const inputBase = (hasError) =>
  `w-full px-3 py-2.5 text-sm border rounded-md bg-white outline-none transition-all ${
    hasError
      ? "border-rose-400 focus:ring-1 focus:ring-rose-400"
      : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
  }`;

const Label = ({ text, required }) => (
  <label className="block text-xs font-medium text-slate-500 mb-1.5">
    {text}
    {required && <span className="text-rose-400 ml-0.5">*</span>}
  </label>
);

const Field = ({ label, name, type = "text", required, error, value, onChange }) => (
  <div>
    <Label text={label} required={required} />
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={inputBase(!!error)}
    />
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, options, required, error, value, onChange }) => (
  <div>
    <Label text={label} required={required} />
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputBase(!!error) + " appearance-none pr-8"}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────
export default function CreateNotice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm]       = useState({ ...EMPTY_FORM });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // ── Load existing notice in edit mode ─────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      setFetchLoading(true);
      try {
        const res = await getNoticeById(id);
        const n = res.notice;
        setForm({
          title:          n.title || "",
          targetAudience: n.targetAudience || "all",
          priority:       n.priority || "normal",
          publishDate:    n.publishDate ? n.publishDate.split("T")[0] : "",
          expiryDate:     n.expiryDate  ? n.expiryDate.split("T")[0]  : "",
          content:        n.content || "",
          status:         n.status || "draft",
        });
      } catch (err) {
        toast.error("Notice load error: " + err.message);
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title = "Title required";
    if (!form.publishDate)     e.publishDate = "Publish date required";
    if (!form.expiryDate)      e.expiryDate = "Expiry date required";
    else if (form.expiryDate < form.publishDate)
                               e.expiryDate = "Must be after publish date";
    if (!form.content.trim())  e.content = "Content required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      title:          form.title.trim(),
      targetAudience: form.targetAudience,
      priority:       form.priority,
      publishDate:    form.publishDate,
      expiryDate:     form.expiryDate || undefined,
      content:        form.content.trim(),
      status:         saveAsDraft ? "draft" : "published",
    };

    try {
      if (isEdit) {
        await updateNotice(id, payload);
        toast.success("Notice updated successfully!");
        navigate("/notices");
      } else {
        await createNotice(payload);
        toast.success(saveAsDraft ? "Saved as draft!" : "Notice published!");
        navigate("/notices");
      }
    } catch (err) {
      toast.error(err.message || "Error saving notice.");
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = {
    normal:    form.priority === "normal"    ? "bg-blue-100 text-blue-700 border-transparent"    : "border-slate-200 text-slate-500 hover:bg-slate-50",
    important: form.priority === "important" ? "bg-amber-100 text-amber-700 border-transparent"  : "border-slate-200 text-slate-500 hover:bg-slate-50",
    urgent:    form.priority === "urgent"    ? "bg-rose-100 text-rose-700 border-transparent"    : "border-slate-200 text-slate-500 hover:bg-slate-50",
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading notice...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span className="hover:text-indigo-500 cursor-pointer" onClick={() => navigate("/notices")}>
            Notice Board
          </span>
          <span>/</span>
          <span className="text-indigo-600">{isEdit ? "Edit Notice" : "Create Notice"}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-md">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {isEdit ? "Edit Notice" : "Create Notice"}
            </h1>
            <p className="text-xs text-slate-500">
              Publish announcements for students, parents, and staff
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
          <form className="p-5" onSubmit={(e) => handleSubmit(e, false)}>

            {/* Notice Details */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Notice Details
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="md:col-span-2">
                <Field
                  label="Notice Title" name="title" required
                  value={form.title} onChange={handleChange} error={errors.title}
                />
              </div>

              <SelectField
                label="Audience" name="targetAudience" options={AUDIENCES}
                value={form.targetAudience} onChange={handleChange}
              />

              <div>
                <Label text="Priority" />
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-md border transition ${priorityColor[p]}`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Schedule
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <Field
                label="Publish Date" name="publishDate" type="date" required
                value={form.publishDate} onChange={handleChange} error={errors.publishDate}
              />
              <Field
                label="Expiry Date" name="expiryDate" type="date" required
                value={form.expiryDate} onChange={handleChange} error={errors.expiryDate}
              />
            </div>

            {/* Content */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Content
            </p>
            <div className="mb-5">
              <Label text="Notice Content" required />
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows="4"
                placeholder="Write the detailed notice content here..."
                className={inputBase(!!errors.content) + " resize-none"}
              />
              {errors.content && (
                <p className="text-rose-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-medium text-slate-500">Save as:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                    form.status === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <FaSave className="w-3 h-3" />
                {loading ? "Saving..." : isEdit ? "Update Notice" : "Publish Notice"}
              </button>
              {!isEdit && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 border border-indigo-300 text-indigo-600 text-sm rounded-md hover:bg-indigo-50 transition"
                >
                  <FaPlus className="w-3 h-3" /> Save as Draft
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition"
              >
                <FaUndo className="w-3 h-3" /> Reset
              </button>
              <button
                type="button"
                onClick={() => navigate("/notices")}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 text-sm transition"
              >
                <FaTimes className="w-3 h-3" /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}