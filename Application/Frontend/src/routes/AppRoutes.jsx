import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Students
import StudentPage from "../pages/students/StudentPage";
import StudentList from "../pages/students/StudentList";
import AddStudent from "../pages/students/AddStudent";
import EditStudent from "../pages/students/EditStudent";
import StudentProfile from "../pages/students/StudentProfile";

// Teachers
import TeacherPage from "../pages/teachers/TeacherPage";
import TeacherList from "../pages/teachers/TeacherList";
import AddTeacher from "../pages/teachers/AddTeacher";

// Classes
import ClassPage from "../pages/classes/ClassPage";
import ClassList from "../pages/classes/ClassList";
import AddClass from "../pages/classes/AddClass";
import ClassDetails from "../pages/classes/ClassDetails";

// Attendance
import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceList from "../pages/attendance/AttendanceList";
import MarkAttendance from "../pages/attendance/MarkAttendance";
import AttendanceReport from "../pages/attendance/AttendanceReport";

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

// Auth
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main Layout */}
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Students */}
        <Route path="/students" element={<StudentPage />}>
          <Route index element={<StudentList />} />
          <Route path="add" element={<AddStudent />} />
          <Route path="edit" element={<EditStudent />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Teachers */}
        <Route path="/teachers" element={<TeacherPage />}>
          <Route index element={<TeacherList />} />
          <Route path="add" element={<AddTeacher />} />
        </Route>

        {/* Classes */}
        <Route path="/classes" element={<ClassPage />}>
          <Route index element={<ClassList />} />
          <Route path="add" element={<AddClass />} />
          <Route path="details" element={<ClassDetails />} />
        </Route>

        {/* Attendance */}
        <Route path="/attendance" element={<AttendancePage />}>
          <Route index element={<AttendanceList />} />
          <Route path="mark" element={<MarkAttendance />} />
          <Route path="reports" element={<AttendanceReport />} />
        </Route>

        {/* Exams */}
        <Route path="/exams" element={<ExamPage />}>
          <Route index element={<ExamList />} />
          <Route path="add" element={<AddExam />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="results" element={<ResultReport />} />
        </Route>

        {/* Fees */}
        <Route path="/fees" element={<FeePage />}>
          <Route index element={<FeeList />} />
          <Route path="collection" element={<FeeCollection />} />
          <Route path="reports" element={<FeeReport />} />
        </Route>

        {/* Subjects */}
        <Route path="/subjects" element={<SubjectPage />}>
          <Route index element={<SubjectList />} />
          <Route path="add" element={<AddSubject />} />
        </Route>

        {/* Timetable */}
        <Route path="/timetable" element={<TimetablePage />}>
          <Route index element={<Timetable />} />
          <Route path="create" element={<CreateTimetable />} />
        </Route>

        {/* Notices */}
        <Route path="/notices" element={<NoticePage />}>
          <Route index element={<NoticeBoard />} />
          <Route path="create" element={<CreateNotice />} />
        </Route>

        {/* Users */}
        <Route path="/users" element={<UserPage />}>
          <Route index element={<UserList />} />
          <Route path="roles" element={<RolesPermissions />} />
        </Route>
      </Route>
    </Routes>
  );
}
