"use server";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  CourseInstanceSchema,
  CourseSchema,
  EnrollCourseSchema,
  RemoveEnrollmentSchema,
  RepositorySchema,
  UpdateRepositorySchema,
} from "@/app/lib/server-actions/zod-schemas";
import { checkConnection } from "@/app/lib/data/github-api-functions";
import {
  CoverageMetrics,
  FileCoverageData,
  FileData,
  FileSetResult,
} from "@/app/lib/definitions/definitions";

import { prisma } from "@/app/lib/prisma";
import { updateRepositoryData } from "@/app/lib/database-functions/repository-data";

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

export async function createRepository(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        error:
          "You must be logged in to add a repository to the selected course.",
      };
    }

    const parsedFormData = RepositorySchema.safeParse({
      courseInstanceId: formData.get("courseInstanceId"),
      username: formData.get("username"),
      repoName: formData.get("repoName"),
    });

    if (!parsedFormData.success) {
      const fieldErrors = parsedFormData.error.format();
      return {
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { courseInstanceId, username, repoName } = parsedFormData.data;

    const courseInstance = await prisma.courseInstance.findFirst({
      where: {
        id: courseInstanceId,
        userCourse: {
          userId: session.user.id,
        },
      },
      include: {
        userCourse: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!courseInstance) {
      return {
        error: "Course instance not found or you don't have permission",
      };
    }

    const result = await checkConnection(username, repoName);
    if (typeof result === "boolean") {
      return {
        error: `Failed to fetch repository information. Check access token.`,
      };
    }

    const existingRepo = await prisma.repository.findFirst({
      where: {
        username: username,
        repoName: repoName,
        members: {
          some: {
            id: session.user.id,
          },
        },
      },
    });
    if (existingRepo) {
      return {
        error: `Repository ${repoName} already exists in this course.`,
      };
    }

    const repository = await prisma.repository.create({
      data: {
        username: username,
        repoName: repoName,
        courseInstanceId: courseInstanceId,
        members: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    await updateRepositoryData(
      repository.username,
      repository.repoName,
      repository.id,
    );

    // Get the course code for path revalidation
    const courseCode = courseInstance.userCourse.course.code;
    const year = courseInstance.year;
    const semester = courseInstance.semester.toLowerCase();

    revalidatePath(`/dashboard/courses/${courseCode}/${year}/${semester}`);
    return {
      success: true,
      repository,
      message: `Repository ${repoName} added successfully`,
    };
  } catch (e) {
    console.error("Error adding repository:", e);
    return {
      error: "Database error: Failed to add the repository. Please try again.",
    };
  }
}

export async function enrollInCourse(prevstate: any, formData: FormData) {
  const session = await auth();

  if (!session || !session.user) {
    return { error: "You must be logged in to enroll in a course" };
  }
  const parsedFormData = EnrollCourseSchema.safeParse({
    courseId: formData.get("courseId"),
  });

  if (!parsedFormData.success) {
    return { error: "Validation failed. Please check your input." };
  }

  const { courseId } = parsedFormData.data;

  try {
    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { error: "Course not found" };
    }

    // Check if the user is already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { error: "You are already enrolled in this course" };
    }

    // Create the enrollment
    const enrollment = await prisma.userCourse.create({
      data: {
        userId: session.user.id,
        courseId,
      },
      include: {
        course: true,
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: true, enrollment };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { error: "Failed to enroll in course. Please try again." };
  }
}

/**
 * Removes a user's enrollment from a course
 */
export async function removeEnrollment(prevState: any, formData: FormData) {
  const session = await auth();

  if (!session || !session.user) {
    return { error: "You must be logged in to remove a course" };
  }

  const parsedFormData = RemoveEnrollmentSchema.safeParse({
    userCourseId: formData.get("userCourseId"),
  });

  if (!parsedFormData.success) {
    return { error: "Validation failed. Please check your input." };
  }

  const { userCourseId } = parsedFormData.data;

  try {
    // Check if the enrollment exists and belongs to the user
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        id: userCourseId,
        userId: session.user.id,
      },
      include: {
        course: true,
        instances: true,
      },
    });

    if (!userCourse) {
      return {
        error: "Course enrollment not found or you don't have permission",
      };
    }

    // Delete all instances associated with this enrollment
    if (userCourse.instances.length > 0) {
      await prisma.courseInstance.deleteMany({
        where: {
          userCourseId,
        },
      });
    }

    // Delete the enrollment
    await prisma.userCourse.delete({
      where: {
        id: userCourseId,
      },
    });

    revalidatePath("/dashboard/courses");
    return {
      success: true,
      message: `Successfully removed ${userCourse.course.code} - ${userCourse.course.name}`,
      removedId: userCourseId, // Return the ID of the removed course
    };
  } catch (error) {
    console.error("Error removing course enrollment:", error);
    return { error: "Failed to remove course. Please try again." };
  }
}

/**
 * Adds a new year/semester instance to a user's enrolled course
 */
export async function addCourseInstance(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    return { error: "You must be logged in to add a course instance" };
  }

  const parsedFormData = CourseInstanceSchema.safeParse({
    userCourseId: formData.get("userCourseId"),
    year: formData.get("year"),
    semester: formData.get("semester"),
  });

  if (!parsedFormData.success) {
    return { error: "Validation failed. Please check your input." };
  }

  const { userCourseId, year, semester } = parsedFormData.data;

  try {
    // Check if the user course exists and belongs to the user
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        id: userCourseId,
        userId: session.user.id,
      },
      include: {
        course: true,
      },
    });

    if (!userCourse) {
      return {
        error: "Course enrollment not found or you don't have permission",
      };
    }

    // Check if an instance with the same year and semester already exists
    const existingInstance = await prisma.courseInstance.findFirst({
      where: {
        userCourseId,
        year,
        semester,
      },
    });

    if (existingInstance) {
      return {
        error: `An instance for ${semester} ${year} already exists for this course`,
      };
    }

    // Create the new instance
    const instance = await prisma.courseInstance.create({
      data: {
        userCourseId,
        year,
        semester,
        isActive: true,
      },
    });

    // Revalidate all course-related paths to ensure the sidebar updates
    revalidatePath("/dashboard/courses");
    revalidatePath(`/dashboard/courses/${userCourse.course.code}`);

    return {
      success: true,
      instance,
      message: `Added ${semester} ${year} to ${userCourse.course.code}`,
    };
  } catch (error) {
    console.error("Error adding course instance:", error);
    return { error: "Failed to add course instance. Please try again." };
  }
}


export async function createUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create the user first
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
      },
    });

    // Create default dashboard preferences with hardcoded values
    await prisma.dashboardPreference.create({
      data: {
        userId: newUser.id,
        preferences: {
          overview: {
            visible: true,
            text: "Repository Overview",
            contributors: { visible: true, text: "Contributors & Teams" },
            milestones: { visible: true, text: "Project Milestones" },
            info: { visible: true, text: "Repository Information" },
            files: { visible: true, text: "File Structure" },
            coverage: { visible: true, text: "Code Coverage" },
          },
          commits: {
            visible: true,
            text: "Commit Analysis",
            quality: { visible: true, text: "Commit Message Quality" },
            frequency: { visible: true, text: "Commit Frequency" },
            size: { visible: true, text: "Commit Size" },
            contributions: { visible: true, text: "Contribution Distribution" },
          },
          branches: {
            visible: true,
            text: "Branching Strategy",
            to_main: { visible: true, text: "Merges to Main" },
            strategy: { visible: true, text: "Branch Usage Patterns" },
          },
          pipelines: {
            visible: true,
            text: "CI/CD Pipelines",
          },
          pullRequests: {
            visible: true,
            text: "Pull Request Analysis",
            overview: { visible: true, text: "PR Overview" },
            members: { visible: true, text: "PR by Team Member" },
            comments: { visible: true, text: "PR Comments" },
            reviews: { visible: true, text: "PR Review Process" },
          },
        },
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

export async function deleteRepository(
  id: string,
): Promise<{ error?: string; message?: string; success: boolean }> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        success: false,
      };
    }
    const repo = await prisma.repository.findUnique({
      where: {
        id: id,
      },
      include: {
        courseInstance: {
          include: {
            userCourse: true,
          },
        },
      },
    });
    if (!repo) {
      return {
        error: "Repository not found",
        success: false,
      };
    }
    if (repo.courseInstance?.userCourse.userId !== session.user.id) {
      return {
        error: "You don't have permission to delete this repository",
        success: false,
      };
    }

    await prisma.repository.delete({
      where: {
        id: id,
      },
    });
    revalidatePath(`/courses/${repo.courseInstance?.userCourse.courseId}`);

    return {
      success: true,
      message: `Repository ${repo.url} deleted successfully`,
    };
  } catch (e) {
    console.error("Error deleting repository:", e);
    return {
      error:
        "Database error: Failed to delete the repository. Please try again.",
      success: false,
    };
  }
}

export async function updateRepository(
  prevState: any,
  formData: FormData,
): Promise<{
  error?: string;
  message?: string;
  success: boolean;
}> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        error:
          "You must be logged in to add a repository to the selected course.",
        success: false,
      };
    }

    console.log("formData", formData);

    const parsedFormData = UpdateRepositorySchema.safeParse({
      id: formData.get("id"),
      courseInstanceId: formData.get("courseInstanceId"),
      username: formData.get("username"),
      repoName: formData.get("repoName"),
    });

    if (!parsedFormData.success) {
      return {
        error: "Validation failed. Please check your input.",
        success: false,
      };
    }

    const { courseInstanceId, username, repoName, id } = parsedFormData.data;

    const courseInstance = await prisma.courseInstance.findFirst({
      where: {
        id: courseInstanceId,
        userCourse: {
          userId: session.user.id,
        },
      },
      include: {
        userCourse: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!courseInstance) {
      return {
        error: "Course instance not found or you don't have permission",
        success: false,
      };
    }
    await prisma.repository.update({
      where: {
        id: id,
      },
      data: {
        username: username,
        repoName: repoName,
      },
    });

    const result = await updateRepositoryData(username, repoName, id);
    if (!result.success) {
      console.error("Error updating repository data:", result.error);
      return {
        error: "Failed to update repository data. Please try again.",
        success: false,
      };
    }

    return {
      success: true,
      message: `Repository updated successfully`,
    };
  } catch (e) {
    console.error("Error updating repository:", e);
    return {
      error:
        "Database error: Failed to update the repository. Please try again.",
      success: false,
    };
  }
}

export async function saveCoverageReport(
  githubRepoId: string,
  commit: string,
  branch: string, // Added branch parameter
  metrics: CoverageMetrics,
  filesCoverage: FileCoverageData[],
) {
  try {
    // Find the repository by GitHub ID
    const repository = await prisma.repository.findFirst({
      where: {
        githubId: githubRepoId,
      },
    });

    if (!repository) {
      throw new Error(`Repository with GitHub ID ${githubRepoId} not found`);
    }

    // Use the internal ID for all subsequent operations
    const internalRepoId = repository.id;

    const existingReport = await prisma.coverageReport.findFirst({
      where: {
        repositoryId: internalRepoId,
        branch: branch,
      },
    });

    let savedCoverageReport;

    if (existingReport) {
      await prisma.fileCoverage.deleteMany({
        where: {
          coverageReportId: existingReport.id,
        },
      });

      savedCoverageReport = await prisma.coverageReport.update({
        where: {
          id: existingReport.id,
        },
        data: {
          commit,
          branch,
          timestamp: new Date(),
          statements: metrics.statements,
          branches: metrics.branches,
          functions: metrics.functions,
          lines: metrics.lines,
          overall: metrics.overall,
          fileCoverages: {
            create: filesCoverage.map((file) => ({
              filePath: file.filePath,
              statements: file.statements,
              branches: file.branches,
              functions: file.functions,
              lines: file.lines,
            })),
          },
        },
        include: {
          fileCoverages: true,
        },
      });
    } else {
      savedCoverageReport = await prisma.coverageReport.create({
        data: {
          repositoryId: internalRepoId,
          commit,
          branch: branch,
          statements: metrics.statements,
          branches: metrics.branches,
          functions: metrics.functions,
          lines: metrics.lines,
          overall: metrics.overall,
          fileCoverages: {
            create: filesCoverage.map((file) => ({
              filePath: file.filePath,
              statements: file.statements,
              branches: file.branches,
              functions: file.functions,
              lines: file.lines,
            })),
          },
        },
        include: {
          fileCoverages: true,
        },
      });
    }

    return {
      success: true,
      coverageReport: savedCoverageReport,
      repository: repository,
    };
  } catch (error) {
    console.error("Error saving coverage report:", error);
    throw error;
  }
}

export async function updateRepositoryFiles(
  repositoryId: string,
  branch: string,
  commit: string,
  fileData: FileData[],
): Promise<FileSetResult> {
  return await prisma.$transaction(async (prisma) => {
    const existingFileSet = await prisma.fileSet.findFirst({
      where: {
        repositoryId: repositoryId,
        branch: branch,
      },
    });

    if (existingFileSet) {
      await prisma.file.deleteMany({
        where: {
          fileSetId: existingFileSet.id,
        },
      });

      return await prisma.fileSet.update({
        where: {
          id: existingFileSet.id,
        },
        data: {
          commit: commit,
          lastUpdated: new Date(),
          files: {
            create: fileData,
          },
        },
        include: {
          files: true,
        },
      });
    } else {
      return await prisma.fileSet.create({
        data: {
          repositoryId: repositoryId,
          branch: branch,
          commit: commit,
          files: {
            create: fileData,
          },
        },
        include: {
          files: true,
        },
      });
    }
  });
}

export async function deleteCourseInstance(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        error: "You must be logged in to delete a course instance.",
        success: false,
      };
    }

    const userId = session.user.id;

    const courseInstance = await prisma.courseInstance.findFirst({
      where: {
        id,
        userCourse: {
          userId: userId,
        },
      },
    });

    if (!courseInstance) {
      return {
        error:
          "Course instance not found or you do not have permission to delete it.",
        success: false,
      };
    }

    await prisma.courseInstance.delete({
      where: { id },
      include: { repositories: true },
    });

    return { success: true, message: "Course instance deleted successfully." };
  } catch (error) {
    console.error("Error deleting course instance:", error);
    return { success: false, error: "Failed to delete course instance." };
  }
}
