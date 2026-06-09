import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function AddSubject() {
  return (
    <Card>
      <Input label="Subject Name" />

      <div className="mt-4">
        <Button>Add Subject</Button>
      </div>
    </Card>
  );
}
