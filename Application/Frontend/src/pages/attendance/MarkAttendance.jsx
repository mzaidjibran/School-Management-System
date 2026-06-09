import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function MarkAttendance() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>

      <div className="space-y-3">
        <label className="flex gap-3">
          <input type="checkbox" />
          Ali Khan
        </label>

        <label className="flex gap-3">
          <input type="checkbox" />
          Ahmed Ali
        </label>
      </div>

      <div className="mt-5">
        <Button>Save Attendance</Button>
      </div>
    </Card>
  );
}
