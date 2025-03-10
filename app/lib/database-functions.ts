"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function getCourses() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        courses: [],
      };
    }

    const courses = await prisma.course.findMany({
      where: {
        ownerId: session?.user?.id,
      },
    });
    return {
      courses,
    };
  } catch (e) {
    console.error("Error fetching courses: ", e);
    return {
      error: "Failed to fetch courses",
      courses: [],
    };
  }
}
