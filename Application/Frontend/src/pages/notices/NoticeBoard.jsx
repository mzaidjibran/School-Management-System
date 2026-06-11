import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPrint,
  FaFilePdf,
  FaPlus,
  FaTimes,
  FaBullhorn,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------- Dummy Data ----------
const generateNotices = () => {
  const titles = [
    "School Reopening",
    "Exam Schedule",
    "Fee Submission Deadline",
    "Parent-Teacher Meeting",
    "Summer Vacation",
    "Sports Day",
  ];
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
  const statuses = ["Active", "Expired"];
  const authors = ["Principal", "Admin Office", "Exam Cell", "Accounts Office"];
  return Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    title: `${titles[i % titles.length]} ${i + 1}`,
    category: categories[i % categories.length],
    priority: priorities[i % priorities.length],
    status: statuses[i % 2],
    publishDate: `2025-03-${String((i % 28) + 1).padStart(2, "0")}`,
    expiryDate: `2025-04-${String((i % 28) + 1).padStart(2, "0")}`,
    description: `Important information for all students and parents regarding ${titles[i % titles.length]}.`,
    author: authors[i % authors.length],
    content: `Full content of the notice: ${titles[i % titles.length]}. All relevant details go here. Please read carefully and follow the instructions.`,
  }));
};

// ---------- Badges ----------
const PriorityBadge = ({ priority }) => {
  const s = {
    Normal: "bg-blue-100 text-blue-700",
    Important: "bg-amber-100 text-amber-700",
    Urgent: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s[priority]}`}
    >
      {priority}
    </span>
  );
};
const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
  >
    {status}
  </span>
);

// ---------- View Modal ----------
const NoticeModal = ({ notice, onClose, onPrint }) => {
  if (!notice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b shrink-0">
          <div className="flex items-start gap-3 pr-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <FaBullhorn className="text-indigo-600 text-sm" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                {notice.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {notice.category} · {notice.publishDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
            {[
              ["Priority", <PriorityBadge priority={notice.priority} />],
              ["Status", <StatusBadge status={notice.status} />],
              ["Publish Date", notice.publishDate],
              ["Expiry Date", notice.expiryDate],
              ["Author", notice.author],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <div className="text-sm font-medium text-slate-800">{val}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <p className="text-xs text-slate-400 mb-1.5">Content</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onPrint(notice);
              onClose();
            }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <FaPrint className="text-xs" /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main ----------
export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const itemsPerPage = 9;

  useEffect(() => {
    setTimeout(() => {
      const d = generateNotices();
      setNotices(d);
      setFiltered(d);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let r = notices;
    if (search)
      r = r.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.description.toLowerCase().includes(search.toLowerCase()),
      );
    if (categoryFilter) r = r.filter((n) => n.category === categoryFilter);
    if (priorityFilter) r = r.filter((n) => n.priority === priorityFilter);
    if (statusFilter) r = r.filter((n) => n.status === statusFilter);
    setFiltered(r);
    setCurrentPage(1);
  }, [search, categoryFilter, priorityFilter, statusFilter, notices]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedNotices = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = (notice) => {
    if (window.confirm(`Delete "${notice.title}"?`))
      setNotices((prev) => prev.filter((n) => n.id !== notice.id));
  };

  const handlePrint = (notice) => {
    const w = window.open("", "_blank");
    w.document
      .write(`<html><head><title>${notice.title}</title><style>body{font-family:Arial;padding:40px;line-height:1.6;max-width:700px;margin:auto}</style></head><body>
      <div style="text-align:center;border-bottom:2px solid #4f46e5;padding-bottom:16px;margin-bottom:24px">
        <div style="width:48px;height:48px;margin:0 auto 8px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px">P</div>
        <h2 style="margin:0">Punjab Public High School</h2><p style="margin:4px 0;color:#666">Lahore, Pakistan</p>
      </div>
      <h1 style="color:#1e293b">${notice.title}</h1>
      <p><strong>Category:</strong> ${notice.category} &nbsp;|&nbsp; <strong>Priority:</strong> ${notice.priority}</p>
      <p><strong>Publish Date:</strong> ${notice.publishDate} &nbsp;|&nbsp; <strong>Expiry:</strong> ${notice.expiryDate} &nbsp;|&nbsp; <strong>Author:</strong> ${notice.author}</p>
      <div style="margin:24px 0;border-top:1px solid #e2e8f0;padding-top:20px">${notice.content}</div>
      <div style="margin-top:48px;display:flex;justify-content:space-between"><div>Principal Signature: __________________</div><div>School Stamp</div></div>
      <p style="margin-top:24px;font-size:11px;text-align:center;color:#94a3b8">Generated: ${new Date().toLocaleDateString()}</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Notice Board", 14, 10);
    autoTable(doc, {
      startY: 18,
      head: [
        [
          "#",
          "Title",
          "Category",
          "Priority",
          "Status",
          "Publish Date",
          "Author",
        ],
      ],
      body: filtered.map((n, i) => [
        i + 1,
        n.title,
        n.category,
        n.priority,
        n.status,
        n.publishDate,
        n.author,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });
    doc.save("notices.pdf");
  };

  const categories = [...new Set(notices.map((n) => n.category))];
  const inputCls =
    "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  // Priority left-border color
  const priorityBorder = {
    Normal: "border-l-blue-400",
    Important: "border-l-amber-400",
    Urgent: "border-l-rose-500",
  };

  const statCards = [
    {
      label: "Total Notices",
      value: notices.length,
      icon: <FaBullhorn className="text-indigo-600" />,
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Active Notices",
      value: notices.filter((n) => n.status === "Active").length,
      icon: <FaCheckCircle className="text-emerald-600" />,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Expired Notices",
      value: notices.filter((n) => n.status === "Expired").length,
      icon: <FaClock className="text-slate-500" />,
      bg: "bg-slate-100",
      text: "text-slate-700",
    },
    {
      label: "Important/Urgent",
      value: notices.filter(
        (n) => n.priority === "Important" || n.priority === "Urgent",
      ).length,
      icon: <FaExclamationTriangle className="text-amber-500" />,
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">Notice Board</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notice Board</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              School announcements and notices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <FaFilePdf className="text-rose-500" /> Export PDF
            </button>
            <a
              href="/notices/create"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="text-xs" /> Create Notice
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${c.text}`}>
                  {c.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-lg`}
              >
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search notices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Priorities</option>
              {["Normal", "Important", "Urgent"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} px-2.5`}
            >
              <option value="">All Status</option>
              {["Active", "Expired"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-44 animate-pulse border border-slate-100"
                />
              ))}
          </div>
        ) : paginatedNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
            <FaBullhorn className="text-slate-300 text-4xl mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No notices found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 border-l-4 ${priorityBorder[notice.priority]} p-4 hover:shadow-md transition-shadow flex flex-col`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1">
                    {notice.title}
                  </h3>
                  <PriorityBadge priority={notice.priority} />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                    {notice.category}
                  </span>
                  <StatusBadge status={notice.status} />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1 line-clamp-2">
                  {notice.description}
                </p>

                {/* Date + Author */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>📅 {notice.publishDate}</span>
                  <span>👤 {notice.author}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    title="View"
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <FaEye className="text-sm" />
                  </button>
                  <button
                    onClick={() => alert(`Edit: ${notice.title}`)}
                    title="Edit"
                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice)}
                    title="Delete"
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <button
                    onClick={() => handlePrint(notice)}
                    title="Print"
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <FaPrint className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-7">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === currentPage ? "bg-indigo-600 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      <NoticeModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        onPrint={handlePrint}
      />
    </div>
  );
}
