import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function AddTeacher() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-5">Add Teacher</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Teacher Name" />
        <Input label="Subject" />
        <Input label="Phone" />
        <Input label="Email" />
      </div>

      <div className="mt-5">
        <Button>Add Teacher</Button>
      </div>
    </Card>
  );
}
