import Card from "../../components/ui/Card";

export default function ClassList() {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Class List</h2>

      <div className="mt-4 space-y-2">
        <div>Class 1</div>
        <div>Class 2</div>
        <div>Class 3</div>
      </div>
    </Card>
  );
}
