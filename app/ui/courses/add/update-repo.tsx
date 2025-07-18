"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect, useState } from "react";
import { updateRepository } from "@/app/lib/server-actions/actions";
import { Button } from "../../button";
import { useToast } from "@/hooks/use-toast";

export function UpdateRepositoryForm({
  repository,
  repositoryId,
}: {
  repository: any;
  repositoryId: string;
}) {
  const [formState, formAction, isPending] = useActionState(
    updateRepository,
    undefined,
  );
  const [username, setUsername] = useState<string>(repository.username);
  const [repoName, setRepoName] = useState<string>(repository.repoName);
  const [url, setUrl] = useState<string>(repository.url);
  const isFormValid = username && repoName;
  const { toast } = useToast();

  // Watch for changes in formState and show toast notifications
  useEffect(() => {
    if (formState?.success) {
      toast({
        title: "Success",
        description: formState.message || "Repository updated successfully",
        variant: "success",
      });
    } else if (formState?.error) {
      toast({
        title: "Error",
        description: formState.error,
        variant: "destructive",
      });
    }
  }, [formState, toast]);

  useEffect(() => {
    if (username && repoName) {
      setUrl(`https://github.com/${username}/${repoName}`);
    } else {
      setUrl("");
    }
  }, [username, repoName]);

  const handleSubmit = async (formData: FormData) => {
    formData.set("url", `https://github.com/${username}/${repoName}`);
    return formAction(formData);
  };

  return (
    <Card className="w-[350px]">
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle className={"text-2xl font-bold"}>
            Update Repository
          </CardTitle>
          <CardDescription>Edit the repository details.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid w-full items-center gap-4">
            {/* Hidden field for repository ID */}
            <input type="hidden" name="id" value={repositoryId} />

            {/* Hidden field for course instance ID */}
            {repository.courseInstanceId && (
              <input
                type="hidden"
                name="courseInstanceId"
                value={repository.courseInstanceId}
              />
            )}

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter username or organization"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="repoName">Repository Name</Label>
              <Input
                id="repoName"
                name="repoName"
                placeholder="Enter repository name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Preview url</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://github.com/username/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isPending}
          >
            {isPending ? "Updating..." : "Update Repository"}
          </Button>

          {/*{formState?.success && (*/}
          {/*  <div className="flex items-center text-green-600">*/}
          {/*    <CheckCircle2 className="mr-2 h-4 w-4" />*/}
          {/*    <span>{formState.message || "Repository updated successfully"}</span>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/*{formState?.error && (*/}
          {/*  <div className="flex items-center text-red-600">*/}
          {/*    <AlertCircle className="mr-2 h-4 w-4" />*/}
          {/*    <span>{formState.error}</span>*/}
          {/*  </div>*/}
          {/*)}*/}
        </CardFooter>
      </form>
    </Card>
  );
}
