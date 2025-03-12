"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

/**
 * Fetches all courses the user is enrolled in with their instances
 */
export async function getUserCourses() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        enrolledCourses: [],
      };
    }

    const enrolledCourses = await prisma.userCourse.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: true,
        instances: {
          orderBy: {
            year: "desc",
          },
        },
      },
    });

    return { success: true, enrolledCourses };
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return { error: "Failed to fetch enrolled courses" };
  }
}

export async function getCourseCatalog() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        error: "Not authenticated",
        courses: [],
      };
    }

    const courses = await prisma.course.findMany({
      orderBy: { code: "asc" },
    });


    return {
      success: true,
      courses,
    };
  } catch (e) {
    console.error("Error fetching course catalog:", e);
    return {
      error: "Internal server error",
      courses: [],
    };
  }
}
