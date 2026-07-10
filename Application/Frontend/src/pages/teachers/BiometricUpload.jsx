import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Save, ArrowRight } from "lucide-react";
import { getHeaders } from "../../api/Api_Helper.js";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function BiometricUpload() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewRecords, setPreviewRecords] = useState([]);
  
  const fileInputRef = useRef(null);

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
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsedLogs = parseCSVContent(text);

        if (parsedLogs.length === 0) {
          throw new Error("No valid data logs found in the CSV file");
        }

        // Call backend parsing endpoint
        const res = await fetch(`${API_BASE}/api/attendance/staff/biometric-parse`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ logs: parsedLogs }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to resolve biometric mapping");

        setPreviewRecords(result.data || []);
        toast.success(`Loaded ${result.data?.length || 0} mapped teacher logs!`);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error reading CSV file");
        setFileName("");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Helper to parse CSV strings cleanly
  const parseCSVContent = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length <= 1) return [];

    // Find headers
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/["']/g, ""));
    
    // Map header names to indices
    const idIndex = headers.findIndex(h => h.includes("id") || h.includes("user") || h.includes("enroll") || h.includes("number") || h.includes("no"));
    const timeIndex = headers.findIndex(h => h.includes("time") || h.includes("date") || h.includes("stamp"));

    if (idIndex === -1 || timeIndex === -1) {
      throw new Error("CSV columns must include 'User ID' (or Enroll Number) and 'Time'.");
    }

    const logs = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map(c => c.trim().replace(/["']/g, ""));
      if (cols.length <= Math.max(idIndex, timeIndex)) continue;

      const biometricId = cols[idIndex];
      const timestamp = cols[timeIndex];

      if (biometricId && timestamp) {
        logs.push({ biometricId, timestamp });
      }
    }
    return logs;
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: { files: [file] } });
      }
    }
  };

  // Allow admin to override resolved status inside preview table
  const handleStatusChange = (index, status) => {
    setPreviewRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status };
      return copy;
    });
  };

  // Allow admin to override remarks inside preview table
  const handleRemarksChange = (index, remarks) => {
    setPreviewRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], remarks };
      return copy;
    });
  };

  // Batch submit preview logs to the database using the existing StaffAttendance post method
  const handleSubmit = async () => {
    if (previewRecords.length === 0) return;
    setSaving(true);

    try {
      // Group records by Date to hit mark staff endpoint properly (it accepts records and date)
      // For simplicity, since biometric files usually have one date, or a few dates, we can group them:
      const dateGroups = {};
      previewRecords.forEach((r) => {
        if (!dateGroups[r.date]) dateGroups[r.date] = [];
        dateGroups[r.date].push({
          teacherId: r.teacherId,
          status: r.status,
          remarks: r.remarks,
        });
      });

      // Submit each date group batch to the existing Staff Attendance API
      for (const [dateVal, recordsList] of Object.entries(dateGroups)) {
        const res = await fetch(`${API_BASE}/api/attendance/staff`, {
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

      toast.success("Biometric attendance saved to database successfully!");
      setPreviewRecords([]);
      setFileName("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save attendance logs");
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
          Biometric USB Attendance Upload
        </h2>
        <p className="text-[10px] text-slate-400 font-medium mb-4">
          Upload the exported USB CSV file from your biometric machine. Standard header columns: "User ID" & "Time".
        </p>

        {/* Dropzone container */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-lg p-7 text-center transition cursor-pointer bg-slate-50/20 hover:bg-slate-50/50 flex flex-col items-center justify-center gap-2 select-none"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv"
          />
          <UploadCloud size={32} className="text-slate-400 animate-pulse" />
          {fileName ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5">
                <FileText size={14} />
                {fileName}
              </p>
              <p className="text-[9px] text-slate-400">Click or drag another file to replace</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700">Click to Browse or Drag File Here</p>
              <p className="text-[9px] text-slate-400">Supports exported biometric logs (.csv files)</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <Loader2 size={24} className="animate-spin text-indigo-600" />
          <span>Parsing CSV lines and mapping teacher IDs...</span>
        </div>
      )}

      {/* Preview Section */}
      {previewRecords.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-md border border-slate-100/80 shadow-sm flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">
                Attendance Preview ({previewRecords.length} Resolved Mappings)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase">
              Check-In threshold: 08:15 AM
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="bg-white rounded-md border border-slate-100/80 shadow-sm overflow-hidden hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                  <th className="px-4 py-2.5">Staff Details</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Check-In Time</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Status Preview</th>
                  <th className="px-4 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {previewRecords.map((rec, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-800">{rec.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Emp ID: {rec.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{rec.subject || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-650">{rec.time}</td>
                    <td className="px-4 py-3 text-slate-650">{rec.date}</td>
                    <td className="px-4 py-3">
                      <select
                        value={rec.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className={`px-2 py-1 border rounded outline-none text-xs font-bold bg-white cursor-pointer select-none transition-all
                          ${rec.status === "present" ? "border-emerald-200 text-emerald-700 bg-emerald-50/10 focus:border-emerald-500" : ""}
                          ${rec.status === "late" ? "border-blue-200 text-blue-700 bg-blue-50/10 focus:border-blue-500" : ""}
                          ${rec.status === "absent" ? "border-rose-200 text-rose-700 bg-rose-50/10 focus:border-rose-500" : ""}
                          ${rec.status === "leave" ? "border-amber-200 text-amber-700 bg-amber-50/10 focus:border-amber-500" : ""}
                        `}
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={rec.remarks || ""}
                        onChange={(e) => handleRemarksChange(index, e.target.value)}
                        placeholder="Add remarks..."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md outline-none text-xs text-slate-650 bg-white focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3.5">
            {previewRecords.map((rec, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-md p-3.5 space-y-3 shadow-sm hover:shadow transition duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100/60 pb-2.5">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{rec.name}</p>
                    <p className="text-[9px] text-slate-400">ID: {rec.employeeId} • {rec.subject || "Teacher"}</p>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-750 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                    {rec.time}
                  </span>
                </div>

                {/* Status and date selectors */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scan Date</span>
                    <span className="block text-xs font-semibold text-slate-700 py-1">{rec.date}</span>
                  </div>

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
                </div>

                {/* Remarks Input */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remarks</span>
                  <input
                    type="text"
                    value={rec.remarks || ""}
                    onChange={(e) => handleRemarksChange(index, e.target.value)}
                    placeholder="Add remarks..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md outline-none text-xs text-slate-650 bg-white focus:border-indigo-500"
                  />
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
                  Saving attendance logs...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Biometric Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
