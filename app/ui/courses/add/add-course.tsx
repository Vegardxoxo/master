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
import { ChangeEvent, FormEvent, useState } from "react";

export function AddCourse() {
  const [courseName, setCourseName] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const currentYear = new Date().getFullYear();

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputYear = Number.parseInt(e.target.value, 10);
    if (!isNaN(inputYear) && inputYear <= currentYear) {
      setYear(e.target.value);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (courseName && year) {
      console.log(`Adding course: ${courseName} for year ${year}`);
      // Here you would typically send this data to your backend
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Add Course</CardTitle>
        <CardDescription>Add a new course.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                placeholder="Enter course name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
              <Label htmlFor="course-name">Course Id</Label>
              <Input
                id="course-id"
                placeholder="Enter course id"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="Enter year"
                value={year}
                onChange={handleYearChange}
                max={currentYear}
                min="1900"
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
            setCourseName("");
            setYear("");
          }}
        >
          Clear
        </Button>
        <Button
          type="submit"
          disabled={!courseName || !year}
          onClick={handleSubmit}
        >
          Add Course
        </Button>
      </CardFooter>
    </Card>
  );
}
