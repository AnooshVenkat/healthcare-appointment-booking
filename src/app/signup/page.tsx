import { SignupForm } from "@/components/auth-form";
import { signupAction } from "@/app/actions/auth";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center px-4 py-12">
      <SignupForm action={signupAction} />
    </div>
  );
}
