"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/lib/server-actions/actions";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AtSign, Key, AlertCircle, ArrowRight } from "lucide-react";
import {Button} from "@/app/ui/button";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className={"text-center"}>
          Please log in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive animate-fadeIn">
              <AlertCircle className="h-4 w-4" />
              <p>{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full transition-all duration-300"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Log in"}
            {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
