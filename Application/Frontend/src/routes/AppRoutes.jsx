import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../pages/auth/useAuth.js";

import MainLayout from "../components/layouts/MainLayout";

// Auth
import Login from "../pages/auth/Login";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Students
import StudentPage from "../pages/students/StudentPage";
import StudentList from "../pages/students/StudentList";
import AddStudent from "../pages/students/AddStudent";

// Teachers
import TeacherPage from "../pages/teachers/TeacherPage";
import TeacherList from "../pages/teachers/TeacherList";
import AddTeacher from "../pages/teachers/AddTeacher";
import TeacherPayroll from "../pages/teachers/TeacherPayroll";

// Classes
import ClassPage from "../pages/classes/ClassPage";
import ClassList from "../pages/classes/ClassList";
import AddClass from "../pages/classes/AddClass";

// Attendance
import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceList from "../pages/attendance/AttendanceList";
import MarkAttendance from "../pages/attendance/MarkAttendance";
import AttendanceReport from "../pages/attendance/AttendanceReport";
import StaffAttendance from "../pages/attendance/StaffAttendance";

// Exams
import ExamPage from "../pages/exams/ExamPage";
import ExamList from "../pages/exams/ExamList";
import AddExam from "../pages/exams/AddExam";
import MarksEntry from "../pages/exams/MarksEntry";
import ResultReport from "../pages/exams/ResultReport";

// Fees
import FeePage from "../pages/fees/FeePage";
import FeeList from "../pages/fees/FeeList";
import FeeCollection from "../pages/fees/FeeCollection";
import FeeReport from "../pages/fees/FeeReport";

// Subjects
import SubjectPage from "../pages/subjects/SubjectPage";
import SubjectList from "../pages/subjects/SubjectList";
import AddSubject from "../pages/subjects/AddSubject";

// Timetable
import TimetablePage from "../pages/timetable/TimetablePage";
import Timetable from "../pages/timetable/Timetable";
import CreateTimetable from "../pages/timetable/CreateTimetable";

// Notices
import NoticePage from "../pages/notices/NoticePage";
import NoticeBoard from "../pages/notices/NoticeBoard";
import CreateNotice from "../pages/notices/CreateNotice";

// Users
import UserPage from "../pages/users/UserPage";
import UserList from "../pages/users/UserList";
import RolesPermissions from "../pages/users/RolesPermissions";

// Footer Links
import PrivacyPolicy from "../pages/footer/PrivacyPolicy";
import TermsOfService from "../pages/footer/TermsOfService";
import Support from "../pages/footer/Support";
import ContactUs from "../pages/footer/ContactUs";

// ── Protected Route — login nahi to /login pe bhejo ──────────────
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

// ── Page Permission Route — checks teacher permissions ───────────
function PageRoute({ pageKey, children }) {
  const { isAdmin, assignedPages } = useAuth();
  if (isAdmin) return children;
  if (assignedPages.includes(pageKey)) return children;
  return <Navigate to="/" replace />;
}

// ── Admin-Only Route ─────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return children;
  return <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route — sirf login */}
      <Route path="/login" element={<Login />} />

      {/* Sab protected routes MainLayout ke andar */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Students */}
        <Route path="/students" element={<PageRoute pageKey="students"><StudentPage /></PageRoute>}>
          <Route index element={<StudentList />} />
          <Route path="add" element={<AddStudent />} />
        </Route>

        {/* Teachers */}
        <Route path="/teachers" element={<PageRoute pageKey="teachers"><TeacherPage /></PageRoute>}>
          <Route index element={<TeacherList />} />
          <Route path="add" element={<AddTeacher />} />
          <Route path="payroll" element={<AdminRoute><TeacherPayroll /></AdminRoute>} />
        </Route>

        {/* Classes */}
        <Route path="/classes" element={<PageRoute pageKey="classes"><ClassPage /></PageRoute>}>
          <Route index element={<ClassList />} />
          <Route path="add" element={<AddClass />} />
        </Route>

        {/* Attendance */}
        <Route path="/attendance" element={<PageRoute pageKey="attendance"><AttendancePage /></PageRoute>}>
          <Route index element={<AttendanceList />} />
          <Route path="mark" element={<MarkAttendance />} />
          <Route path="reports" element={<AttendanceReport />} />
          <Route path="staff" element={<AdminRoute><StaffAttendance /></AdminRoute>} />
        </Route>

        {/* Exams */}
        <Route path="/exams" element={<PageRoute pageKey="exams"><ExamPage /></PageRoute>}>
          <Route index element={<ExamList />} />
          <Route path="add" element={<AddExam />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="results" element={<ResultReport />} />
        </Route>

        {/* Fees */}
        <Route path="/fees" element={<PageRoute pageKey="fees"><FeePage /></PageRoute>}>
          <Route index element={<FeeList />} />
          <Route path="collection" element={<FeeCollection />} />
          <Route path="reports" element={<FeeReport />} />
        </Route>

        {/* Subjects */}
        <Route path="/subjects" element={<PageRoute pageKey="subjects"><SubjectPage /></PageRoute>}>
          <Route index element={<SubjectList />} />
          <Route path="add" element={<AddSubject />} />
        </Route>

        {/* Timetable */}
        <Route path="/timetable" element={<PageRoute pageKey="timetable"><TimetablePage /></PageRoute>}>
          <Route index element={<Timetable />} />
          <Route path="create" element={<CreateTimetable />} />
          <Route path=":id" element={<CreateTimetable />} />
        </Route>

        {/* Notices */}
        <Route path="/notices" element={<PageRoute pageKey="notices"><NoticePage /></PageRoute>}>
          <Route index element={<NoticeBoard />} />
          <Route path="create" element={<CreateNotice />} />
          <Route path="edit/:id" element={<CreateNotice />} />
        </Route>

        {/* Users — sirf admin dekhe */}
        <Route path="/users" element={<AdminRoute><UserPage /></AdminRoute>}>
          <Route index element={<UserList />} />
          <Route path="roles" element={<RolesPermissions />} />
        </Route>

        {/* Footer Links */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>

      {/* Koi bhi unknown route — login pe bhejo */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}