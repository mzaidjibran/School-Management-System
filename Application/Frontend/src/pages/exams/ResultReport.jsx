import { useState, useEffect } from "react";
import {
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaEye,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Results Data ----------
const generateResults = () => {
  const students = [
    {
      id: 1,
      rollNo: "2024-001",
      name: "Ali Raza",
      class: "10th",
      section: "A",
    },
    {
      id: 2,
      rollNo: "2024-002",
      name: "Sana Khan",
      class: "10th",
      section: "A",
    },
    {
      id: 3,
      rollNo: "2024-003",
      name: "Imran Ali",
      class: "10th",
      section: "B",
    },
    {
      id: 4,
      rollNo: "2024-004",
      name: "Fatima Ahmed",
      class: "9th",
      section: "A",
    },
    {
      id: 5,
      rollNo: "2024-005",
      name: "Usman Chaudhry",
      class: "9th",
      section: "B",
    },
    {
      id: 6,
      rollNo: "2024-006",
      name: "Ayesha Siddiqui",
      class: "11th",
      section: "A",
    },
  ];
  return students.map((s) => {
    const totalMarks = 500;
    const obtained = Math.floor(Math.random() * 150) + 300;
    const percentage = ((obtained / totalMarks) * 100).toFixed(1);
    const grade = calculateGrade(percentage);
    const status = percentage >= 40 ? "Pass" : "Fail";
    return {
      ...s,
      totalMarks,
      obtained,
      percentage: parseFloat(percentage),
      grade,
      status,
      examName: "Final Term 2025",
    };
  });
};

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

const getPerformanceColor = (percent) => {
  if (percent >= 80) return "text-emerald-600 bg-emerald-50";
  if (percent >= 60) return "text-blue-600 bg-blue-50";
  if (percent >= 40) return "text-amber-600 bg-amber-50";
  return "text-rose-600 bg-rose-50";
};

const ResultBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "Pass" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
  >
    {status}
  </span>
);

// ---------- Student Result Modal ----------
const StudentResultModal = ({ student, onClose }) => {
  if (!student) return null;
  // Subject wise dummy marks
  const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Urdu"];
  const subjectMarks = subjects.map((s) => ({
    subject: s,
    obtained: Math.floor(Math.random() * 80) + 20,
    total: 100,
  }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Student Result Detail
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold">{student.name}</h4>
            <p className="text-slate-500">
              Roll No: {student.rollNo} | Class: {student.class} | Exam:{" "}
              {student.examName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Total Marks</p>
              <p className="text-xl font-bold">{student.totalMarks}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Obtained Marks</p>
              <p className="text-xl font-bold">{student.obtained}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Percentage</p>
              <p className="text-xl font-bold text-indigo-600">
                {student.percentage}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Grade</p>
              <p className="text-xl font-bold">{student.grade}</p>
            </div>
          </div>
          <h5 className="font-semibold mb-2">Subject Wise Marks</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Subject</th>
                <th className="text-left py-2">Obtained</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">%</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjectMarks.map((s) => {
                const percent = (s.obtained / s.total) * 100;
                return (
                  <tr key={s.subject} className="border-b">
                    <td className="py-2">{s.subject}</td>
                    <td>{s.obtained}</td>
                    <td>{s.total}</td>
                    <td>{percent.toFixed(1)}%</td>
                    <td>{calculateGrade(percent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResultReport() {
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = generateResults();
      setResults(data);
      setFiltered(data);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = results;
    if (examFilter) result = result.filter((r) => r.examName === examFilter);
    if (classFilter) result = result.filter((r) => r.class === classFilter);
    if (studentFilter)
      result = result.filter((r) =>
        r.name.toLowerCase().includes(studentFilter.toLowerCase()),
      );
    setFiltered(result);
  }, [examFilter, classFilter, studentFilter, results]);

  const totalStudents = filtered.length;
  const passed = filtered.filter((r) => r.status === "Pass").length;
  const failed = filtered.filter((r) => r.status === "Fail").length;
  const passPercent = totalStudents
    ? ((passed / totalStudents) * 100).toFixed(1)
    : 0;

  const uniqueExams = [...new Set(results.map((r) => r.examName))];
  const uniqueClasses = [...new Set(results.map((r) => r.class))];

  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Class",
      "Total Marks",
      "Obtained",
      "Percentage",
      "Grade",
      "Result",
    ];
    const rows = filtered.map((r) => [
      r.rollNo,
      r.name,
      r.class,
      r.totalMarks,
      r.obtained,
      r.percentage,
      r.grade,
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "results.csv");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        "Roll No": r.rollNo,
        "Student Name": r.name,
        Class: r.class,
        "Total Marks": r.totalMarks,
        Obtained: r.obtained,
        Percentage: r.percentage,
        Grade: r.grade,
        Result: r.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "results.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Result Report", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Roll No",
          "Student",
          "Class",
          "Total",
          "Obtained",
          "Percent",
          "Grade",
          "Result",
        ],
      ],
      body: filtered.map((r) => [
        r.rollNo,
        r.name,
        r.class,
        r.totalMarks,
        r.obtained,
        `${r.percentage}%`,
        r.grade,
        r.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("results.pdf");
  };
  const printResult = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex mb-6 text-sm">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Results</span>
        </nav>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Results</h1>
            <p className="text-slate-500">
              View student results and performance analytics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="p-2 bg-white border rounded-xl"
            >
              <FaFileCsv />
            </button>
            <button
              onClick={exportExcel}
              className="p-2 bg-white border rounded-xl"
            >
              <FaFileExcel />
            </button>
            <button
              onClick={exportPDF}
              className="p-2 bg-white border rounded-xl"
            >
              <FaFilePdf />
            </button>
            <button
              onClick={printResult}
              className="p-2 bg-white border rounded-xl"
            >
              <FaPrint />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5">
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <div>
              <p className="text-sm text-slate-500">Passed</p>
              <p className="text-2xl font-bold text-emerald-600">{passed}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <div>
              <p className="text-sm text-slate-500">Failed</p>
              <p className="text-2xl font-bold text-rose-600">{failed}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <div>
              <p className="text-sm text-slate-500">Pass %</p>
              <p className="text-2xl font-bold text-indigo-600">
                {passPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            >
              <option value="">All Exams</option>
              {uniqueExams.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search student..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4">Roll No</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Obtained</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-10 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{r.rollNo}</td>
                      <td className="font-medium">{r.name}</td>
                      <td>{r.class}</td>
                      <td>{r.totalMarks}</td>
                      <td>{r.obtained}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(r.percentage)}`}
                        >
                          {r.percentage}%
                        </span>
                      </td>
                      <td>{r.grade}</td>
                      <td>
                        <ResultBadge status={r.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedStudent(r)}
                          className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStudent && (
          <StudentResultModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </div>
  );
}
