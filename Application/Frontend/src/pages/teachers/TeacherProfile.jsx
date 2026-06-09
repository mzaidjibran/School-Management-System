import Card from "../../components/ui/Card";

export default function TeacherProfile() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Teacher Profile</h2>

      <div className="mt-4">
        <p>Name: Ali</p>
        <p>Subject: Mathematics</p>
        <p>Phone: 03001234567</p>
      </div>
    </Card>
  );
}
