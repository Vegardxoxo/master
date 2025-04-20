"use client";

import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { useState, useEffect, useCallback } from "react";
import { enrollInCourse } from "@/app/lib/server-actions/actions";
import type { Course, UserCourse } from "@/app/lib/definitions/definitions";
import {Search, CheckCircle2, AlertCircle, ArrowLeft} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {Button} from "@/app/ui/button";
import {Button as Button2} from "@/components/ui/button"
import {usePathname, useRouter} from "next/navigation";

interface AddCourseProps {
  courses: Course[];
  enrolledCourseIds: string[];
  onCourseAdded: (course: UserCourse) => void;
}

export function AddCourse({
  courses,
  enrolledCourseIds,
  onCourseAdded,
}: AddCourseProps) {
  const [formState, formAction, isPending] = useActionState(
    enrollInCourse,
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const availableCourses = courses.filter(
    (course) => !enrolledCourseIds.includes(course.id),
  );

  const filteredCourses = availableCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const resetForm = useCallback(() => {
    setSearchQuery("");
    setSelectedCourse(null);
    setSuccessMessage("Course added successfully!");
  }, []);

  useEffect(() => {
    if (formState?.success && formState.enrollment) {
      onCourseAdded(formState.enrollment);
      resetForm();
    }
  }, [formState, onCourseAdded, resetForm]);

  const handleSubmit = useCallback(
    (formData: FormData) => {
      if (!selectedCourse) return;

      if (enrolledCourseIds.includes(selectedCourse.id)) {
        setSuccessMessage("You are already enrolled in this course");
        return;
      }

      formAction(formData);
    },
    [selectedCourse, enrolledCourseIds, formAction],
  );


  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4">
          {filteredCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery
                ? "No courses found. Try a different search term."
                : "No available courses to enroll in."}
            </p>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`p-3 mb-2 rounded-md cursor-pointer border ${
                  selectedCourse?.id === course.id
                    ? "bg-sky-100 border-sky-300"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="font-medium">
                  {course.code} - {course.name}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form action={handleSubmit} className="mt-6">
        <input type="hidden" name="courseId" value={selectedCourse?.id || ""} />

        {/* Display form feedback */}
        <div className="min-h-[24px] mb-4">
          {formState?.error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {formState.error}
            </div>
          )}
          {successMessage && (
            <div className="flex items-center text-green-500 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {successMessage}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!selectedCourse || isPending}>
            {isPending ? "Adding..." : "Add Selected Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}
