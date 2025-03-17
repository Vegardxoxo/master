// placeholder data

import { Home, Settings } from "lucide-react";
import {
  CommitEval,
  Course,
  CourseInstance,
  LLMResponse,
  Payment,
  repositoryOverview,
  UserCourse
} from "@/app/lib/definitions";

// export const getRepos = [
//   { owner: "Vegardxoxo", repo: "bachelor_project" },
//   { owner: "Vegardxoxo", repo: "tail" },
//   { owner: "Vegardxoxo", repo: "nextjs-blog" },
//   { owner: "Vegardxoxo", repo: "master" },
// ];

export const getRepos = () => {
  const repos: { owner: string; repo: string }[] = [];
  for (let i = 1; i < 15; i++) {
    const owner = "IT2810-H24";
    const repo = `T${i < 10 ? `0${i}` : i}-Project-2`;
    repos.push({ owner, repo });
  }
  return repos;
};

// export const getRepos = [
//   { owner: "IT2810-H24", repo: "T01-Project-2" },
//   { owner: "IT2810-H24", repo: "T02-Project-2" },
//   { owner: "IT2810-H24", repo: "T03-Project-2" },
//   { owner: "IT2810-H24", repo: "T04-Project-2" },
// ];

export const courses = [
  {
    name: "WebDev",
    slug: "webdev",
  },
  {
    name: "ITGK",
    slug: "itgk",
  },
  {
    name: "Maskinlæring",
    slug: "Maskinlaering",
  },
];

export const links = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "About",
    href: "/about",
    icon: Settings,
  },
];

export async function getDummyModelData(): Promise<LLMResponse[]> {
  return [
    {
      url: "https://github.com/IT2810-H24/T01-Project-2/commit/a1b2c3",
      commit_message:
        "Set up project structure and added initial configuration",
      category: "Excellent",
      reason: "Clear and descriptive message reflecting the changes made",
    },
    {
      url: "https://github.com/IT2810-H24/T02-Project-2/commit/d4e5f6",
      commit_message: "Implemented user authentication feature",
      category: "Good",
      reason:
        "Descriptive but could include more specifics about the implementation",
    },
    {
      url: "https://github.com/IT2810-H24/T03-Project-2/commit/g7h8i9",
      commit_message: "Fixed issue with login validation",
      category: "Needs Improvement",
      reason: "Message lacks detail about the specific problem and solution",
    },
    {
      url: "https://github.com/IT2810-H24/T04-Project-2/commit/j1k2l3",
      commit_message: "Refactored API calls for better performance",
      category: "Good",
      reason: "Message is clear but could provide a more detailed context",
    },
    {
      url: "https://github.com/IT2810-H24/T05-Project-2/commit/m4n5o6",
      commit_message: "Added detailed contributor guidelines in README",
      category: "Excellent",
      reason: "Very clear and helpful for future collaborators",
    },
    {
      url: "https://github.com/IT2810-H24/T06-Project-2/commit/p7q8r9",
      commit_message: "Optimized database queries for faster response times",
      category: "Good",
      reason:
        "Message is descriptive but could specify what optimizations were made",
    },
    {
      url: "https://github.com/IT2810-H24/T07-Project-2/commit/s1t2u3",
      commit_message: "Fixed typo in error messages displayed to users",
      category: "Needs Improvement",
      reason: "Message is accurate but too trivial for a single commit",
    },
  ];
}

export async function getData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "A@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "AA@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "c@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "b@example.com",
    },
  ];
}

export async function getDummyRepoData(): Promise<repositoryOverview[]> {
  return [
    {
      name: "Repo1",
      contributors: ["Vegardxoxo", "JohnDoe", "JohnDoe", "JohnDoe"],
      openIssues: 5,
      url: "https://github.com/Vegardxoxo/Repo1",
    },
    {
      name: "Repo2",
      contributors: ["JaneDoe", "Alice"],
      openIssues: 3,
      url: "https://github.com/Vegardxoxo/Repo2",
    },
    {
      name: "Repo3",
      contributors: ["Bob", "Charlie"],
      openIssues: 8,
      url: "https://github.com/Vegardxoxo/Repo3",
    },
    {
      name: "Repo4",
      contributors: ["Dave", "Eve"],
      openIssues: 2,
      url: "https://github.com/Vegardxoxo/Repo4",
    },
    {
      name: "Repo5",
      contributors: ["Frank", "Grace"],
      openIssues: 7,
      url: "https://github.com/Vegardxoxo/Repo5",
    },
    {
      name: "Repo6",
      contributors: ["Heidi", "Ivan"],
      openIssues: 1,
      url: "https://github.com/Vegardxoxo/Repo6",
    },
    {
      name: "Repo7",
      contributors: ["Judy", "Mallory"],
      openIssues: 4,
      url: "https://github.com/Vegardxoxo/Repo7",
    },
    {
      name: "Repo8",
      contributors: ["Niaj", "Olivia"],
      openIssues: 6,
      url: "https://github.com/Vegardxoxo/Repo8",
    },
    {
      name: "Repo9",
      contributors: ["Peggy", "Sybil"],
      openIssues: 9,
      url: "https://github.com/Vegardxoxo/Repo9",
    },
    {
      name: "Repo10",
      contributors: ["Trent", "Victor"],
      openIssues: 0,
      url: "https://github.com/Vegardxoxo/Repo10",
    },
    {
      name: "Repo11",
      contributors: ["Walter", "Xena"],
      openIssues: 5,
      url: "https://github.com/Vegardxoxo/Repo11",
    },
    {
      name: "Repo12",
      contributors: ["Yvonne", "Zara"],
      openIssues: 3,
      url: "https://github.com/Vegardxoxo/Repo12",
    },
    {
      name: "Repo13",
      contributors: ["Adam", "Brian"],
      openIssues: 8,
      url: "https://github.com/Vegardxoxo/Repo13",
    },
    {
      name: "Repo14",
      contributors: ["Cathy", "Derek"],
      openIssues: 2,
      url: "https://github.com/Vegardxoxo/Repo14",
    },
    {
      name: "Repo15",
      contributors: ["Ethan", "Fiona"],
      openIssues: 7,
      url: "https://github.com/Vegardxoxo/Repo15",
    },
    {
      name: "Repo16",
      contributors: ["George", "Hannah"],
      openIssues: 1,
      url: "https://github.com/Vegardxoxo/Repo16",
    },
    {
      name: "Repo17",
      contributors: ["Isaac", "Jack"],
      openIssues: 4,
      url: "https://github.com/Vegardxoxo/Repo17",
    },
    {
      name: "Repo18",
      contributors: ["Karen", "Liam"],
      openIssues: 6,
      url: "https://github.com/Vegardxoxo/Repo18",
    },
    {
      name: "Repo19",
      contributors: ["Mona", "Nate"],
      openIssues: 9,
      url: "https://github.com/Vegardxoxo/Repo19",
    },
    {
      name: "Repo20",
      contributors: ["Oscar", "Paul"],
      openIssues: 0,
      url: "https://github.com/Vegardxoxo/Repo20",
    },
  ];
}


const obj = {
    "johanndn@stud.ntnu.no": {
        "total": 12731,
        "additions": 8362,
        "deletions": 4369,
        "commits": 14,
        "name": "Johanne Dahl Norland"
    },
    "mariuwos@stud.ntnu.no": {
        "total": 29205,
        "additions": 24629,
        "deletions": 4576,
        "commits": 40,
        "name": "Marius Waag Østro"
    },
    "jennystr@stud.ntnu.no": {
        "total": 17295,
        "additions": 12646,
        "deletions": 4649,
        "commits": 62,
        "name": "Jenny Straumbotn"
    },
    "johannedn00@gmail.com": {
        "total": 19998,
        "additions": 16446,
        "deletions": 3552,
        "commits": 40,
        "name": "johannedn"
    }
}


export async function getDummyUserCourses(): Promise<{
  error?: string;
  success?: boolean;
  enrolledCourses: UserCourse[];
}> {
  return {
    success: true,
    enrolledCourses: [
      {
        id: "uc-1",
        userId: "dummy-user-id",
        courseId: "c-1",
        role: "STUDENT",
        createdAt: new Date(),
        updatedAt: new Date(),
        course: {
          id: "c-1",
          code: "CS101",
          name: "Introduction to Computer Science",
          description: "Fundamental concepts of programming and computer science",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        instances: [
          {
            id: "ci-1",
            courseId: "c-1",
            year: 2024,
            semester: "SPRING",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "ci-2",
            courseId: "c-1",
            year: 2023,
            semester: "FALL",
            active: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      },
      {
        id: "uc-2",
        userId: "dummy-user-id",
        courseId: "c-2",
        role: "TEACHING_ASSISTANT",
        createdAt: new Date(),
        updatedAt: new Date(),
        course: {
          id: "c-2",
          code: "CS201",
          name: "Data Structures and Algorithms",
          description: "Study of common data structures and algorithms",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        instances: [
          {
            id: "ci-3",
            courseId: "c-2",
            year: 2024,
            semester: "SPRING",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      },
      {
        id: "uc-3",
        userId: "dummy-user-id",
        courseId: "c-3",
        role: "STUDENT",
        createdAt: new Date(),
        updatedAt: new Date(),
        course: {
          id: "c-3",
          code: "CS301",
          name: "Software Engineering",
          description: "Software development processes and methodologies",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        instances: [
          {
            id: "ci-4",
            courseId: "c-3",
            year: 2024,
            semester: "SPRING",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      }
    ]
  };
}


export async function getDummyCourseInstance(
  courseCode: string,
  year: number,
  semester: string,
): Promise<{
  error?: string;
  success?: boolean;
  courseInstance: CourseInstance | null;
  course?: Course;
}> {
  // Get the same data from getDummyUserCourses to maintain consistency
  const { enrolledCourses } = await getDummyUserCourses();

  // Normalize semester for consistency (FALL in dummy data vs input parameter)
  const normalizedSemester = semester.toUpperCase();

  // Find the course by code
  const userCourse = enrolledCourses.find(uc => uc.course.code === courseCode);
  if (!userCourse) {
    return {
      error: "Course not found",
      courseInstance: null,
    };
  }

  // Find the specific instance by year and semester
  const instance = userCourse.instances.find(
    inst => inst.year === year &&
    (inst.semester.toUpperCase() === normalizedSemester ||
    (normalizedSemester === "AUTUMN" && inst.semester.toUpperCase() === "FALL"))
  );

  if (!instance) {
    return {
      error: `No ${semester} ${year} instance found for this course`,
      courseInstance: null,
    };
  }

  // Create a courseInstance object with the necessary structure
  const courseInstance = {
    ...instance,
    userCourseId: userCourse.id,
    userCourse: {
      ...userCourse,
      // Remove the instances array since it's not in the getCourseInstance return structure
      instances: undefined
    }
  };

  return {
    success: true,
    courseInstance,
    course: userCourse.course,
  };
}

export async function getMockRepositories(courseInstanceId: string): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  repositories: any[];
}> {
  // Mock repositories database
  const allRepositories = {
    // CS101 Spring 2024
    "ci-1": [
      {
        id: "repo-1",
        username: "student-1",
        repoName: "cs101-assignment1",
        url: "https://github.com/student-1/cs101-assignment1",
        platform: "GITHUB",
      },
      {
        id: "repo-2",
        username: "student-1",
        repoName: "cs101-project",
        url: "https://github.com/student-1/cs101-project",
        platform: "GITHUB",
      },
      {
        id: "repo-3",
        username: "course-admin",
        repoName: "cs101-materials",
        url: "https://github.com/course-admin/cs101-materials",
        platform: "GITHUB",
      }
    ],
    // CS101 Fall 2023
    "ci-2": [
      {
        id: "repo-4",
        username: "student-1",
        repoName: "cs101-assignment1-2023",
        url: "https://github.com/student-1/cs101-assignment1-2023",
        platform: "GITHUB",
      },
      {
        id: "repo-5",
        username: "course-admin",
        repoName: "cs101-materials-2023",
        url: "https://github.com/course-admin/cs101-materials-2023",
        platform: "GITHUB",
      }
    ],
    // CS201 Spring 2024
    "ci-3": [
      {
        id: "repo-6",
        username: "student-1",
        repoName: "cs201-datastructures",
        url: "https://github.com/student-1/cs201-datastructures",
        platform: "GITHUB",
      },
      {
        id: "repo-7",
        username: "student-1",
        repoName: "cs201-algorithms-project",
        url: "https://github.com/student-1/cs201-algorithms-project",
        platform: "GITHUB",
      },
      {
        id: "repo-8",
        username: "course-admin",
        repoName: "cs201-resources",
        url: "https://gitlab.com/course-admin/cs201-resources",
        platform: "GITLAB",
      }
    ],
    // CS301 Spring 2024
    "ci-4": [
      {
        id: "repo-9",
        username: "student-1",
        repoName: "software-engineering-group-project",
        url: "https://github.com/student-1/software-engineering-group-project",
        platform: "GITHUB",
      },
      {
        id: "repo-10",
        username: "team-alpha",
        repoName: "cs301-team-project",
        url: "https://gitlab.com/team-alpha/cs301-team-project",
        platform: "GITLAB",
      }
    ]
  };

  // Return the repositories for the given course instance ID or an empty array if none exist
  const repositories = allRepositories[courseInstanceId] || [];

  return {
    success: true,
    repositories,
  };
}
