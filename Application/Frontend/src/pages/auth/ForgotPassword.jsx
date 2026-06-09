import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <Input label="Email Address" type="email" />

      <div className="mt-4">
        <Button>Send Reset Link</Button>
      </div>
    </div>
  );
}
