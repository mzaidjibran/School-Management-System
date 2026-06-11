import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaPlus, FaUndo, FaTimes, FaPaperclip } from "react-icons/fa";

export default function CreateNotice() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "General",
    priority: "Normal",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    description: "",
    author: "Admin",
    audience: "All School",
    status: "Draft",
    attachments: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    "General",
    "Examination",
    "Fee",
    "Holiday",
    "Events",
    "Admission",
    "Staff",
  ];
  const priorities = ["Normal", "Important", "Urgent"];
  const audiences = [
    "All School",
    "Specific Class",
    "Specific Section",
    "Teachers Only",
    "Staff Only",
  ];
  const statuses = ["Draft", "Published"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title required";
    if (!form.publishDate) newErrors.publishDate = "Publish date required";
    if (!form.expiryDate) newErrors.expiryDate = "Expiry date required";
    else if (form.expiryDate < form.publishDate)
      newErrors.expiryDate = "Must be after publish date";
    if (!form.description.trim())
      newErrors.description = "Description required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "General",
      priority: "Normal",
      publishDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      description: "",
      author: "Admin",
      audience: "All School",
      status: "Draft",
      attachments: [],
    });
    setErrors({});
  };

  const handleSubmit = async (e, isPublished = true) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    if (!isPublished) resetForm();
    else navigate("/notices");
  };

  const inputBase = (hasError) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-all
    ${
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

  const Field = ({ label, name, type = "text", required, error }) => (
    <div>
      <Label text={label} required={required} />
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        placeholder=""
        className={inputBase(error)}
      />
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const Select = ({ label, name, options, required, error }) => (
    <div>
      <Label text={label} required={required} />
      <div className="relative">
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={inputBase(error) + " appearance-none pr-8"}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
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
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const priorityColor = {
    Normal: "bg-slate-100 text-slate-600",
    Important: "bg-amber-100 text-amber-700",
    Urgent: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span
            className="hover:text-indigo-500 cursor-pointer"
            onClick={() => navigate("/notices")}
          >
            Notice Board
          </span>
          <span>/</span>
          <span className="text-indigo-600">Create Notice</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Create Notice</h1>
            <p className="text-xs text-slate-500">
              Publish announcements for students, parents, and staff
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <form className="p-5">
            {/* Section: Notice Info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Notice Details
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="md:col-span-2">
                <Field
                  label="Notice Title"
                  name="title"
                  required
                  error={errors.title}
                />
              </div>
              <Select
                label="Category"
                name="category"
                options={categories}
                required
              />
              <div>
                <Label text="Priority" />
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, priority: p }))
                      }
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition
                        ${
                          form.priority === p
                            ? priorityColor[p] + " border-transparent"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Schedule */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Schedule & Audience
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <Field
                label="Publish Date"
                name="publishDate"
                type="date"
                required
                error={errors.publishDate}
              />
              <Field
                label="Expiry Date"
                name="expiryDate"
                type="date"
                required
                error={errors.expiryDate}
              />
              <Select label="Audience" name="audience" options={audiences} />
              <Field label="Author Name" name="author" required />
            </div>

            {/* Section: Content */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Content
            </p>
            <div className="mb-4">
              <Label text="Notice Content" required />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Write the detailed notice content here..."
                className={inputBase(errors.description) + " resize-none"}
              />
              {errors.description && (
                <p className="text-rose-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="mb-5">
              <Label text="Attachments (PDF / Images)" />
              <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                <FaPaperclip className="text-slate-400 text-sm" />
                <span className="text-sm text-slate-400">
                  {form.attachments.length > 0
                    ? `${form.attachments.length} file(s) attached`
                    : "Click to attach files"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-medium text-slate-500">
                Save as:
              </span>
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition
                    ${
                      form.status === s
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <FaSave className="w-3 h-3" />{" "}
                {loading ? "Publishing..." : "Publish Notice"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-300 text-indigo-600 text-sm rounded-lg hover:bg-indigo-50 transition"
              >
                <FaPlus className="w-3 h-3" /> Save as Draft
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
                onClick={() => navigate("/notices")}
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
            <FaSave className="w-3.5 h-3.5" /> Notice saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
