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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEvent, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export function AddRepository() {
  const [platform, setPlatform] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isEditable, setIsEditable] = useState(false);

  const isFormValid = platform && username && repo;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      if (!isEditable) {
        const res = `${platform}/${username}/${repo}`;
        console.log("Adding repository: " + res);
        return;
      }
      console.log("Adding repository: " + result);
    }
  };

  function handleCheck(value: CheckedState) {
    setIsEditable(!!value);
    setResult(`${platform}/${username}/${repo}`);
  }

  return (
    <Card className="w-[350px]">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Manually Add Repository</CardTitle>
          <CardDescription>
            Add a GitHub or GitLab repository URL.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
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
                placeholder="Repository owner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="repo">Repository</Label>
              <Input
                id="repo"
                placeholder="Repository name"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
            </div>
            {platform && username && repo && (
              <div className={"text-sm text-muted-foreground"}>
                <Label htmlFor="preview">Preview</Label>
                <div className={"flex justify-end gap-x-4"}>
                  <Checkbox
                    id={"manual-edit"}
                    checked={isEditable}
                    onCheckedChange={(value) => handleCheck(value)}
                    aria-label="Toggle manual editing"
                  />
                  <label htmlFor="manual-edit">Edit</label>
                </div>

                <Input
                  id="preview"
                  placeholder="Preview"
                  value={
                    isEditable ? result : `${platform}/${username}/${repo}`
                  }
                  disabled={!isEditable}
                  onChange={(e) => setResult(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type={"reset"}
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            onClick={() => {
              setPlatform("");
              setUsername("");
              setRepo("");
            }}
          >
            Clear
          </Button>

          <Button type="submit" disabled={!isFormValid}>
            Add Repository
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
