import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function ClassDetails() {
  const classInfo = {
    name: "Class 10",
    section: "A",
    classTeacher: "Ali Raza",
    totalStudents: 35,
    roomNo: "101",
  };

  return (
    <div className="space-y-6">
      <Card title="Class Details">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Class Name</p>
            <p className="font-semibold">{classInfo.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Section</p>
            <p className="font-semibold">{classInfo.section}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Class Teacher</p>
            <p className="font-semibold">{classInfo.classTeacher}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="font-semibold">{classInfo.totalStudents}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Room Number</p>
            <p className="font-semibold">{classInfo.roomNo}</p>
          </div>
        </div>
      </Card>

      <Card title="Students In Class">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Roll No</th>
                <th className="text-left p-3">Student Name</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-3">101</td>
                <td className="p-3">Ahmed Ali</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded">
                    Active
                  </span>
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3">102</td>
                <td className="p-3">Usman Khan</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded">
                    Active
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3">103</td>
                <td className="p-3">Hamza Ahmed</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <Button>View Full Class Report</Button>
        </div>
      </Card>
    </div>
  );
}
