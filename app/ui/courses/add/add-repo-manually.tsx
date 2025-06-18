"use client";
import { Button } from "@/app/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button as Button2 } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect, useState } from "react";
import { createRepository } from "@/app/lib/server-actions/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function AddRepositoryForm({
  courseInstanceId,
}: {
  courseInstanceId: string;
}) {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(
    createRepository,
    undefined,
  );
  const [username, setUsername] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const { toast } = useToast();

  const isFormValid = username && repoName;

  const clear = () => {
    setUsername("");
    setRepoName("");
    setUrl("");
  };

  // Update URL when inputs change
  useEffect(() => {
    if (username && repoName) {
      setUrl(`https://github.com/${username}/${repoName}`);
    } else {
      setUrl("");
    }
  }, [username, repoName]);

  // Handle form state changes with toast notifications
  useEffect(() => {
    if (formState?.success) {
      toast({
        title: "Success",
        description: formState.message || "Repository added successfully!",
        variant: "success",
      });

      clear();

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } else if (formState?.error) {
      toast({
        title: "Error",
        description: formState.error,
        variant: "destructive",
      });
    }
  }, [formState, router, toast]);

  // Custom form submission handler to ensure all data is properly sent
  const handleSubmit = async (formData: FormData) => {
    formData.append("courseInstanceId", courseInstanceId);
    if (username) formData.set("username", username);
    if (repoName) formData.set("repoName", repoName);
    formData.set("url", `https://github.com/${username}/${repoName}`);

    return formAction(formData);
  };

  return (
    <Card className="w-[450px]">
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>Manually Add Repository</CardTitle>
          <CardDescription>Add a GitHub repository URL.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Repository owner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="repoName">Repository</Label>
              <Input
                id="repoName"
                name="repoName"
                placeholder="Repository name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="preview">Repository URL</Label>
              <Input
                id="preview"
                name="url"
                placeholder="https://github.com/username/repository"
                value={url}
                className="font-mono text-sm"
                disabled={true}
                readOnly
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button2
            type="reset"
            variant="outline"
            onClick={clear}
            disabled={isPending}
          >
            Clear
          </Button2>

          <Button type="submit" disabled={!isFormValid || isPending}>
            {isPending ? "Adding..." : "Add Repository"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
