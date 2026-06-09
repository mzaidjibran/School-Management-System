import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function AddClass() {
  return (
    <Card>
      <Input label="Class Name" />

      <div className="mt-4">
        <Button>Create Class</Button>
      </div>
    </Card>
  );
}
