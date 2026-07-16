import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Save, ArrowRight, Info, RefreshCw, Calendar, Search } from "lucide-react";
import { getHeaders } from "../../api/Api_Helper.js";
import { getAllClasses } from "../../api/Class_Api.js";
import { getAllStudents } from "../../api/Student_Api.js";
import { getAttendanceByClassAndDate } from "../../api/Attendance_Api.js";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function StudentBiometricUpload() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewRecords, setPreviewRecords] = useState([]);
  
  const fileInputRef = useRef(null);

  // Get local timezone-safe date string (YYYY-MM-DD)
  const getLocalDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  };

  // State for Saved Attendance Log View
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [savedRecords, setSavedRecords] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Load classes initially
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses({ section: "all" });
        setClassesList(res.data || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch saved student attendance for class and date
  const fetchSavedAttendance = async () => {
    if (!selectedClass) {
      setSavedRecords([]);
      setClassStudents([]);
      return;
    }
    setLoadingSaved(true);
    try {
      // 1. Fetch students of that class
      const studentsRes = await getAllStudents({ currentClass: selectedClass });
      const studentsList = (studentsRes.data || []).filter(s => s.status === "active");
      setClassStudents(studentsList);

      // 2. Fetch marked attendance for this class and date
      const attendanceRes = await getAttendanceByClassAndDate(selectedClass, selectedDate);
      setSavedRecords(attendanceRes.data || []);
    } catch (e) {
      console.error("Error fetching saved student attendance:", e);
      toast.error(e.message || "Failed to load saved records");
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedAttendance();
  }, [selectedClass, selectedDate]);

  // Parse CSV file content on client-side and send logs to backend for name resolution
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files (.csv) are supported");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setPreviewRecords([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

        if (lines.length <= 1) {
          throw new Error("CSV file does not contain enough data rows.");
        }

        // Detect columns from header
        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
        
        // Find Column Indices
        const userIdIdx = headers.findIndex(h => h.includes("user id") || h.includes("enroll") || h.includes("id") || h.includes("pin"));
        const timeIdx = headers.findIndex(h => h.includes("time") || h.includes("date") || h.includes("timestamp"));

        if (userIdIdx === -1 || timeIdx === -1) {
          throw new Error("CSV must contain 'User ID' (Enroll No) and 'Time' columns.");
        }

        const logRows = [];
        for (let i = 1; i < lines.length; i++) {
          const rowParts = lines[i].split(",").map(part => part.trim().replace(/^["']|["']$/g, ""));
          if (rowParts.length <= Math.max(userIdIdx, timeIdx)) continue;

          const rawId = rowParts[userIdIdx];
          const rawTime = rowParts[timeIdx];

          if (rawId && rawTime) {
            logRows.push({
              biometricId: rawId,
              timestamp: rawTime
            });
          }
        }

        if (logRows.length === 0) {
          throw new Error("No valid biometric log rows could be extracted.");
        }

        // Call backend parsing API
        const parseRes = await fetch(`${API_BASE}/api/attendance/student/biometric-parse`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ logs: logRows }),
        });

        const parseResult = await parseRes.json();
        if (!parseRes.ok) {
          throw new Error(parseResult.message || "Failed to resolve biometric logs");
        }

        const resolvedData = parseResult.data || [];
        if (resolvedData.length === 0) {
          toast.warn("No active students matched the biometric machine IDs in the CSV file.");
        } else {
          toast.success(`Successfully resolved ${resolvedData.length} student check-in records!`);
        }
        setPreviewRecords(resolvedData);

      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to parse biometric file");
        setFileName("");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleStatusChange = (index, newStatus) => {
    setPreviewRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  const handleRemarksChange = (index, newRemarks) => {
    setPreviewRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: newRemarks };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (previewRecords.length === 0) return;
    setSaving(true);

    try {
      // Group records by Date to hit batch endpoints separately if logs contain multiple dates
      const dateGroups = {};
      previewRecords.forEach((r) => {
        if (!dateGroups[r.date]) dateGroups[r.date] = [];
        dateGroups[r.date].push({
          studentId: r.studentId,
          classId: r.classId,
          status: r.status,
          remarks: r.remarks,
          schoolSection: r.schoolSection
        });
      });

      // Submit each date group batch to the Student Biometric Save API
      for (const [dateVal, recordsList] of Object.entries(dateGroups)) {
        const res = await fetch(`${API_BASE}/api/attendance/student/biometric-save`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            date: dateVal,
            records: recordsList,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to submit attendance cycle");
      }

      toast.success("Student biometric attendance saved successfully!");
      setPreviewRecords([]);
      setFileName("");
      fetchSavedAttendance();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save student attendance logs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone Card */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
          <UploadCloud size={16} className="text-indigo-600" />
          Student Biometric USB Attendance Upload
        </h2>
        <p className="text-[11px] text-slate-400 font-medium mb-4">
          Select and parse your biometric machine USB logs to batch-mark student daily attendance status automatically.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50/50 hover:bg-slate-50"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          {loading ? (
            <>
              <Loader2 className="animate-spin text-indigo-600" size={28} />
              <span className="text-xs font-bold text-slate-650 mt-1">Resolving biometric records...</span>
            </>
          ) : fileName ? (
            <>
              <FileText className="text-indigo-600" size={28} />
              <span className="text-xs font-bold text-slate-700">{fileName}</span>
              <span className="text-[10px] text-slate-400 font-medium">Click to select a different CSV file</span>
            </>
          ) : (
            <>
              <UploadCloud className="text-slate-400" size={28} />
              <span className="text-xs font-bold text-slate-700">Choose CSV File</span>
              <span className="text-[10px] text-slate-400 font-semibold">Supports standard ZKTeco / biometric logs (.csv)</span>
            </>
          )}
        </div>
      </div>

      {/* Instructions card */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Info size={14} className="text-slate-400" />
          How to Use Biometric Attendance for Students
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-500 font-medium leading-relaxed">
          <div className="space-y-1.5 p-3 bg-slate-50/50 border border-slate-100/60 rounded-md">
            <span className="text-xs font-bold text-indigo-600 block">1. File Format Guide</span>
            <p>Export device records to a CSV file. The file must contain at least two primary columns:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] font-semibold text-slate-650">
              <li><strong>User ID</strong> / Enroll Number (which maps to Student's Biometric Machine ID)</li>
              <li><strong>Time</strong> (Check-in scan timestamp)</li>
            </ul>
          </div>
          <div className="space-y-1.5 p-3 bg-indigo-50/20 border border-indigo-50 rounded-md">
            <span className="text-xs font-bold text-indigo-700 block">2. Attendance Logic</span>
            <p>When you parse a CSV log, the system calculates status automatically based on thresholds:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] font-semibold text-slate-700">
              <li>Check-in at or before <strong>08:15 AM</strong> → Marked as <strong>Present</strong></li>
              <li>Check-in after <strong>08:15 AM</strong> → Marked as <strong>Late</strong></li>
              <li>You can manually override any status or add remarks in the preview below before saving.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {previewRecords.length > 0 && (
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-150 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Biometric Logs Preview ({previewRecords.length} rows)</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Review resolved students and adjust details before database upload</p>
            </div>
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">
              <CheckCircle2 size={12} />
              <span>Resolved successfully</span>
            </div>
          </div>

          {/* Desktop Preview Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-md hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                  <th className="px-4 py-2">Enroll No</th>
                  <th className="px-4 py-2">Student Name</th>
                  <th className="px-4 py-2">Class</th>
                  <th className="px-4 py-2">Roll No</th>
                  <th className="px-4 py-2">Scan Time</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 w-28">Status</th>
                  <th className="px-4 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {previewRecords.map((rec, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-500">{rec.biometricId}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800">{rec.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{rec.className}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-medium">{rec.rollNumber || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-bold">{rec.time}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-semibold">{rec.date}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={rec.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white font-medium focus:border-indigo-500"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={rec.remarks || ""}
                        onChange={(e) => handleRemarksChange(index, e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Preview Cards */}
          <div className="block md:hidden space-y-3">
            {previewRecords.map((rec, index) => (
              <div key={index} className="bg-slate-50/30 border border-slate-100 rounded-md p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{rec.name}</span>
                  <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                    ID: {rec.biometricId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold">
                  <div>Class: <span className="text-slate-600 font-bold">{rec.className}</span></div>
                  <div>Roll No: <span className="text-slate-600 font-bold">{rec.rollNumber || "—"}</span></div>
                  <div>Scan Time: <span className="text-indigo-600 font-bold">{rec.time}</span></div>
                  <div>Scan Date: <span className="text-slate-700 font-medium">{rec.date}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/50">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Override Status</span>
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white font-medium focus:border-indigo-500"
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remarks</span>
                    <input
                      type="text"
                      value={rec.remarks || ""}
                      onChange={(e) => handleRemarksChange(index, e.target.value)}
                      placeholder="Add remarks..."
                      className="w-full px-2 py-1.5 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Actions Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || loading || previewRecords.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#326080] hover:bg-[#284f6b] text-white rounded-md font-bold text-xs shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving student attendance logs...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Biometric Student Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Saved daily student attendance section */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-4 mt-6">
        <div className="flex items-center justify-between border-b border-slate-100/50 pb-3 mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#326080]" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Saved Daily Attendance Log</h3>
              <p className="text-[10px] text-slate-400 font-medium">Select a class and date to view marked attendance records</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md outline-none text-xs text-slate-650 bg-white focus:border-[#326080] font-medium"
            >
              <option value="">-- Select Class --</option>
              {classesList.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.section})</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getLocalDateString()}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md outline-none text-xs text-slate-650 bg-white focus:border-[#326080] font-medium"
            />
            
            <button
              onClick={fetchSavedAttendance}
              disabled={loadingSaved || !selectedClass}
              type="button"
              className="p-1.5 border border-slate-200 hover:border-[#326080] text-slate-500 hover:text-[#326080] rounded-md transition duration-150 disabled:opacity-50 cursor-pointer"
              title="Refresh log"
            >
              <RefreshCw size={14} className={loadingSaved ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loadingSaved ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 size={20} className="animate-spin text-[#326080]" />
            <span>Loading student database records...</span>
          </div>
        ) : !selectedClass ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-md border border-dashed border-slate-200">
            Please select a Class and Section from the dropdown above to view saved attendance logs.
          </div>
        ) : classStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active students found in this class.
          </div>
        ) : (
          <div className="space-y-4">
            {savedRecords.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50/40 border border-amber-100 rounded-md text-[11px] text-amber-700 font-medium">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>No attendance records saved for this class on {selectedDate}. You can upload the biometric CSV above or mark manually in the Mark Attendance section.</span>
              </div>
            )}

            {/* Desktop Table */}
            <div className="overflow-hidden border border-slate-100 rounded-md hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Roll No</th>
                    <th className="px-4 py-2.5">Biometric ID (Enroll No)</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Details / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {classStudents.map((s) => {
                    const rec = savedRecords.find((r) => {
                      const rStudentId = typeof r.student === "object" ? r.student?._id : r.student;
                      return String(rStudentId) === String(s._id);
                    });
                    
                    const status = rec ? rec.status : "not_marked";
                    const remarks = rec ? rec.remarks : "—";
                    
                    const badgeStyles = {
                      present: "bg-emerald-50 text-emerald-700 border-emerald-100",
                      late: "bg-blue-50 text-blue-700 border-blue-100",
                      absent: "bg-rose-50 text-rose-700 border-rose-100",
                      leave: "bg-amber-50 text-amber-700 border-amber-100",
                      not_marked: "bg-slate-50 text-slate-400 border-slate-100"
                    };

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/20 transition">
                        <td className="px-4 py-2.5 font-bold text-slate-800">
                          {s.Name || `${s.firstName || ""} ${s.lastName || ""}`.trim()}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-semibold">{s.rollNumber || "—"}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-semibold">{s.biometricId || "Not Registered"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold capitalize select-none ${badgeStyles[status]}`}>
                            {status === "not_marked" ? "Not Marked" : status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-[250px] truncate" title={remarks || ""}>
                          {remarks || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {classStudents.map((s) => {
                const rec = savedRecords.find((r) => {
                  const rStudentId = typeof r.student === "object" ? r.student?._id : r.student;
                  return String(rStudentId) === String(s._id);
                });
                
                const status = rec ? rec.status : "not_marked";
                const remarks = rec ? rec.remarks : "—";
                
                const badgeStyles = {
                  present: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  late: "bg-blue-50 text-blue-700 border-blue-100",
                  absent: "bg-rose-50 text-rose-700 border-rose-100",
                  leave: "bg-amber-50 text-amber-700 border-amber-100",
                  not_marked: "bg-slate-50 text-slate-400 border-slate-100"
                };

                return (
                  <div key={s._id} className="bg-white border border-slate-100 rounded-md p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {s.Name || `${s.firstName || ""} ${s.lastName || ""}`.trim()}
                      </span>
                      <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold capitalize ${badgeStyles[status]}`}>
                        {status === "not_marked" ? "Not Marked" : status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-semibold">
                      <div>Biometric ID: <span className="text-slate-600 font-bold">{s.biometricId || "Not Registered"}</span></div>
                      <div>Roll No: <span className="text-slate-600 font-bold">{s.rollNumber || "—"}</span></div>
                    </div>
                    {remarks && remarks !== "—" && (
                      <div className="text-[10px] bg-slate-50 border border-slate-100 rounded p-1.5 text-slate-500 font-medium leading-tight">
                        {remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
