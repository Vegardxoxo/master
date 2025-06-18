import type { Metadata } from "next";
import LoginForm from "@/app/ui/login-form";

export const metadata: Metadata = {
  title: "Login | GitHub Student Dashboard",
  description:
    "Login to access the GitHub student repository monitoring dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}
