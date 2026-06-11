import { useState, useEffect } from "react";
import { FaSave, FaUndo, FaCheckCircle, FaUsers } from "react-icons/fa";

const fetchStudents = () =>
  [
    { id: 1, rollNo: "2024-001", name: "Ali Raza" },
    { id: 2, rollNo: "2024-002", name: "Sana Khan" },
    { id: 3, rollNo: "2024-003", name: "Imran Ali" },
    { id: 4, rollNo: "2024-004", name: "Fatima Ahmed" },
    { id: 5, rollNo: "2024-005", name: "Usman Chaudhry" },
    { id: 6, rollNo: "2024-006", name: "Ayesha Siddiqui" },
    { id: 7, rollNo: "2024-007", name: "Hamza Ali" },
    { id: 8, rollNo: "2024-008", name: "Zara Tariq" },
  ].map((s) => ({
    ...s,
    obtainedMarks: 0,
    totalMarks: 100,
    percentage: 0,
    grade: "F",
  }));

const calculateGrade = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
};

const pctColor = (p) => {
  if (p >= 80) return "bg-emerald-50 text-emerald-700";
  if (p >= 60) return "bg-blue-50 text-blue-700";
  if (p >= 40) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
};

export default function MarksEntry() {
  const [exams] = useState([
    { id: 1, name: "Mid Term 2025" },
    { id: 2, name: "Final Term 2025" },
  ]);
  const [classes] = useState(["9th", "10th", "11th", "12th"]);
  const [subjects] = useState([
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
  ]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (selectedExam && selectedClass && selectedSubject) {
      setLoading(true);
      setTimeout(() => {
        setStudents(fetchStudents());
        setLoading(false);
      }, 500);
    }
  }, [selectedExam, selectedClass, selectedSubject]);

  const handleMarksChange = (studentId, value) => {
    const marks = Math.min(parseFloat(value) || 0, 100);
    const pct = (marks / 100) * 100;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              obtainedMarks: marks,
              percentage: pct.toFixed(1),
              grade: calculateGrade(pct),
            }
          : s,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReset = () =>
    setStudents((prev) =>
      prev.map((s) => ({ ...s, obtainedMarks: 0, percentage: 0, grade: "F" })),
    );

  const filtersSet = selectedExam && selectedClass && selectedSubject;
  const marksEntered = students.filter((s) => s.obtainedMarks > 0).length;
  const remaining = students.length - marksEntered;

  const selectClass =
    "text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-indigo-600">Marks Entry</span>
        </nav>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <FaSave className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Marks Entry</h1>
            <p className="text-xs text-slate-500">
              Enter and update student marks with auto grade calculation
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        {filtersSet && !loading && students.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {
                icon: <FaUsers />,
                label: "Total Students",
                val: students.length,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                icon: <FaCheckCircle />,
                label: "Marks Entered",
                val: marksEntered,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: <FaSave />,
                label: "Remaining",
                val: remaining,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((c) => (
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
                  <p className={`text-lg font-bold ${c.color}`}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {filtersSet && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No students found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          "Roll No",
                          "Student Name",
                          "Obtained Marks",
                          "Total",
                          "Percentage",
                          "Grade",
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
                      {students.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="py-2.5 px-4 text-slate-500 text-xs">
                            {s.rollNo}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            {s.name}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={s.obtainedMarks}
                                onChange={(e) =>
                                  handleMarksChange(s.id, e.target.value)
                                }
                                className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                                min="0"
                                max="100"
                              />
                              <span className="text-xs text-slate-400">
                                / {s.totalMarks}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {s.totalMarks}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${pctColor(s.percentage)}`}
                            >
                              {s.percentage}%
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-700">
                            {s.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <FaSave className="w-3 h-3" />{" "}
                    {saving ? "Saving..." : "Save Marks"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition"
                  >
                    <FaUndo className="w-3 h-3" /> Reset
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {success && (
          <div className="fixed bottom-5 right-5 bg-emerald-500 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50">
            <FaCheckCircle className="w-3.5 h-3.5" /> Marks saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
