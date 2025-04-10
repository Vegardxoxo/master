import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  semester: z.enum(["SPRING", "AUTUMN"]),
  courseSubjectId: z.string().optional(),
});

export const EnrollCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export const RemoveEnrollmentSchema = z.object({
  userCourseId: z.string().min(1, "User course ID is required"),
});

export const CourseInstanceSchema = z.object({
  userCourseId: z.string().min(1, "User course ID is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5),
  semester: z.enum(["SPRING", "AUTUMN"]),
});

export const RepositorySchema = z.object({
  courseInstanceId: z.string().min(1, "Course instance ID is required"),
  organization: z.enum(["ntnu", "none"]).default("none"),
  username: z.string().min(1, "Username is required"), // Change to userName with capital N
  repoName: z.string().min(1, "Repository name is required"),
});

export const UpdateRepositorySchema = z.object({
  id: z.string().min(1, "ID is required"),
  courseInstanceId: z.string().min(1, "Course instance ID is required"),
  organization: z.enum(["ntnu", "none"]).default("none"),
  username: z.string().min(1, "Username is required"), // Change to userName with capital N
  repoName: z.string().min(1, "Repository name is required"),
});
