import { NavLink, Routes, Route } from "react-router-dom";

import StudentList from "./StudentList";
import AddStudent from "./AddStudent";
import EditStudent from "./EditStudent";
import StudentProfile from "./StudentProfile";

export default function StudentPage() {
  return (
    <div>
      <h1>Students</h1>

      <div className="sub-tabs">
        <NavLink to="">All Students</NavLink>
        <NavLink to="add">Add Student</NavLink>
        <NavLink to="edit">Edit Student</NavLink>
        <NavLink to="profile">Profile</NavLink>
      </div>

      <Routes>
        <Route index element={<StudentList />} />
        <Route path="add" element={<AddStudent />} />
        <Route path="edit" element={<EditStudent />} />
        <Route path="profile" element={<StudentProfile />} />
      </Routes>
    </div>
  );
}
