"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import type {
  Course,
  CourseInstance,
  CoverageMetrics,
  FileCoverageData,
  FileSetResult,
  Repository,
  UserCourse,
} from "@/app/lib/definitions";

const prisma = new PrismaClient();

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

interface Repo {
  id: string;
  username: string;
  repoName: string;
  url: string;
  platform: "github" | "gitlab";
}

export async function getRepository(
  id: string,
): Promise<{ error?: string; repository: Repo | null }> {
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
        platform: true,
      },
    });
    if (!repo) {
      return {
        error: "Repository not found",
        repository: null,
      };
    }
    return {
      repository: repo as Repo,
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
  repositories: Repo[];
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
        platform: true,
      },
    });

    return {
      success: true,
      repositories: repositories as Repo[],
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
    if (!session || !session.user || !session.user.email) {
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

export async function findRepositoryByGithubId(githubId: string) {
  try {
    const repository = await prisma.repository.findFirst({
      where: { githubId },
    });
    return repository;
  } catch (e) {
    return {
      error: "Database error: Failed to fetch repository.",
      repository: null,
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
  branch: string = "main",
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

    const repository = await prisma.repository.findFirst({
      where: {
        username: owner,
        repoName: repo,
      },
    });

    if (!repository) {
      return {
        error: "Repository not found or you don't have access to it",
      };
    }

    console.log("Looking for coverage report with:", {
      repositoryId: repository.id,
      branch,
    });

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
