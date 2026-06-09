import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-xl p-6 bg-white">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <div className="space-y-4">
          <Input label="Email" type="email" />

          <Input label="Password" type="password" />

          <Button className="w-full">Login</Button>
        </div>
      </div>
    </div>
  );
}
