import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ResetPassword() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="space-y-4">
        <Input label="New Password" type="password" />

        <Input label="Confirm Password" type="password" />

        <Button>Reset Password</Button>
      </div>
    </div>
  );
}
