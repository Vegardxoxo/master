"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useActionState } from "react"
import { useState } from "react"
import { enrollInCourse } from "@/app/lib/actions"
import type { Course } from "@/app/lib/definitions"
import { Search, CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddCourseProps {
  courses: Course[]
  enrolledCourses: any[] // Using any[] since the actual structure might be different
}

export function AddCourse({ courses, enrolledCourses }: AddCourseProps) {
  const [formState, formAction, isPending] = useActionState(enrollInCourse, undefined)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Extract just the course data from enrolledCourses (which might have a nested structure)
  const enrolledCourseIds = enrolledCourses?.map((ec) => (ec.course ? ec.course.id : ec.id)) || []

  // Filter out already enrolled courses
  const availableCourses = courses.filter((course) => !enrolledCourseIds.includes(course.id))

  // Filter available courses based on search query
  const filteredCourses = availableCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Reset form after submission
  const resetForm = () => {
    setSearchQuery("")
    setSelectedCourse(null)
  }

  // Check if previous submission was successful and reset form
  if (formState?.success && selectedCourse) {
    resetForm()
  }

  return (
    <Card className="w-full max-w-[600px]">
      <CardHeader>
        <CardTitle>Course Management</CardTitle>
        <CardDescription>Browse available courses and manage your enrolled courses</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-4">
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
                        selectedCourse?.id === course.id ? "bg-sky-100 border-sky-300" : "hover:bg-gray-100"
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

            <form action={formAction} className="mt-6">
              <input type="hidden" name="courseId" value={selectedCourse?.id || ""} />

              {/* Display form feedback */}
              {formState?.error && <div className="text-red-500 text-sm mb-4">{formState.error}</div>}
              {formState?.success && <div className="text-green-500 text-sm mb-4">Course added successfully!</div>}

              <div className="flex justify-end">
                <Button type="submit" disabled={!selectedCourse || isPending}>
                  {isPending ? "Adding..." : "Add Selected Course"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="enrolled" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4">
                {enrolledCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">You have not enrolled in any courses yet.</p>
                ) : (
                  enrolledCourses.map((enrolledItem) => {
                    // Handle different possible structures
                    const course = enrolledItem.course || enrolledItem
                    return (
                      <div key={enrolledItem.id} className="p-3 mb-2 rounded-md border bg-gray-50">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          <div>
                            <div className="font-medium">
                              {course.code} - {course.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Enrolled: {new Date(enrolledItem.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

