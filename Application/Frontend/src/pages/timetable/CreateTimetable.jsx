import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";
import {
  FaSave, FaPrint, FaCopy, FaUndo, FaTimes,
  FaCalendarAlt, FaPlus, FaTrash, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { createOrUpdateTimetable, getClassTimetable } from "../../api/TimeTable_Api.js";
import { getAllClasses } from "../../Api/Class_Api.js";
import { getAllSubjects } from "../../api/Subject_Api.js";
import { getAllTeachers } from "../../Api/Teacher_Api.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SLOTS = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00"];

const buildGrid = (slots) => {
  const grid = {};
  DAYS.forEach((day) => {
    grid[day] = {};
    slots.forEach((slot) => { grid[day][slot] = { subject: "", teacher: "", room: "" }; });
  });
  return grid;
};

const backendToGrid = (timetableArr = [], slots) => {
  const grid = buildGrid(slots);
  timetableArr.forEach(({ day, periods = [] }) => {
    periods.forEach((p) => {
      const slot = `${p.startTime}-${p.endTime}`;
      if (grid[day]) {
        grid[day][slot] = {
          subject: p.subject || "",
          teacher: p.teacher?._id || p.teacher || "",
          room: p.room || "",
        };
      }
    });
  });
  return grid;
};

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
        teacher: cell.teacher || undefined,
        startTime,
        endTime,
        room: cell.room || undefined,
        type: "lecture",
      });
    });
    if (periods.length > 0) result.push({ class: classId, day, periods, session });
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

// ─── Cell Editor (used in mobile day view) ───────────────────────────────────
const CellEditor = ({ cell, day, slot, subjects, teachers, onChange }) => {
  const selCls = "w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300";
  return (
    <div className="space-y-1.5">
      <select value={cell.subject} onChange={(e) => onChange(day, slot, "subject", e.target.value)} className={selCls}>
        <option value="">— Subject</option>
        {subjects.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
      </select>
      <select value={cell.teacher} onChange={(e) => onChange(day, slot, "teacher", e.target.value)} className={selCls}>
        <option value="">— Teacher</option>
        {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
      </select>
      <input
        type="text"
        value={cell.room}
        onChange={(e) => onChange(day, slot, "room", e.target.value)}
        placeholder="Room"
        className={selCls}
      />
    </div>
  );
};

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

  // Mobile: which day is selected in the day-view
  const [activeDay, setActiveDay] = useState(0);

  // Dropdowns
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ── Load classes, subjects, teachers with auth headers ─────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          getAllClasses(),
          getAllSubjects(),
          getAllTeachers(),
        ]);
        setClasses(classRes.data || []);
        const subs = subjectRes.data || [];
        setAllSubjects(subs);
        setFilteredSubjects(subs); // initially show all
        setTeachers(teacherRes.data || []);
      } catch (err) {
        toast.error("Dropdowns load error: " + err.message);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  // ── When class changes, filter subjects for that class ─────────────────────
  useEffect(() => {
    if (!form.classId) {
      setFilteredSubjects(allSubjects);
      return;
    }
    const filtered = allSubjects.filter((s) => {
      if (Array.isArray(s.class)) return s.class.some((c) => (c._id || c) === form.classId);
      return (s.class?._id || s.class) === form.classId;
    });
    setFilteredSubjects(filtered.length > 0 ? filtered : allSubjects);
  }, [form.classId, allSubjects]);

  // ── If edit mode: load existing timetable ──────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    const loadExisting = async () => {
      setFetchLoading(true);
      try {
        const res = await getClassTimetable(id);
        const existing = res.timetable || [];
        const existingSlots = [
          ...new Set(existing.flatMap(({ periods = [] }) => periods.map((p) => `${p.startTime}-${p.endTime}`))),
        ].sort();
        const mergedSlots = existingSlots.length > 0 ? existingSlots : DEFAULT_SLOTS;
        setSlots(mergedSlots);
        setTimetable(backendToGrid(existing, mergedSlots));
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
        toast.error("Timetable load error: " + err.message);
      } finally {
        setFetchLoading(false);
      }
    };
    loadExisting();
  }, [isEdit, id]);

  // ── Slot management ────────────────────────────────────────────────────────
  const validateSlotFormat = (val) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(val.trim());

  const addSlot = () => {
    const s = newSlot.trim();
    if (!s) { setSlotError("Enter a time slot"); return; }
    if (!validateSlotFormat(s)) { setSlotError("Format: HH:MM-HH:MM  e.g. 14:00-15:00"); return; }
    if (slots.includes(s)) { setSlotError("Slot already exists"); return; }
    const updated = [...slots, s].sort();
    setSlots(updated);
    setTimetable((prev) => {
      const next = { ...prev };
      DAYS.forEach((day) => { next[day] = { ...next[day], [s]: { subject: "", teacher: "", room: "" } }; });
      return next;
    });
    setNewSlot("");
    setSlotError("");
  };

  const removeSlot = (slot) => {
    if (slots.length <= 1) { toast.error("At least one slot required"); return; }
    const updated = slots.filter((s) => s !== slot);
    setSlots(updated);
    setTimetable((prev) => {
      const next = { ...prev };
      DAYS.forEach((day) => { const d = { ...next[day] }; delete d[slot]; next[day] = d; });
      return next;
    });
  };

  // ── Cell change ────────────────────────────────────────────────────────────
  const handleCellChange = (day, slot, field, value) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: { ...prev[day][slot], [field]: value } },
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      const selected = classes.find((c) => c._id === value);
      setForm((prev) => ({ ...prev, classId: value, className: selected?.name || "", section: selected?.section || "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.classId) { toast.error("Please select a class"); return; }
    const entries = gridToBackend(timetable, slots, form.classId, form.academicYear);
    if (entries.length === 0) { toast.error("Koi bhi subject assign nahi kiya"); return; }
    setLoading(true);
    try {
      await Promise.all(entries.map((entry) => createOrUpdateTimetable(entry)));
      toast.success("Timetable saved successfully!");
      navigate("/timetable");
    } catch (err) {
      toast.error("Save error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPreviewMode(true);
    setTimeout(() => { window.print(); setPreviewMode(false); }, 200);
  };

  const handleDuplicate = () => {
    setForm((prev) => ({ ...prev, classId: "", className: "", section: "" }));
    toast.success("Grid copied. Select a new class to save as new timetable.");
  };

  const handleReset = () => {
    confirmToast("Reset all unsaved changes?", () => {
      setSlots([...DEFAULT_SLOTS]);
      setTimetable(buildGrid(DEFAULT_SLOTS));
      setForm({ classId: "", className: "", section: "", academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` });
      toast.success("Grid reset.");
    });
  };

  const cellSelect = "w-full px-1.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 leading-tight";

  if (fetchLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <style>{printStyles}</style>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">
            <span className="cursor-pointer hover:text-indigo-600" onClick={() => navigate("/timetable")}>Timetable</span>
            {" / "}
            <span className="text-indigo-600">{isEdit ? "Edit" : "Create"} Timetable</span>
          </p>
          <h1 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Timetable" : "Create Timetable"}</h1>
          <p className="text-sm text-slate-500">Assign subjects, teachers, and rooms per slot</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <FaSave className="text-xs" /> {loading ? "Saving…" : "Save"}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
            <FaPrint className="text-xs" /> Print
          </button>
          <button onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
            <FaCopy className="text-xs" /> Duplicate
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
            <FaUndo className="text-xs" /> Reset
          </button>
          <button onClick={() => navigate("/timetable")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            <FaTimes className="text-xs" /> Cancel
          </button>
        </div>
      </div>

      {/* ── Class Information ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 p-5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Class Information</h2>
        {loadingDropdowns ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
            Loading classes, subjects, teachers...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Class */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Class <span className="text-rose-500">*</span></label>
              <select name="classId" value={form.classId} onChange={handleFormChange} disabled={isEdit}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50">
                <option value="">Select Class…</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ""}</option>)}
              </select>
              {classes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No classes found. Please add classes first.</p>
              )}
            </div>
            {/* Section — auto filled */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Section</label>
              <input type="text" value={form.section} readOnly placeholder="Auto-filled from class"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            {/* Academic Year */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Academic Year</label>
              <input type="text" name="academicYear" value={form.academicYear} onChange={handleFormChange}
                placeholder="2025-2026"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        )}
        {/* Subject/Teacher count info */}
        {!loadingDropdowns && form.classId && (
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">
              {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""} for this class
            </span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
              {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} available
            </span>
          </div>
        )}
      </div>

      {/* ── Time Slots Manager ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 p-5 no-print">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Time Slots</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {slots.map((slot) => (
            <div key={slot} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-medium text-indigo-700">
              {slot}
              <button onClick={() => removeSlot(slot)} className="text-indigo-400 hover:text-rose-500 transition-colors ml-0.5">
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={newSlot} onChange={(e) => { setNewSlot(e.target.value); setSlotError(""); }}
            onKeyDown={(e) => e.key === "Enter" && addSlot()}
            placeholder="HH:MM-HH:MM  e.g. 14:00-15:00"
            className={`h-9 px-3 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full sm:w-56 ${slotError ? "border-rose-400" : "border-slate-200"}`} />
          <button onClick={addSlot}
            className="h-9 px-4 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5 justify-center">
            <FaPlus className="text-xs" /> Add Slot
          </button>
        </div>
        {slotError && <p className="text-rose-500 text-xs mt-1">{slotError}</p>}
      </div>

      {/* ── Timetable Grid ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Timetable Grid</h2>
        </div>

        {/* ── Desktop Grid (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap w-32">Time Slot</th>
                {DAYS.map((day) => (
                  <th key={day} className="py-2.5 px-2 text-left text-xs font-semibold text-slate-600 min-w-[140px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr><td colSpan={DAYS.length + 1} className="py-10 text-center text-sm text-slate-400">No time slots. Add one above.</td></tr>
              ) : (
                slots.map((slot, si) => (
                  <tr key={slot} className={`border-b border-slate-100 ${si % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                    <td className="py-2 px-3 align-middle">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">{slot}</span>
                        <button onClick={() => removeSlot(slot)} title="Remove slot" className="text-slate-300 hover:text-rose-400 transition-colors shrink-0 no-print">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const cell = timetable[day]?.[slot] || { subject: "", teacher: "", room: "" };
                      return (
                        <td key={day} className={`py-1.5 px-1.5 align-top ${cell.subject ? "bg-indigo-50/40" : ""}`}>
                          <div className="space-y-1">
                            <select value={cell.subject} onChange={(e) => handleCellChange(day, slot, "subject", e.target.value)} className={cellSelect}>
                              <option value="">— Subject</option>
                              {filteredSubjects.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                            </select>
                            <select value={cell.teacher} onChange={(e) => handleCellChange(day, slot, "teacher", e.target.value)} className={cellSelect}>
                              <option value="">— Teacher</option>
                              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            <input type="text" value={cell.room} onChange={(e) => handleCellChange(day, slot, "room", e.target.value)} placeholder="Room" className={cellSelect} />
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

        {/* ── Mobile Day-by-Day View (< md) ── */}
        <div className="block md:hidden">
          {/* Day Navigator */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-indigo-50">
            <button onClick={() => setActiveDay((d) => Math.max(0, d - 1))} disabled={activeDay === 0}
              className="p-2 rounded-md text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition">
              <FaChevronLeft className="text-xs" />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-indigo-700">{DAYS[activeDay]}</p>
              <p className="text-xs text-indigo-400">{activeDay + 1} / {DAYS.length}</p>
            </div>
            <button onClick={() => setActiveDay((d) => Math.min(DAYS.length - 1, d + 1))} disabled={activeDay === DAYS.length - 1}
              className="p-2 rounded-md text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition">
              <FaChevronRight className="text-xs" />
            </button>
          </div>
          {/* Day tab buttons */}
          <div className="flex overflow-x-auto px-4 py-2 gap-1.5 border-b border-slate-100 no-scrollbar">
            {DAYS.map((day, idx) => {
              const hasData = slots.some((sl) => timetable[day]?.[sl]?.subject);
              return (
                <button key={day} onClick={() => setActiveDay(idx)}
                  className={`shrink-0 px-2.5 py-1 text-xs rounded-md font-medium transition ${activeDay === idx ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {day.slice(0, 3)}{hasData ? " •" : ""}
                </button>
              );
            })}
          </div>
          {/* Slots for active day */}
          <div className="p-4 space-y-3">
            {slots.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">No time slots. Add one above.</p>
            ) : (
              slots.map((slot) => {
                const cell = timetable[DAYS[activeDay]]?.[slot] || { subject: "", teacher: "", room: "" };
                return (
                  <div key={slot} className={`rounded-md border p-3 ${cell.subject ? "border-indigo-200 bg-indigo-50/40" : "border-slate-100 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">{slot}</span>
                      <button onClick={() => removeSlot(slot)} className="text-slate-300 hover:text-rose-400 transition no-print">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    <CellEditor
                      cell={cell}
                      day={DAYS[activeDay]}
                      slot={slot}
                      subjects={filteredSubjects}
                      teachers={teachers}
                      onChange={handleCellChange}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Print Preview ── */}
      {previewMode && (
        <div id="print-timetable" className="fixed top-0 left-0 w-full bg-white p-8" style={{ zIndex: -1 }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center border-b pb-4">
              <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
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
                  {DAYS.map((d) => <th key={d} className="border p-2">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot}>
                    <td className="border p-2 font-semibold text-indigo-700 bg-indigo-50">{slot}</td>
                    {DAYS.map((day) => (
                      <td key={day} className="border p-2">
                        <div className="font-medium">{timetable[day]?.[slot]?.subject || "—"}</div>
                        {timetable[day]?.[slot]?.subject && (
                          <div className="text-slate-400">
                            {teachers.find((t) => t._id === timetable[day][slot].teacher)?.name || ""} / {timetable[day]?.[slot]?.room}
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
    </div>
  );
}