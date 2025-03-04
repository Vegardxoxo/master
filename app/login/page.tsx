import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "@/app/ui/login-form"

export const metadata: Metadata = {
  title: "Login | GitHub Student Dashboard",
  description: "Login to access the GitHub student repository monitoring dashboard",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

