import Card from "../../components/ui/Card";

export default function RolesPermissions() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Roles & Permissions</h2>

      <div className="space-y-3">
        <div>Admin</div>
        <div>Teacher</div>
        <div>Student</div>
        <div>Accountant</div>
      </div>
    </Card>
  );
}
