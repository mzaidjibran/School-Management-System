import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaUserCheck,
  FaUserTimes,
  FaBed,
  FaClock,
  FaSave,
} from "react-icons/fa";

// ---------- Dummy Student Data ----------
const fetchStudents = (classVal, sectionVal) => {
  const allStudents = [
    { id: 1, rollNo: "2024-001", name: "Ali Raza" },
    { id: 2, rollNo: "2024-002", name: "Sana Khan" },
    { id: 3, rollNo: "2024-003", name: "Imran Ali" },
    { id: 4, rollNo: "2024-004", name: "Fatima Ahmed" },
    { id: 5, rollNo: "2024-005", name: "Usman Chaudhry" },
    { id: 6, rollNo: "2024-006", name: "Ayesha Siddiqui" },
    { id: 7, rollNo: "2024-007", name: "Hamza Ali" },
    { id: 8, rollNo: "2024-008", name: "Zara Tariq" },
  ];
  // Simulate filtering by class/section (just for demo)
  return allStudents.slice(0, classVal === "10th" ? 6 : 5);
};

export default function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Options
  const classOptions = ["9th", "10th", "11th", "12th"];
  const sectionOptions = ["A", "B", "C"];
  const statusOptions = ["Present", "Absent", "Leave", "Late"];

  // Load students when class/section change
  useEffect(() => {
    if (selectedClass && selectedSection) {
      setLoading(true);
      setTimeout(() => {
        const studentList = fetchStudents(selectedClass, selectedSection);
        setStudents(studentList);
        // Initialize attendance status: default "Present"
        const initialAttendance = {};
        studentList.forEach((s) => {
          initialAttendance[s.id] = "Present";
        });
        setAttendance(initialAttendance);
        setLoading(false);
      }, 500);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedSection]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance = {};
    students.forEach((s) => {
      newAttendance[s.id] = "Present";
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance = {};
    students.forEach((s) => {
      newAttendance[s.id] = "Absent";
    });
    setAttendance(newAttendance);
  };

  const resetAttendance = () => {
    const newAttendance = {};
    students.forEach((s) => {
      newAttendance[s.id] = "Present";
    });
    setAttendance(newAttendance);
  };

  // Summary counts
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(
    (v) => v === "Present",
  ).length;
  const absentCount = Object.values(attendance).filter(
    (v) => v === "Absent",
  ).length;
  const leaveCount = Object.values(attendance).filter(
    (v) => v === "Leave",
  ).length;
  const lateCount = Object.values(attendance).filter(
    (v) => v === "Late",
  ).length;

  const handleSave = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select class and section");
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    console.log("Saved attendance:", {
      class: selectedClass,
      section: selectedSection,
      date: selectedDate,
      attendance,
    });
  };

  // Status button style
  const StatusRadio = ({ value, current, onChange, label }) => (
    <label
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition border ${
        current === value
          ? value === "Present"
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : value === "Absent"
              ? "border-rose-500 bg-rose-50 text-rose-700"
              : value === "Leave"
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
      }`}
    >
      <input
        type="radio"
        name="status"
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="hidden"
      />
      <span className="text-xs font-medium">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Mark Attendance</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <FaCheckCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Mark Attendance
            </h1>
            <p className="text-slate-500">
              Record daily attendance for students
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white"
            >
              <option value="">Select Class</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white"
            >
              <option value="">Select Section</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {selectedClass && selectedSection && students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold">{totalStudents}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600">Present</p>
              <p className="text-xl font-bold text-emerald-700">
                {presentCount}
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 text-center">
              <p className="text-xs text-rose-600">Absent</p>
              <p className="text-xl font-bold text-rose-700">{absentCount}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-600">Leave</p>
              <p className="text-xl font-bold text-amber-700">{leaveCount}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600">Late</p>
              <p className="text-xl font-bold text-blue-700">{lateCount}</p>
            </div>
          </div>
        )}

        {/* Student Table */}
        {selectedClass && selectedSection && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No students found for this class/section
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">
                          Roll No
                        </th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">
                          Student Name
                        </th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-5 text-slate-700">
                            {student.rollNo}
                          </td>
                          <td className="py-3 px-5 font-medium text-slate-800">
                            {student.name}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.map((status) => (
                                <StatusRadio
                                  key={status}
                                  value={status}
                                  current={attendance[student.id]}
                                  onChange={(val) =>
                                    handleStatusChange(student.id, val)
                                  }
                                  label={status}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3 justify-between items-center px-5 py-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={markAllPresent}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm flex items-center gap-1"
                    >
                      <FaUserCheck /> Mark All Present
                    </button>
                    <button
                      onClick={markAllAbsent}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm flex items-center gap-1"
                    >
                      <FaUserTimes /> Mark All Absent
                    </button>
                    <button
                      onClick={resetAttendance}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm"
                    >
                      <FaBed /> Reset
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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

        {/* Success Toast */}
        {success && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 z-50">
            <FaCheckCircle className="w-5 h-5" />
            <span>Attendance saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
