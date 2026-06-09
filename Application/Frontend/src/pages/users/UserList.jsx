import Card from "../../components/ui/Card";

export default function UserList() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Users</h2>

      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Admin User</td>
            <td>admin@test.com</td>
            <td>Admin</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
