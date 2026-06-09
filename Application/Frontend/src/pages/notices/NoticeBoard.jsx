import Card from "../../components/ui/Card";

export default function NoticeBoard() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Notice Board</h2>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">Summer Vacation</h3>

          <p className="text-gray-600">
            School will remain closed from June 20 to July 15.
          </p>
        </div>
      </div>
    </Card>
  );
}
