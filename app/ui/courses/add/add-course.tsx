"use client";

import { Button } from "@/app/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useActionState, useState } from "react";
import { createCourse } from "@/app/lib/actions";

export function AddCourse() {
  const [formState, formAction, isPending] = useActionState(
    createCourse,
    undefined,
  );
  const [courseName, setCourseName] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [semester, setSemester] = useState<string>("SPRING");

  const currentYear = new Date().getFullYear();

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputYear = Number.parseInt(e.target.value, 10);
    if (!isNaN(inputYear) && inputYear <= currentYear) {
      setYear(e.target.value);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setCourseName("");
    setYear("");
    setCourseId("");
    setSemester("SPRING");
  };

  // Check if previous submission was successful and reset form
  if (formState?.success && courseName) {
    resetForm();
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Add Course</CardTitle>
        <CardDescription>Add a new course.</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter course name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />

              <Label htmlFor="courseId">Course ID (Optional)</Label>
              <Input
                id="courseId"
                name="courseId"
                placeholder="Enter course id"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="Enter year"
                value={year}
                onChange={handleYearChange}
                max={currentYear}
                min="1900"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <select
                id="semester"
                name="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="border rounded p-2"
                required
              >
                <option value="SPRING">Spring</option>
                <option value="AUTUMN">Autumn</option>
              </select>
            </div>

            {/* Display form feedback */}
            {formState?.error && (
              <div className="text-red-500 text-sm">{formState.error}</div>
            )}
            {formState?.success && (
              <div className="text-green-500 text-sm">
                Course added successfully!
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              onClick={resetForm}
            >
              Clear
            </Button>

            <Button type="submit" disabled={!courseName || !year || isPending}>
              {isPending ? "Adding..." : "Add Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
