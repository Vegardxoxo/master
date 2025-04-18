import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/app/ui/signup-form";

export const metadata: Metadata = {
  title: "Sign Up | GitHub Student Dashboard",
  description:
    "Create an account for the GitHub student repository monitoring dashboard",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignupForm />
      </div>
    </div>
  );
}
