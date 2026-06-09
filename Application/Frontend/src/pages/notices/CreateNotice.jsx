import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function CreateNotice() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-5">Create Notice</h2>

      <div className="space-y-4">
        <Input label="Title" />

        <textarea
          rows="5"
          className="w-full border rounded-lg p-3"
          placeholder="Notice Details"
        />

        <Button>Publish Notice</Button>
      </div>
    </Card>
  );
}
