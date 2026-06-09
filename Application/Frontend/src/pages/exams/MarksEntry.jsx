import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function MarksEntry() {
  return (
    <Card>
      <Input label="Student Name" />
      <Input label="Marks" />

      <div className="mt-4">
        <Button>Save Marks</Button>
      </div>
    </Card>
  );
}
