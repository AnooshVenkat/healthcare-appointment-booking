import { LoginForm } from "@/components/auth-form";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center px-4 py-12">
      <LoginForm action={loginAction} />
    </div>
  );
}
