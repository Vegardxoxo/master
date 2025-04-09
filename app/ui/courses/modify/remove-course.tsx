"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { removeEnrollment } from "@/app/lib/server-actions/actions"
import type { UserCourse } from "@/app/lib/definitions/definitions"
import { CheckCircle2, Trash2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RemoveCourseProps {
  enrolledCourses: UserCourse[]
  onCourseRemoved: (courseId: string) => void
}

export function RemoveCourse({ enrolledCourses, onCourseRemoved }: RemoveCourseProps) {
  const [courseToRemoveId, setCourseToRemoveId] = useState<string | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const openDeleteDialog = (courseId: string) => {
    setCourseToRemoveId(courseId)
  }

  const closeDeleteDialog = () => {
    setCourseToRemoveId(null)
  }

  const handleDelete = async (courseId: string) => {
    setLoadingStates((prev) => ({ ...prev, [courseId]: true }))

    try {
      const formData = new FormData()
      formData.append("userCourseId", courseId)
      const result = await removeEnrollment(null, formData)
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Course removed successfully" })
        onCourseRemoved(courseId)

        setTimeout(() => {
          setMessage(null)
        }, 3000)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to remove course" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      // Clear loading state and close dialog
      setLoadingStates((prev) => ({ ...prev, [courseId]: false }))
      closeDeleteDialog()
    }
  }

  // Find the course being deleted (if any)
  const courseToRemove = enrolledCourses.find((course) => course.id === courseToRemoveId)

  return (
    <div>
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4">
          {enrolledCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">You have not enrolled in any courses yet.</p>
          ) : (
            enrolledCourses.map((enrolledItem) => {
              const course = enrolledItem.course
              const isLoading = loadingStates[enrolledItem.id] || false

              return (
                <div key={enrolledItem.id} className="p-3 mb-2 rounded-md border bg-gray-50">
                  <div className="flex items-center justify-between">
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(enrolledItem.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <span className="animate-pulse">...</span> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!courseToRemoveId} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          {courseToRemove && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Course</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {courseToRemove.course.code} - {courseToRemove.course.name}? This will
                  delete all semesters and repositories associated with this course.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(courseToRemove.id)}
                  disabled={loadingStates[courseToRemove.id]}
                >
                  {loadingStates[courseToRemove.id] ? "Removing..." : "Remove"}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Message display */}
      <div className="min-h-[24px] mt-4">
        {message && (
          <div
            className={`flex items-center text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

