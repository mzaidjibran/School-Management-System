import Card from "../../components/ui/Card";

export default function TeacherList() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Teachers</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subject</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Ali</td>
              <td>Math</td>
              <td>03001234567</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
