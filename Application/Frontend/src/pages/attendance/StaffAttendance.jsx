import { useState, useEffect } from "react";
import { Users, Calendar, ClipboardCheck, AlertCircle, Save, Loader2 } from "lucide-react";
import { getAllTeachers } from "../../api/Teacher_Api.js";
import { getStaffAttendance, markStaffAttendance } from "../../api/Attendance_Api.js";
import toast from "react-hot-toast";

// Radio buttons styled with Marina active brand colors
const StatusRadio = ({ value, current, onChange }) => {
  const styles = {
    present: "border-emerald-500 bg-emerald-50 text-emerald-700",
    absent:  "border-rose-500    bg-rose-50    text-rose-700",
    leave:   "border-amber-500   bg-amber-50   text-amber-700",
    late:    "border-blue-500    bg-blue-50    text-blue-700",
  };
  return (
    <label
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition border text-xs font-semibold select-none capitalize
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

const STATUS_OPTIONS = ["present", "absent", "leave", "late"];

export default function StaffAttendance() {
  const [teachers, setTeachers] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  // Get local timezone-safe date string (YYYY-MM-DD)
  const getLocalDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load staff list & marked attendance on date changes
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // 1. Fetch active teachers
      const teachersRes = await getAllTeachers();
      const list = (teachersRes.data || []).filter(t => t.status === "active" || t.status === "Active" || !t.status);
      setTeachers(list);

      // 2. Fetch marked attendance for this date
      const attendanceRes = await getStaffAttendance(selectedDate);
      const markedRecords = attendanceRes.data || [];

      // Create maps
      const records = {};
      const remarks = {};

      list.forEach((t) => {
        const existing = markedRecords.find((r) => {
          const rTeacherId = typeof r.teacher === "object" ? r.teacher?._id : r.teacher;
          return String(rTeacherId) === String(t._id);
        });
        if (existing) {
          records[t._id] = existing.status;
          remarks[t._id] = existing.remarks || "";
        } else {
          records[t._id] = "present"; // Default state
          remarks[t._id] = "";
        }
      });

      setRecordsMap(records);
      setRemarksMap(remarks);
    } catch (e) {
      console.error("Error fetching staff attendance:", e);
      toast.error(e.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleStatusChange = (teacherId, status) => {
    setRecordsMap((prev) => ({ ...prev, [teacherId]: status }));
  };

  const handleRemarksChange = (teacherId, text) => {
    setRemarksMap((prev) => ({ ...prev, [teacherId]: text }));
  };

  const markAll = (status) => {
    const updated = {};
    teachers.forEach((t) => (updated[t._id] = status));
    setRecordsMap(updated);
    toast.success(`Marked all as ${status}`);
  };

  // Summary counts
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(recordsMap).filter((v) => v === s).length;
    return acc;
  }, {});

  const handleSave = async () => {
    if (teachers.length === 0) {
      toast.error("No active teachers to save attendance for");
      return;
    }

    setSaving(true);
    try {
      const recordsPayload = teachers.map((t) => ({
        teacherId: t._id,
        status: recordsMap[t._id] || "present",
        remarks: remarksMap[t._id] || "",
      }));

      await markStaffAttendance(recordsPayload, selectedDate);
      toast.success("Staff attendance saved successfully!");
      fetchAttendance(); // refresh
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to save staff attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upper Date Selector and Summary */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
        {/* Date Selector */}
        <div className="bg-white p-3.5 rounded-md border border-slate-100/80 shadow-sm flex items-center gap-3 flex-1">
          <Calendar size={18} className="text-indigo-600" />
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance Date</p>
            <input
              type="date"
              value={selectedDate}
              max={getLocalDateString()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-700 outline-none w-full bg-transparent mt-0.5 border-b border-transparent focus:border-indigo-500 py-0.5 transition"
            />
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="bg-white p-2.5 rounded-md border border-slate-100/80 shadow-sm grid grid-cols-5 gap-2 md:w-[60%] lg:w-[50%] shrink-0">
          <div className="text-center py-1 border-r border-slate-100 last:border-r-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Total</span>
            <span className="block text-sm font-bold text-slate-800 mt-0.5">{teachers.length}</span>
          </div>
          <div className="text-center py-1 border-r border-slate-100 last:border-r-0">
            <span className="text-[9px] text-emerald-500 font-bold uppercase">Present</span>
            <span className="block text-sm font-bold text-emerald-600 mt-0.5">{counts.present || 0}</span>
          </div>
          <div className="text-center py-1 border-r border-slate-100 last:border-r-0">
            <span className="text-[9px] text-rose-500 font-bold uppercase">Absent</span>
            <span className="block text-sm font-bold text-rose-600 mt-0.5">{counts.absent || 0}</span>
          </div>
          <div className="text-center py-1 border-r border-slate-100 last:border-r-0">
            <span className="text-[9px] text-amber-500 font-bold uppercase">Leave</span>
            <span className="block text-sm font-bold text-amber-600 mt-0.5">{counts.leave || 0}</span>
          </div>
          <div className="text-center py-1">
            <span className="text-[9px] text-blue-500 font-bold uppercase">Late</span>
            <span className="block text-sm font-bold text-blue-600 mt-0.5">{counts.late || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Banners */}
      <div className="bg-white p-3 rounded-md border border-slate-100/80 shadow-sm flex flex-wrap gap-2.5 items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} className="text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">Quick Mark All Active Staff:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => markAll("present")}
            className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition cursor-pointer"
          >
            All Present
          </button>
          <button
            onClick={() => markAll("absent")}
            className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition cursor-pointer"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Main Teachers Table Card */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span>Loading staff records...</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <AlertCircle size={24} />
            <span>No active teachers found in database</span>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                    <th className="px-4 py-2.5">Staff Details</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Attendance Status</th>
                    <th className="px-4 py-2.5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-slate-50/40 transition">
                      {/* Staff details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-650 ring-1 ring-slate-100 flex-shrink-0">
                            {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : teacher.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{teacher.fullName || teacher.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Emp ID: {teacher.employeeId || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                        {teacher.subject || "—"}
                      </td>

                      {/* Status Options */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {STATUS_OPTIONS.map((opt) => (
                            <StatusRadio
                              key={opt}
                              value={opt}
                              current={recordsMap[teacher._id]}
                              onChange={(val) => handleStatusChange(teacher._id, val)}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Add remarks..."
                          value={remarksMap[teacher._id] || ""}
                          onChange={(e) => handleRemarksChange(teacher._id, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-slate-650 bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="block md:hidden space-y-3 p-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white border border-slate-100 rounded-md p-3.5 space-y-3 shadow-sm hover:shadow transition duration-200"
                >
                  {/* Header: Avatar, Name, Subject */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-650 shrink-0">
                      {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : teacher.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-xs truncate">{teacher.fullName || teacher.name}</p>
                      <p className="text-[9px] text-slate-400">ID: {teacher.employeeId || "—"} • {teacher.subject || "No Subject"}</p>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attendance Status</p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <StatusRadio
                          key={opt}
                          value={opt}
                          current={recordsMap[teacher._id]}
                          onChange={(val) => handleStatusChange(teacher._id, val)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Remarks / Reason</p>
                    <input
                      type="text"
                      placeholder="Add remarks..."
                      value={remarksMap[teacher._id] || ""}
                      onChange={(e) => handleRemarksChange(teacher._id, e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md outline-none text-xs text-slate-650 bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || teachers.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving Attendance...
            </>
          ) : (
            <>
              <Save size={14} />
              Save Staff Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
