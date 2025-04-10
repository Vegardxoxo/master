"use client";
import { Button } from "@/app/ui/button";
import { CardFooter } from "@/components/ui/card";

import { Button as Button2 } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { createRepository } from "@/app/lib/server-actions/actions";
import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {useToast} from "@/hooks/use-toast";


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
  const [organization, setOrganization] = useState<"ntnu" | "none">("none");
  const [username, setUsername] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [isEditable, setIsEditable] = useState(false);
  const { toast } = useToast();

  const isFormValid = username && repoName;

  const clear = () => {
    setOrganization("none");
    setUsername("");
    setRepoName("");
    setUrl("");
    setIsEditable(false);
  };

  // Reset URL when inputs change
  useEffect(() => {
    if (username && repoName) {
      if (organization === "ntnu") {
        setUrl(`https://git.ntnu.no/${username}/${repoName}`);
      } else {
        setUrl(`https://github.com/${username}/${repoName}`);
      }
    } else {
      setUrl("");
    }
  }, [organization, username, repoName]);

  // Reset form after successful submission
  useEffect(() => {
    if (formState?.success) {
     clear();


      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
  }, [formState, router]);

  function handleCheck(value: CheckedState) {
    setIsEditable(!!value);
  }

  // Custom form submission handler to ensure all data is properly sent
  const handleSubmit = async (formData: FormData) => {
    formData.append("courseInstanceId", courseInstanceId);
    formData.set("organization", organization);
    if (username) formData.set("username", username);
    if (repoName) formData.set("repoName", repoName);
    if (isEditable) {
      formData.set("url", url);
    } else {
      if (organization === "ntnu") {
        formData.set("url", `https://git.ntnu.no/${username}/${repoName}`);
      } else {
        formData.set("url", `https://github.com/${username}/${repoName}`);
      }
    }

    return formAction(formData);
  };

  return (
    <Card className="w-[450px]">
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>Manually Add Repository</CardTitle>
          <CardDescription>
            Add a GitHub or NTNU Git repository URL.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="organization">Organization</Label>
              <Select
                name="organization"
                value={organization}
                onValueChange={(value: "ntnu" | "none") =>
                  setOrganization(value)
                }
                disabled={isPending}
              >
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="ntnu">NTNU</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {username && repoName && (
              <div className="text-sm text-muted-foreground">
                <Label htmlFor="preview">Preview</Label>
                <div className="flex justify-end gap-x-4">
                  <Checkbox
                    id="manual-edit"
                    checked={isEditable}
                    onCheckedChange={handleCheck}
                    aria-label="Toggle manual editing"
                    disabled={isPending}
                  />
                  <label htmlFor="manual-edit">Edit</label>
                </div>

                <Input
                  id="preview"
                  name="url"
                  placeholder="Preview"
                  value={url}
                  className="font-mono text-sm"
                  disabled={!isEditable || isPending}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* Message container with fixed height to prevent layout shifts */}
            <div className="min-h-[24px]">
              {formState?.error && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formState.error}
                </div>
              )}
              {formState?.success && (
                <div className="flex items-center text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {formState.message || "Repository added successfully!"}
                </div>
              )}
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
