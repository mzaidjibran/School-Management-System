import Card from "../../components/ui/Card";

export default function Dashboard() {
  const stats = [
    {
      title: "Students",
      value: "1250",
    },
    {
      title: "Teachers",
      value: "75",
    },
    {
      title: "Classes",
      value: "32",
    },
    {
      title: "Revenue",
      value: "$25,000",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-5">
        {stats.map((item) => (
          <Card key={item.title}>
            <p className="text-gray-500">{item.title}</p>

            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
}
