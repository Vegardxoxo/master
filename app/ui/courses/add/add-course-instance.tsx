"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { addCourseInstance } from "@/app/lib/actions";

interface AddInstanceDialogProps {
  userCourseId: string;
  courseName: string;
  courseCode: string;
}

export function AddCourseInstance({
  userCourseId,
  courseName,
  courseCode,
}: AddInstanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [semester, setSemester] = useState<string>("SPRING");

  // Feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form to initial values
  const resetForm = () => {
    setYear(new Date().getFullYear().toString());
    setSemester("SPRING");
    setError(null);
    setSuccess(null);
  };

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    // If closing and not in the middle of submitting
    if (!isOpen && !isSubmitting) {
      setOpen(false);
      // Reset form after dialog closes
      setTimeout(resetForm, 300);
    } else if (isOpen) {
      // Opening the dialog
      setOpen(true);
      resetForm();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!year || isNaN(Number(year))) {
      setError("Please enter a valid year");
      return;
    }

    // Set submitting state
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("userCourseId", userCourseId);
      formData.append("year", year);
      formData.append("semester", semester);

      // Call the server action
      const result = await addCourseInstance(null, formData);

      if (result.error) {
        // Handle error
        setError(result.error);
        setIsSubmitting(false);
      } else if (result.success) {
        // Handle success
        setSuccess(`Added ${semester} ${year} successfully!`);

        // Close dialog after a short delay
        setTimeout(() => {
          setOpen(false);

          // Reset form after dialog closes
          setTimeout(() => {
            resetForm();
            setIsSubmitting(false);
          }, 300);
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Year</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add an instance for {courseName}</DialogTitle>
          <DialogDescription>
            Add a new year and semester for {courseCode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={semester}
                  onValueChange={setSemester}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPRING">Spring</SelectItem>
                    <SelectItem value="AUTUMN">Autumn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error & Success messages */}
            <div className="min-h-[24px]">
              {error && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {success}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
