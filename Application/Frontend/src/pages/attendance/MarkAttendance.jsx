import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaUserCheck,
  FaUserTimes,
  FaBed,
  FaSave,
} from "react-icons/fa";
import { getAllClasses } from "../../api/Class_Api.js";
import { markAttendance } from "../../api/Attendence_Api.js";
import toast from "react-hot-toast";

// ─── Student fetch by classId ─────────────────────────────────────
// Students real API se aayenge — Student_Api ka getAllStudents use karo
import { getAllStudents } from "../../api/Student_Api.js";

// ---------- Status Radio Button ----------
const StatusRadio = ({ value, current, onChange }) => {
  const styles = {
    Present: "border-emerald-500 bg-emerald-50 text-emerald-700",
    Absent:  "border-rose-500    bg-rose-50    text-rose-700",
    Leave:   "border-amber-500   bg-amber-50   text-amber-700",
    Late:    "border-blue-500    bg-blue-50    text-blue-700",
  };
  return (
    <label
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition border text-xs font-medium
        ${current === value ? styles[value] : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"}`}
    >
      <input
        type="radio"
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="hidden"
      />
      {value}
    </label>
  );
};

const STATUS_OPTIONS = ["Present", "Absent", "Leave", "Late"];

export default function MarkAttendance() {
  const [classes, setClasses]               = useState([]);
  const [students, setStudents]             = useState([]);
  const [attendance, setAttendance]         = useState({});
  const [selectedClass, setSelectedClass]   = useState("");
  const [selectedDate, setSelectedDate]     = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [success, setSuccess]               = useState(false);
  const [apiError, setApiError]             = useState("");
  const [selectedSection, setSelectedSection] = useState(
    localStorage.getItem("activeSection") || "girls"
  );

  // Reset class when section changes
  useEffect(() => {
    setSelectedClass("");
  }, [selectedSection]);

  // ── Classes fetch ──────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getAllClasses({ section: "all" });
        setClasses(result.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load classes: " + e.message);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetch();
  }, []);

  // ── Students fetch jab class ya section change ho ───────────────
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      setAttendance({});
      return;
    }
    const fetch = async () => {
      setLoadingStudents(true);
      try {
        // currentClass aur section filter use karo
        const result = await getAllStudents({ currentClass: selectedClass, section: selectedSection });
        const list = result.data || [];
        setStudents(list);
        // Default sab Present
        const init = {};
        list.forEach((s) => (init[s._id] = "Present"));
        setAttendance(init);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load students: " + e.message);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetch();
  }, [selectedClass, selectedSection]);

  const handleStatusChange = (studentId, status) =>
    setAttendance((prev) => ({ ...prev, [studentId]: status }));

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => (updated[s._id] = status));
    setAttendance(updated);
  };

  // ── Summary ───────────────────────────────────────────────────
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter((v) => v === s).length;
    return acc;
  }, {});

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedClass) {
      toast.error("Pehle class select karo");
      return;
    }
    if (students.length === 0) {
      toast.error("Is class mein koi student nahi");
      return;
    }
    setSaving(true);
    try {
      const records = students.map((s) => ({
        student:     s._id,
        class:       selectedClass,
        date:        selectedDate,
        section:     selectedSection,
        // backend lowercase expect karta hai
        status:      attendance[s._id]?.toLowerCase() || "present",
        lateMinutes: 0,
        remarks:     "",
      }));
      await markAttendance(records);
      toast.success("Attendance saved successfully!");
    } catch (e) {
      toast.error(e.message || "Attendance save nahi ho saki");
    } finally {
      setSaving(false);
    }
  };

  const selectedClassObj = classes.find((c) => c._id === selectedClass);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Mark Attendance</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <FaCheckCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
            <p className="text-slate-500 text-sm">Record daily attendance for students</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Select Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="girls">Girls</option>
                <option value="boys">Boys</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Select Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loadingClasses}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="">
                  {loadingClasses ? "Loading classes..." : "-- Select Class --"}
                </option>
                {classes
                  .filter((c) => c.schoolSection === selectedSection)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — Section {c.section}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {selectedClass && students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total",   value: students.length, cls: "bg-white text-slate-800" },
              { label: "Present", value: counts.Present,  cls: "bg-emerald-50 text-emerald-700" },
              { label: "Absent",  value: counts.Absent,   cls: "bg-rose-50 text-rose-700" },
              { label: "Leave",   value: counts.Leave,    cls: "bg-amber-50 text-amber-700" },
              { label: "Late",    value: counts.Late,     cls: "bg-blue-50 text-blue-700" },
            ].map((card) => (
              <div key={card.label} className={`${card.cls} rounded-xl p-3 text-center shadow-sm border border-slate-100`}>
                <p className="text-xs opacity-70">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Student Table */}
        {selectedClass && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingStudents ? (
              <div className="p-10 text-center text-slate-500">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="text-base font-medium">Is class mein koi student nahi mila</p>
                <p className="text-sm mt-1">Pehle students ko is class mein assign karo</p>
              </div>
            ) : (
              <>
                {/* Class info                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-slate-600 uppercase">#</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-slate-600 uppercase">Roll No</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-slate-600 uppercase">Student Name</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-slate-600 uppercase">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-3 px-5 text-slate-400 text-sm">{idx + 1}</td>
                          <td className="py-3 px-5 text-slate-600 text-sm">{student.rollNumber || "—"}</td>
                          <td className="py-3 px-5 font-medium text-slate-800 text-sm">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex flex-wrap gap-2">
                              {STATUS_OPTIONS.map((status) => (
                                <StatusRadio
                                  key={status}
                                  value={status}
                                  current={attendance[student._id]}
                                  onChange={(val) => handleStatusChange(student._id, val)}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="block md:hidden p-4 space-y-3 bg-slate-50/50">
                  {students.map((student, idx) => {
                    const avatarColor = idx % 2 === 0 ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700";
                    return (
                      <div key={student._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3.5 transition duration-200 hover:shadow-md hover:border-indigo-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${avatarColor} font-bold text-xs flex items-center justify-center`}>
                              {student.firstName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{student.firstName} {student.lastName}</p>
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200/40">
                                Roll No: {student.rollNumber || "—"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-semibold border border-slate-200/20">
                            #{idx + 1}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1.5">
                          {STATUS_OPTIONS.map((status) => {
                            const isSelected = attendance[student._id] === status;
                            const activeStyles = {
                              Present: "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-100",
                              Absent: "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-100",
                              Leave: "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-100",
                              Late: "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-100",
                            };
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student._id, status)}
                                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition duration-150 text-center min-w-0 truncate ${
                                  isSelected
                                    ? activeStyles[status]
                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center px-5 py-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => markAll("Present")}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <FaUserCheck /> Present All
                    </button>
                    <button
                      onClick={() => markAll("Absent")}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <FaUserTimes /> Absent All
                    </button>
                    <button
                      onClick={() => markAll("Present")}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <FaBed /> Reset
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs font-bold shadow-md shadow-indigo-100"
                  >
                    {saving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <FaSave />
                    )}
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}