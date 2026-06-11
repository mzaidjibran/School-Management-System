import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaCalendarCheck,
  FaTimesCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

const generateExams = () => {
  const examNames = [
    "Mid Term",
    "Final Term",
    "Weekly Test",
    "Monthly Test",
    "Quarterly Exam",
  ];
  const examTypes = ["Theory", "Practical", "Both"];
  const classes = ["9th", "10th", "11th", "12th"];
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Urdu",
  ];
  const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
  return Array.from({ length: 25 }, (_, i) => {
    const startDate = new Date(2025, 3 + Math.floor(i / 5), (i % 28) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2);
    return {
      id: i + 1,
      examName:
        examNames[i % examNames.length] +
        (Math.floor(i / examNames.length) + 1),
      class: classes[i % classes.length],
      subject: subjects[i % subjects.length],
      examType: examTypes[i % examTypes.length],
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      totalMarks: 100,
      status: statuses[i % statuses.length],
      duration: "2 hours",
      examHall: `Hall ${(i % 5) + 1}`,
      passingMarks: 40,
    };
  });
};

const StatusBadge = ({ status }) => {
  const styles = {
    Upcoming: "bg-blue-50 text-blue-700 border border-blue-200",
    Ongoing: "bg-amber-50 text-amber-700 border border-amber-200",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
  };
  const icons = {
    Upcoming: <FaClock className="w-2.5 h-2.5" />,
    Ongoing: <FaCalendarCheck className="w-2.5 h-2.5" />,
    Completed: <FaCheckCircle className="w-2.5 h-2.5" />,
    Cancelled: <FaTimesCircle className="w-2.5 h-2.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {icons[status]} {status}
    </span>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse p-4 space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 rounded-lg" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
      <svg
        className="w-8 h-8 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <p className="text-sm font-medium text-slate-600">No exams found</p>
    <p className="text-xs text-slate-400 mt-0.5">
      Try adjusting your search or filters
    </p>
  </div>
);

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => {
      const data = generateExams();
      setExams(data);
      setFiltered(data);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = exams;
    if (search)
      result = result.filter((e) =>
        e.examName.toLowerCase().includes(search.toLowerCase()),
      );
    if (classFilter) result = result.filter((e) => e.class === classFilter);
    if (typeFilter) result = result.filter((e) => e.examType === typeFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, classFilter, typeFilter, statusFilter, exams]);

  const totalExams = exams.length;
  const upcomingExams = exams.filter((e) => e.status === "Upcoming").length;
  const completedExams = exams.filter((e) => e.status === "Completed").length;
  const ongoingExams = exams.filter((e) => e.status === "Ongoing").length;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const exportCSV = () => {
    const headers = [
      "Exam Name",
      "Class",
      "Subject",
      "Type",
      "Start Date",
      "End Date",
      "Total Marks",
      "Status",
    ];
    const rows = filtered.map((e) => [
      e.examName,
      e.class,
      e.subject,
      e.examType,
      e.startDate,
      e.endDate,
      e.totalMarks,
      e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "exams.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((e) => ({
        "Exam Name": e.examName,
        Class: e.class,
        Subject: e.subject,
        "Exam Type": e.examType,
        "Start Date": e.startDate,
        "End Date": e.endDate,
        "Total Marks": e.totalMarks,
        Status: e.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exams");
    XLSX.writeFile(wb, "exams.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Exam Schedule", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Exam Name",
          "Class",
          "Subject",
          "Type",
          "Start Date",
          "End Date",
          "Marks",
          "Status",
        ],
      ],
      body: filtered.map((e) => [
        e.examName,
        e.class,
        e.subject,
        e.examType,
        e.startDate,
        e.endDate,
        e.totalMarks,
        e.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("exams.pdf");
  };

  const handleView = (exam) => alert(`View exam: ${exam.examName}`);
  const handleEdit = (exam) => alert(`Edit exam: ${exam.examName}`);
  const handleDelete = (exam) => {
    if (window.confirm(`Delete ${exam.examName}?`))
      setExams((prev) => prev.filter((e) => e.id !== exam.id));
  };

  const uniqueClasses = [...new Set(exams.map((e) => e.class))];
  const uniqueTypes = [...new Set(exams.map((e) => e.examType))];
  const uniqueStatuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

  const statCards = [
    {
      label: "Total Exams",
      value: totalExams,
      icon: <FaCalendarCheck />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Upcoming",
      value: upcomingExams,
      icon: <FaClock />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Ongoing",
      value: ongoingExams,
      icon: <FaCalendarCheck />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Completed",
      value: completedExams,
      icon: <FaCheckCircle />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <nav className="flex text-xs text-slate-400 mb-1 gap-1">
              <span className="hover:text-indigo-500 cursor-pointer">
                Dashboard
              </span>
              <span>/</span>
              <span className="text-indigo-600">Exam Management</span>
            </nav>
            <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage all school exams, schedules, and results
            </p>
          </div>
          {/* Colorful Export Icons */}
          <div className="flex gap-1.5">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition"
            >
              <FaFileCsv className="text-emerald-600" /> CSV
            </button>
            <button
              onClick={exportExcel}
              title="Export Excel"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-xs font-medium transition"
            >
              <FaFileExcel className="text-green-600" /> Excel
            </button>
            <button
              onClick={exportPDF}
              title="Export PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-medium transition"
            >
              <FaFilePdf className="text-rose-600" /> PDF
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color} text-sm`}
              >
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
              <input
                type="text"
                placeholder="Search exam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            {[
              {
                val: classFilter,
                set: setClassFilter,
                opts: uniqueClasses,
                placeholder: "All Classes",
              },
              {
                val: typeFilter,
                set: setTypeFilter,
                opts: uniqueTypes,
                placeholder: "All Types",
              },
              {
                val: statusFilter,
                set: setStatusFilter,
                opts: uniqueStatuses,
                placeholder: "All Status",
              },
            ].map((f, i) => (
              <select
                key={i}
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
              >
                <option value="">{f.placeholder}</option>
                {f.opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "Exam Name",
                    "Class",
                    "Subject",
                    "Type",
                    "Start Date",
                    "End Date",
                    "Marks",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9">
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition"
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {exam.examName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.class}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.subject}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          {exam.examType}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.startDate}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.endDate}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {exam.totalMarks}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(exam)}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <FaEye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && paginatedData.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Prev
                </button>
                <span className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-lg">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
