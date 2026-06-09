export default function StudentList() {
  const students = [
    {
      id: 1,
      name: "Ali Khan",
      class: "10th",
      rollNo: "101",
    },
    {
      id: 2,
      name: "Ahmed",
      class: "9th",
      rollNo: "102",
    },
  ];

  return (
    <div>
      <h2>All Students</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Roll No</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>{student.rollNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
