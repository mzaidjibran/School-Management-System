import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function FeeCollection() {
  return (
    <Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Student Name" />
        <Input label="Amount" />
      </div>

      <div className="mt-4">
        <Button>Collect Fee</Button>
      </div>
    </Card>
  );
}
