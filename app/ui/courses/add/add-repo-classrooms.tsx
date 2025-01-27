"use client";

import * as React from "react";
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
import { parseCSV } from "@/app/lib/utils";

export function AddRepositoryClassroom() {
  const [organization, setOrganization] = React.useState("");
  const [assignment, setAssignment] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization || !assignment || !file) return;

    setIsUploading(true);
    try {
      const names = await parseCSV(file);
      console.log("Parsed names:", names);
      // Here you would typically send this data to your backend
      console.log(
        `Uploading for organization: ${organization}, classroom: ${assignment}`,
      );
    } catch (error) {
      console.error("Error parsing CSV:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="min-w-xs w-[350px]">
      <CardHeader>
        <CardTitle>Create Classroom</CardTitle>
        <CardDescription>Upload a CSV file with student names.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Enter organization name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="assignment">Assignment</Label>
              <Input
                id="assignment"
                placeholder="Enter assignment name"
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="csv-upload">Upload CSV</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type={"reset"}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          onClick={() => {
            setOrganization("");
            setAssignment("");
            setFile(null);
          }}
        >
          Clear
        </Button>
        <Button
          type="submit"
          disabled={!organization || !assignment || !file || isUploading}
          onClick={handleSubmit}
        >
          {isUploading ? "Uploading..." : "Create Classroom"}
        </Button>
      </CardFooter>
    </Card>
  );
}
