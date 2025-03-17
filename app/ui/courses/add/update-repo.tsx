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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { updateRepository } from "@/app/lib/server-actions/actions";
import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../button";

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
  const [platform, setPlatform] = useState<string>(repository.platform);
  const [username, setUsername] = useState<string>(repository.username);
  const [repoName, setRepoName] = useState<string>(repository.repoName);
  const [url, setUrl] = useState<string>(repository.url);
  const [isEditable, setIsEditable] = useState(true);
  const isFormValid = platform && username && repoName;

  useEffect(() => {
    if (platform && username && repoName) {
      setUrl(`https://${platform}.com/${username}/${repoName}`);
    } else {
      setUrl("");
    }
  }, [platform, username, repoName]);

  function handleCheck(value: CheckedState) {
    setIsEditable(!!value);
  }

  const handleSubmit = async (formData: FormData) => {
    if (isEditable) {
      formData.set("url", url);
    } else {
      formData.set("url", `https://${platform}.com/${username}/${repoName}`);
    }

    return formAction(formData);
  };

  return (
    <Card className="w-[350px]">
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>Update Repository</CardTitle>
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
              <Label htmlFor="platform">Platform</Label>
              <Select
                name="platform"
                value={platform}
                onValueChange={setPlatform}
                disabled={isPending}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editURL"
                checked={isEditable}
                onCheckedChange={handleCheck}
                disabled={isPending}
              />
              <Label htmlFor="editURL">I want to edit the URL manually</Label>
            </div>

            {isEditable && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Repository URL</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://github.com/username/repo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
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

          {formState?.success && (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>
                {formState.message || "Repository updated successfully"}
              </span>
            </div>
          )}

          {formState?.error && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>{formState.error}</span>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
