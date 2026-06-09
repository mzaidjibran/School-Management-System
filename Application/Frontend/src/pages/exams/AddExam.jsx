import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function AddExam() {
  return (
    <Card>
      <Input label="Exam Name" />
      <Input label="Date" type="date" />

      <div className="mt-4">
        <Button>Create Exam</Button>
      </div>
    </Card>
  );
}
