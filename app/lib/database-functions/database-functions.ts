"use server";
import { prisma } from "@/app/lib/prisma";

import { auth } from "@/auth";
import {
  Course,
  CourseInstance,
  CoverageMetrics,
  FileCoverageData,
  FileSetResult,
  Repository,
  UserCourse
} from "@/app/lib/definitions/definitions";
import { findRepositoryByOwnerRepo } from "@/app/lib/database-functions/helper-functions";
import { revalidatePath } from "next/cache";

/**
 * Fetches all courses the user is enrolled in with their instances
 */
export async function getUserCourses(): Promise<{
  error?: string;
  success?: boolean;
  enrolledCourses: UserCourse[];
}> {
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
    return {
      error: "Failed to fetch enrolled courses",
      enrolledCourses: [],
    };
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

export async function getRepository(
  id: string,
): Promise<{ error?: string; repository: Repository | null }> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        repository: null,
      };
    }

    const repo = await prisma.repository.findUnique({
      where: { id: id },
      select: {
        id: true,
        courseInstanceId: true,
        username: true,
        repoName: true,
        url: true,
      },
    });
    if (!repo) {
      return {
        error: "Repository not found",
        repository: null,
      };
    }
    return {
      repository: repo as Repository,
    };
  } catch (e) {
    console.error("Error fetching repository:", e);
    return {
      error: "Database error: Failed to fetch repository.",
      repository: null,
    };
  }
}

export async function getRepositories(courseInstanceId: string): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  repositories: Repository[];
}> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        repositories: [],
      };
    }

    const repositories = await prisma.repository.findMany({
      where: {
        courseInstanceId: courseInstanceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
        repoName: true,
        url: true,
        hasReport: true,
        reportGeneratedAt: true,
        openIssues: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      repositories: repositories as Repository[],
    };
  } catch (e) {
    console.error("Error fetching repositories:", e);
    return {
      error: "Database error: Failed to fetch repositories.",
      repositories: [],
    };
  }
}

export async function getCourseInstance(
  courseCode: string,
  year: number,
  semester: string,
): Promise<{
  error?: string;
  success?: boolean;
  courseInstance: CourseInstance | null;
  course?: Course;
}> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return {
        error: "Not authenticated",
        courseInstance: null,
      };
    }
    const course = await prisma.course.findUnique({
      where: { code: courseCode },
    });
    if (!course) {
      return {
        error: "Course not found",
        courseInstance: null,
      };
    }

    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (!userCourse) {
      return {
        error: "You are not enrolled in this course",
        courseInstance: null,
      };
    }
    const courseInstance = await prisma.courseInstance.findFirst({
      where: {
        userCourseId: userCourse.id,
        year: year,
        semester: semester.toUpperCase() as "SPRING" | "AUTUMN",
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
        error: `No ${semester} ${year} instance found for this course`,
        courseInstance: null,
      };
    }

    return {
      success: true,
      courseInstance,
      course,
    };
  } catch (e) {
    console.error("Error fetching course instance:", e);
    return {
      error: "Database error: Failed to fetch course instance.",
      courseInstance: null,
    };
  }
}

/**
 * Fetches all files for a specific repository and branch
 */
export async function getRepositoryFiles(
  owner: string,
  repo: string,
  branch: string = "master",
): Promise<{
  error?: string;
  success?: boolean;
  fileSet: FileSetResult | null;
}> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        error: "Not authenticated",
        fileSet: null,
      };
    }

    const repository = await prisma.repository.findFirst({
      where: {
        username: owner,
        repoName: repo,
      },
    });

    if (!repository) {
      return {
        error: "Repository not found or you don't have access to it",
        fileSet: null,
      };
    }

    const fileSet = await prisma.fileSet.findFirst({
      where: {
        repositoryId: repository.id,
        branch,
      },
      include: {
        files: {
          orderBy: {
            path: "asc",
          },
          select: {
            id: true,
            path: true,
            extension: true,
          },
        },
      },
    });

    if (!fileSet) {
      return {
        error: `No file information found for branch '${branch}'`,
        fileSet: null,
      };
    }

    return {
      success: true,
      fileSet: fileSet as FileSetResult,
    };
  } catch (error) {
    console.error("Database error: Failed fetching repository files:", error);
    return {
      error: "Failed to fetch repository files",
      fileSet: null,
    };
  }
}

/**
 * Fetches test coverage report for a repository
 */
export async function getCoverageReport(
  owner: string,
  repo: string,
  branch: string = "master",
): Promise<{
  error?: string;
  success?: boolean;
  metrics?: CoverageMetrics;
  fileData?: FileCoverageData[];
  timestamp?: Date;
  commitId?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        error: "Not authenticated",
      };
    }

    const result = await findRepositoryByOwnerRepo(owner, repo);

    if (!result.success || !result.repository) {
      return {
        error: "Repository not found or you don't have access to it",
      };
    }
    const repository = result.repository;

    const coverageReport = await prisma.coverageReport.findFirst({
      where: {
        repositoryId: repository.id,
        branch: branch,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!coverageReport) {
      return {
        error: "No coverage report found for this repository and branch",
      };
    }

    const metrics: CoverageMetrics = {
      statements: coverageReport.statements,
      branches: coverageReport.branches,
      functions: coverageReport.functions,
      lines: coverageReport.lines,
      overall: coverageReport.overall,
    };

    const fileCoverage = await prisma.fileCoverage.findMany({
      where: {
        coverageReportId: coverageReport.id,
      },
      orderBy: {
        filePath: "asc",
      },
    });

    const fileCoverageData: FileCoverageData[] = fileCoverage.map((file) => ({
      filePath: file.filePath,
      statements: file.statements,
      branches: file.branches,
      functions: file.functions,
      lines: file.lines,
    }));

    return {
      success: true,
      metrics: metrics,
      fileData: fileCoverageData,
      timestamp: coverageReport.timestamp,
      commitId: coverageReport.commit,
    };
  } catch (error) {
    console.error("Error fetching coverage report:", error);
    return {
      error: "Failed to fetch coverage report",
    };
  }
}

export async function fetchGraphUrl(
  owner: string,
  repo: string,
  type:
    | "COMMIT_FREQUENCY"
    | "COMMIT_SIZE"
    | "CONTRIBUTIONS"
    | "EXPORT"
    | "PULL_REQUESTS",
): Promise<string> {
  try {
    const result = await findRepositoryByOwnerRepo(owner, repo);
    if (result.success && result.repository) {
      const repoId = result.repository.id;

      const image = await prisma.repositoryImage.findFirst({
        where: {
          repositoryId: repoId,
          chartType: type,
        },
      });

      return image?.imageUrl ?? "";
    }

    return "";
  } catch (e) {
    console.error("Database error: Error fetching graph URL:", e);
    return "";
  }
}

export async function setReportGenerated(
  owner: string,
  repo: string,
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    // 1) Authentication
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // 2) Fetch the repo, including its courseInstance → userCourse → course
    const repository = await prisma.repository.findFirst({
      where: { username: owner, repoName: repo },
      include: {
        courseInstance: {
          include: {
            userCourse: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!repository) {
      return { success: false, error: "Repository not found" };
    }

    const ci = repository.courseInstance;
    if (!ci) {
      return {
        success: false,
        error: "Course instance for this repository is missing",
      };
    }

    // 3) Mark the report generated
    await prisma.repository.update({
      where: { id: repository.id },
      data: {
        hasReport: true,
        reportGeneratedAt: new Date(),
      },
    });

    // 4) Pull out the course code, year & semester
    const courseCode = ci.userCourse.course.code;
    const year = ci.year;
    const semester = ci.semester.toLowerCase();

    // 5) Trigger ISR revalidation
    revalidatePath(`/dashboard/courses/${courseCode}/${year}/${semester}`);

    return {
      success: true,
      message: "Report has been generated and dashboard revalidated.",
    };
  } catch (e) {
    console.error("Database error: Error updating report status:", e);
    return {
      success: false,
      error: "Failed to update report status",
    };
  }
}
