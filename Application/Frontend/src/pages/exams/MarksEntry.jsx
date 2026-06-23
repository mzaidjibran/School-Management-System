import { useState, useEffect } from "react";
import { FaSave, FaUndo, FaCheckCircle, FaUsers } from "react-icons/fa";
import { getAllExams, enterMarks } from "../../api/Exam_Api.js";
import { getAllStudents } from "../../api/Student_Api.js";

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

const EXAM_TYPE_LABELS = {
  mid_term:"Mid Term", final_term:"Final Term",
  unit_test:"Unit Test", practical:"Practical", quiz:"Quiz",
};

export default function MarksEntry() {
  const [exams, setExams]               = useState([]);
  const [students, setStudents]         = useState([]);
  const [marksData, setMarksData]       = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState(false);
  const [apiError, setApiError]         = useState("");

  const examObj = exams.find((e) => e._id === selectedExam);

  // ── Load exams ────────────────────────────────────────────────
  useEffect(() => {
    getAllExams()
      .then((r) => setExams(r.data || []))
      .catch(console.error);
  }, []);

  // ── Load students jab exam select ho ─────────────────────────
  useEffect(() => {
    if (!selectedExam || !examObj?.class) {
      setStudents([]);
      setMarksData([]);
      return;
    }
    setLoading(true);
    const classId = typeof examObj.class === "object" ? examObj.class._id : examObj.class;
    getAllStudents({ currentClass: classId })
      .then((r) => {
        const list = r.data || [];
        setStudents(list);
        setMarksData(list.map((s) => ({ studentId: s._id, obtainedMarks: 0, remarks: "" })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedExam]);

  const totalMarks = examObj?.totalMarks || 100;

  const handleMarksChange = (studentId, value) => {
    const marks = Math.min(Math.max(parseFloat(value) || 0, 0), totalMarks);
    setMarksData((prev) => prev.map((m) => m.studentId === studentId ? { ...m, obtainedMarks: marks } : m));
  };

  const handleReset = () => setMarksData((prev) => prev.map((m) => ({ ...m, obtainedMarks: 0 })));

  const handleSave = async () => {
    if (!selectedExam) { setApiError("Pehle exam select karo"); return; }
    if (students.length === 0) { setApiError("Koi student nahi mila"); return; }
    setSaving(true);
    setApiError("");
    try {
      const results = marksData.map((m) => ({
        student: m.studentId,
        obtainedMarks: m.obtainedMarks,
        remarks: m.remarks,
      }));
      await enterMarks(selectedExam, results);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setApiError(err.message || "Marks save nahi ho sake");
    } finally {
      setSaving(false);
    }
  };

  const marksEntered = marksData.filter((m) => m.obtainedMarks > 0).length;
  const selectClass  = "text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <nav className="flex text-xs text-slate-400 mb-4 gap-1">
          <span>Dashboard</span><span>/</span>
          <span className="text-indigo-600">Marks Entry</span>
        </nav>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-100 rounded-xl"><FaSave className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Marks Entry</h1>
            <p className="text-xs text-slate-500">Enter and update student marks with auto grade calculation</p>
          </div>
        </div>

        {/* Exam selector */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Exam</label>
          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className={selectClass + " w-full"}>
            <option value="">-- Select Exam --</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} — {e.subject} ({EXAM_TYPE_LABELS[e.examType] || e.examType}) | {e.class?.name} {e.class?.section}
              </option>
            ))}
          </select>
          {examObj && (
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span>Total Marks: <strong>{examObj.totalMarks}</strong></span>
              <span>Passing: <strong>{examObj.passingMarks}</strong></span>
              <span>Date: <strong>{examObj.examDate ? new Date(examObj.examDate).toLocaleDateString() : "—"}</strong></span>
            </div>
          )}
        </div>

        {/* Stats */}
        {selectedExam && !loading && students.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon:<FaUsers />, label:"Total Students", val:students.length, color:"text-indigo-600", bg:"bg-indigo-50" },
              { icon:<FaCheckCircle />, label:"Marks Entered", val:marksEntered, color:"text-emerald-600", bg:"bg-emerald-50" },
              { icon:<FaSave />, label:"Remaining", val:students.length - marksEntered, color:"text-amber-600", bg:"bg-amber-50" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color} text-sm`}>{c.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className={`text-lg font-bold ${c.color}`}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {selectedExam && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Is class mein koi student nahi mila
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["#","Roll No","Student Name","Obtained Marks","Total","Percentage","Grade"].map((h) => (
                          <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const m = marksData.find((x) => x.studentId === s._id) || { obtainedMarks: 0 };
                        const pct = ((m.obtainedMarks / totalMarks) * 100).toFixed(1);
                        const grade = calculateGrade(parseFloat(pct));
                        return (
                          <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="py-2.5 px-4 text-slate-400 text-xs">{idx + 1}</td>
                            <td className="py-2.5 px-4 text-slate-500 text-xs">{s.rollNumber || "—"}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{s.firstName} {s.lastName}</td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <input type="number" value={m.obtainedMarks}
                                  onChange={(e) => handleMarksChange(s._id, e.target.value)}
                                  className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
                                  min="0" max={totalMarks} />
                                <span className="text-xs text-slate-400">/ {totalMarks}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">{totalMarks}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pctColor(parseFloat(pct))}`}>{pct}%</span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-700">{grade}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {apiError && <div className="mx-4 my-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs">{apiError}</div>}
                <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                    <FaSave className="w-3 h-3" /> {saving ? "Saving..." : "Save Marks"}
                  </button>
                  <button onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition">
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