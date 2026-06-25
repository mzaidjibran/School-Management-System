import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSave,
  FaPrint,
  FaCopy,
  FaUndo,
  FaTimes,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import {
  createOrUpdateTimetable,
  getClassTimetable,
} from "../../api/Timetable_Api.js";

const API_BASE = "http://127.0.0.1:3000";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
];

// Build empty grid
const buildGrid = (slots) => {
  const grid = {};
  DAYS.forEach((day) => {
    grid[day] = {};
    slots.forEach((slot) => {
      grid[day][slot] = { subject: "", teacher: "", room: "" };
    });
  });
  return grid;
};

// Backend array → frontend grid
// backend: [{day, periods:[{startTime,endTime,subject,teacher,room}]}]
const backendToGrid = (timetableArr = [], slots) => {
  const grid = buildGrid(slots);
  timetableArr.forEach(({ day, periods = [] }) => {
    periods.forEach((p) => {
      const slot = `${p.startTime}-${p.endTime}`;
      if (grid[day]) {
        grid[day][slot] = {
          subject: p.subject || "",
          teacher: p.teacher?.name || p.teacher || "",
          room: p.room || "",
        };
      }
    });
  });
  return grid;
};

// Frontend grid → backend format (array of day documents)
// One document per day, only days that have at least one filled period
const gridToBackend = (grid, slots, classId, session) => {
  const result = [];
  DAYS.forEach((day, dayIdx) => {
    const periods = [];
    slots.forEach((slot, idx) => {
      const cell = grid[day]?.[slot];
      if (!cell || !cell.subject) return;
      const [startTime, endTime] = slot.split("-");
      periods.push({
        periodNumber: idx + 1,
        subject: cell.subject,
        teacher: cell.teacher || undefined,   // teacher ID or name
        startTime,
        endTime,
        room: cell.room || undefined,
        type: "lecture",
      });
    });
    if (periods.length > 0) {
      result.push({ class: classId, day, periods, session });
    }
  });
  return result;
};

const printStyles = `
  @media print {
    body * { visibility: hidden; }
    #print-timetable, #print-timetable * { visibility: visible; }
    #print-timetable { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; }
    .no-print { display: none; }
  }
`;

export default function CreateTimetable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "create";

  const [slots, setSlots] = useState([...DEFAULT_SLOTS]);
  const [newSlot, setNewSlot] = useState("");
  const [slotError, setSlotError] = useState("");
  const [timetable, setTimetable] = useState(() => buildGrid(DEFAULT_SLOTS));
  const [form, setForm] = useState({
    classId: isEdit ? id : "",
    className: "",
    section: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Dropdowns
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ── Load classes, subjects, teachers ──────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          fetch(`${API_BASE}/api/classes`, {
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/subjects`, {
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/teachers`, {
            headers: { "Content-Type": "application/json" },
          }),
        ]);
        const classJson = await classRes.json();
        const subjectJson = await subjectRes.json();
        const teacherJson = await teacherRes.json();

        setClasses(classJson.data || classJson.classes || []);
        setSubjects(subjectJson.data || subjectJson.subjects || []);
        setTeachers(teacherJson.data || teacherJson.teachers || []);
      } catch (err) {
        showToast("Dropdowns load error: " + err.message, "error");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  // ── If edit mode: load existing timetable for this class ──────
  useEffect(() => {
    if (!isEdit) return;
    const loadExisting = async () => {
      setFetchLoading(true);
      try {
        const res = await getClassTimetable(id);
        const existing = res.timetable || [];

        // Derive unique slots from existing periods
        const existingSlots = [
          ...new Set(
            existing.flatMap(({ periods = [] }) =>
              periods.map((p) => `${p.startTime}-${p.endTime}`)
            )
          ),
        ].sort();

        const mergedSlots =
          existingSlots.length > 0 ? existingSlots : DEFAULT_SLOTS;
        setSlots(mergedSlots);

        const grid = backendToGrid(existing, mergedSlots);
        setTimetable(grid);

        // Set class info from first entry
        if (existing[0]) {
          setForm((prev) => ({
            ...prev,
            classId: id,
            className: existing[0].class?.name || "",
            section: existing[0].class?.section || "",
            academicYear: existing[0].session || prev.academicYear,
          }));
        }
      } catch (err) {
        showToast("Timetable load error: " + err.message, "error");
      } finally {
        setFetchLoading(false);
      }
    };
    loadExisting();
  }, [isEdit, id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  // ── Slot management ──────────────────────────────────────────
  const validateSlotFormat = (val) =>
    /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(val.trim());

  const addSlot = () => {
    const s = newSlot.trim();
    if (!s) { setSlotError("Enter a time slot"); return; }
    if (!validateSlotFormat(s)) {
      setSlotError("Format: HH:MM-HH:MM  e.g. 14:00-15:00");
      return;
    }
    if (slots.includes(s)) { setSlotError("Slot already exists"); return; }
    const updated = [...slots, s].sort();
    setSlots(updated);
    setTimetable((prev) => {
      const next = { ...prev };
      DAYS.forEach((day) => {
        next[day] = { ...next[day], [s]: { subject: "", teacher: "", room: "" } };
      });
      return next;
    });
    setNewSlot("");
    setSlotError("");
  };

  const removeSlot = (slot) => {
    if (slots.length <= 1) { showToast("At least one slot required", "error"); return; }
    const updated = slots.filter((s) => s !== slot);
    setSlots(updated);
    setTimetable((prev) => {
      const next = { ...prev };
      DAYS.forEach((day) => {
        const d = { ...next[day] };
        delete d[slot];
        next[day] = d;
      });
      return next;
    });
  };

  // ── Cell change ───────────────────────────────────────────────
  const handleCellChange = (day, slot, field, value) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: { ...prev[day][slot], [field]: value },
      },
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      const selected = classes.find((c) => c._id === value);
      setForm((prev) => ({
        ...prev,
        classId: value,
        className: selected?.name || "",
        section: selected?.section || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.classId) {
      showToast("Please select a class", "error");
      return;
    }

    const entries = gridToBackend(
      timetable,
      slots,
      form.classId,
      form.academicYear
    );

    if (entries.length === 0) {
      showToast("Koi bhi subject assign nahi kiya", "error");
      return;
    }

    setLoading(true);
    try {
      // Save each day separately (backend: upsert per class+day+session)
      await Promise.all(entries.map((entry) => createOrUpdateTimetable(entry)));
      showToast("Timetable saved successfully!");
      setTimeout(() => navigate("/timetable"), 1500);
    } catch (err) {
      showToast("Save error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPreviewMode(true);
    setTimeout(() => {
      window.print();
      setPreviewMode(false);
    }, 200);
  };

  const handleDuplicate = () => {
    setForm((prev) => ({
      ...prev,
      classId: "",
      className: "",
      section: "",
    }));
    showToast("Grid copied. Select a new class to save as new timetable.");
  };

  const handleReset = () => {
    if (window.confirm("Reset all unsaved changes?")) {
      setSlots([...DEFAULT_SLOTS]);
      setTimetable(buildGrid(DEFAULT_SLOTS));
      setForm({
        classId: "",
        className: "",
        section: "",
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      });
    }
  };

  const cellSelect =
    "w-full px-1.5 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 leading-tight";

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading timetable...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <style>{printStyles}</style>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span
            className="hover:text-indigo-600 cursor-pointer"
            onClick={() => navigate("/timetable")}
          >
            Timetable
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">
            {isEdit ? "Edit" : "Create"} Timetable
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <FaCalendarAlt className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isEdit ? "Edit Timetable" : "Create Timetable"}
              </h1>
              <p className="text-slate-500 text-sm">
                Assign subjects, teachers, and rooms per slot
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <FaSave className="text-xs" />
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <FaPrint className="text-xs" /> Print
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <FaCopy className="text-xs" /> Duplicate
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <FaUndo className="text-xs" /> Reset
            </button>
            <button
              onClick={() => navigate("/timetable")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FaTimes className="text-xs" /> Cancel
            </button>
          </div>
        </div>

        {/* Class Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Class Information
          </h2>
          {loadingDropdowns ? (
            <div className="text-sm text-slate-400">Loading classes...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Class dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Class <span className="text-rose-500">*</span>
                </label>
                <select
                  name="classId"
                  value={form.classId}
                  onChange={handleFormChange}
                  disabled={isEdit}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50"
                >
                  <option value="">Select Class…</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.section ? ` - ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section — auto filled from class */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  value={form.section}
                  readOnly
                  placeholder="Auto-filled from class"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleFormChange}
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Time Slots Manager */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5 no-print">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Time Slots
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {slots.map((slot) => (
              <div
                key={slot}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700"
              >
                {slot}
                <button
                  onClick={() => removeSlot(slot)}
                  className="text-indigo-400 hover:text-rose-500 transition-colors ml-0.5"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) => {
                    setNewSlot(e.target.value);
                    setSlotError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addSlot()}
                  placeholder="HH:MM-HH:MM  e.g. 14:00-15:00"
                  className={`h-8 px-3 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56 ${
                    slotError ? "border-rose-400" : "border-slate-200"
                  }`}
                />
                <button
                  onClick={addSlot}
                  className="h-8 px-3 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <FaPlus className="text-xs" /> Add Slot
                </button>
              </div>
              {slotError && (
                <p className="text-rose-500 text-xs">{slotError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Timetable Grid
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap w-32">
                    Time Slot
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="py-2.5 px-2 text-left text-xs font-semibold text-slate-600 min-w-[130px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={DAYS.length + 1}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No time slots. Add one above.
                    </td>
                  </tr>
                ) : (
                  slots.map((slot, si) => (
                    <tr
                      key={slot}
                      className={`border-b border-slate-100 ${
                        si % 2 === 0 ? "" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="py-2 px-3 align-middle">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {slot}
                          </span>
                          <button
                            onClick={() => removeSlot(slot)}
                            title="Remove slot"
                            className="text-slate-300 hover:text-rose-400 transition-colors shrink-0 no-print"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                      {DAYS.map((day) => {
                        const cell = timetable[day]?.[slot] || {
                          subject: "",
                          teacher: "",
                          room: "",
                        };
                        const filled = !!cell.subject;
                        return (
                          <td
                            key={day}
                            className={`py-1.5 px-1.5 align-top ${
                              filled ? "bg-indigo-50/40" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              {/* Subject dropdown from API */}
                              <select
                                value={cell.subject}
                                onChange={(e) =>
                                  handleCellChange(day, slot, "subject", e.target.value)
                                }
                                className={cellSelect}
                              >
                                <option value="">— Subject</option>
                                {subjects.map((s) => (
                                  <option key={s._id} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>

                              {/* Teacher dropdown from API */}
                              <select
                                value={cell.teacher}
                                onChange={(e) =>
                                  handleCellChange(day, slot, "teacher", e.target.value)
                                }
                                className={cellSelect}
                              >
                                <option value="">— Teacher</option>
                                {teachers.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>

                              {/* Room — free text */}
                              <input
                                type="text"
                                value={cell.room}
                                onChange={(e) =>
                                  handleCellChange(day, slot, "room", e.target.value)
                                }
                                placeholder="Room"
                                className={cellSelect}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Preview */}
      {previewMode && (
        <div
          id="print-timetable"
          className="fixed top-0 left-0 w-full bg-white p-8"
          style={{ zIndex: -1 }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center border-b pb-4">
              <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <h2 className="text-lg font-bold mt-2">School Management System</h2>
              <p className="text-xs text-slate-500">Timetable</p>
            </div>
            <div className="grid grid-cols-2 gap-2 my-4 text-sm">
              <div><strong>Class:</strong> {form.className}</div>
              <div><strong>Section:</strong> {form.section}</div>
              <div><strong>Academic Year:</strong> {form.academicYear}</div>
              <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
            </div>
            <table className="w-full border-collapse border text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2">Time</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border p-2">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot}>
                    <td className="border p-2 font-semibold text-indigo-700 bg-indigo-50">
                      {slot}
                    </td>
                    {DAYS.map((day) => (
                      <td key={day} className="border p-2">
                        <div className="font-medium">
                          {timetable[day]?.[slot]?.subject || "—"}
                        </div>
                        {timetable[day]?.[slot]?.subject && (
                          <div className="text-slate-400">
                            {teachers.find(
                              (t) => t._id === timetable[day][slot].teacher
                            )?.name || timetable[day][slot].teacher}{" "}
                            / {timetable[day]?.[slot]?.room}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.msg && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-sm px-5 py-3 rounded-xl shadow-lg ${
            toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}