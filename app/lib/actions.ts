"use server";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Semester } from "@prisma/client";

const prisma = new PrismaClient();

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  userType: z.enum(["STUDENT", "EDUCATOR"]),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

const CourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  courseId: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  semester: z.enum(["SPRING", "AUTUMN"]),
});

export async function createCourse(prevState: any, formData: FormData) {
  const session = await auth();

  if (!session || !session.user) {
    return { error: "You must be logged in to create a course" };
  }

  const parsedFormData = CourseSchema.safeParse({
    name: formData.get("name"),
    courseId: formData.get("courseId"),
    year: formData.get("year"),
    semester: formData.get("semester"),
  });

  if (!parsedFormData.success) {
    return { error: "Validation failed. Please check your input." };
  }

  const { name, courseId, year, semester } = parsedFormData.data;

  try {
    console.log("ownerID", session.user);
    const newCourse = await prisma.course.create({
      data: {
        id: courseId || crypto.randomUUID(),
        name,
        year,
        semester: semester as Semester,
        ownerId: session.user.id,
      },
    });
    return { success: true, course: newCourse };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Failed to create course. Please try again." };
  }
}

export async function createUser(prevState: any, formData: FormData) {
  console.log("formData", formData);
  const parsedFormData = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    userType: formData.get("userType"),
    githubUrl: formData.get("githubUrl") || "",
  });

  if (!parsedFormData.success) {
    return { error: "Validation failed. Please check your input." };
  }

  const { email, password, name, userType, githubUrl } = parsedFormData.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  // Check if user already exists
  if (existingUser) {
    return { error: "User already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // Generate a UUID for the id
        email,
        password: hashedPassword,
        userType,
        githubUrl: githubUrl || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user. Please try again." };
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
