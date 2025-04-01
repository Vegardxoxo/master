import {ReportSectionProps} from "@/app/ui/dashboard/report/report-sections/sensitive-files";

export type repositoryOverview = {
  databaseId: string;
  owner: string;
  name: string;
  contributors: string[];
  openIssues: number;
  url: string;
};

export type UserCourse = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  course: Course;
  instances: CourseInstance[];
};
export type CourseInstance = {
  id: string;
  year: number;
  semester: "SPRING" | "AUTUMN";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userCourseId: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
};

export type CourseSubject = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
};

export type User = {
  id: string;
  email: string;
};
export type Commit = {
  author: string;
  message: string;
  date: string | null;
  url: string;
};

export type _Branches = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks: {
      enforcement_level: string;
      contexts: string[];
      checks: string[];
    };
  };
};

export type MappedCommitMessage = {
  id: string;
  commit_message: string;
};

export type CommitMessageLong = {
  sha: string;
  url: string;
  commit_message: string;
};

export type CommitMessageShort = {
  id: string;
  commit_message: string;
};

export type CommitByDate = {
  authorEmail: string;
  authorName: string;
  commitDate: string;
  message: string;
  htmlUrl: string;
};
export type ParseCommitDataResult = {
  dayEntries: DayEntry[];
  total: number;
  emailToDisplayName: Record<string, string>;
  commitSummary: CommitMessageLong[];
  commitByDate: CommitByDate[];
};

export type AuthorFrequency = {
  [authorName: string]: number;
};

export type DayEntry = {
  day: string;
  [authorName: string]: string | number;
};

export type CommitEval = {
  id: string;
  commit_message: string;
  category: "Excellent" | "Good" | "Needs Improvement";
  reason: string;
};

export type LLMResponse = {
  url?: string;
  commit_message: string;
  category: "Excellent" | "Good" | "Needs Improvement";
  reason: string;
};

export interface CommitStats {
  name: string;
  total: number;
  additions: number;
  deletions: number;
  commits: number;
  average_changes: number;
  biggest_commit: number;
  biggest_commit_url: string;
  co_authored_lines: number;
  additions_deletions_ratio: number;
  group_average: number;
}

// export type VisibleSections = {
//   [key: string]:
//     | boolean
//     | {
//         visible: boolean;
//         [subKey: string]: boolean;
//       };
// };

export type VisibleSections = {
  overview: {
    visible: boolean;
    contributors: boolean;
    milestones: boolean;
    info: boolean;
    files: boolean;
    coverage: boolean;
  };
  commits: {
    visible: boolean;
    quality: boolean;
    frequency: boolean;
    size: boolean;
    contributions: boolean;
  };
  branches: {
    visible: boolean;
    to_main: boolean;
    strategy: boolean;
  };
  pipelines: boolean;
  pullRequests: {
    visible: boolean;
    overview: boolean;
    members: boolean;
    comments: boolean;
    reviews: boolean;
  };
};

export type Review = {
  count: number;
  prs: any[];
};

export type PullRequestData = {
  totalPRs: number;
  openPRs: number;
  closedPRs: number;
  averageTimeToMerge: number;
  milestones: Set<string>;
  prsByMember: Record<string, Review>;
  reviewsByMember: Record<string, Review>;
  commentsByMembers: Record<string, number>;
  prsWithReview: number;
  prsWithoutReview: number;
  averageCommentsPerPR: number;
  percentageLinkedToIssues: number;
  labelCounts: Record<string, { count: number; color: string }>;
  fastMergedPRs: any[];
  totalComments: number;
};

export type Repository = {
  id: string;
  username: string;
  repoName: string;
  url: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
  courseInstanceId: string;
  githubId: string;
};

export type FileData = {
  id: string;
  path: string;
  extension: string;
};

export type FileSetResult = {
  id: string;
  repositoryId: string;
  branch: string;
  commit: string;
  files: {
    id: string;
    path: string;
    extension: string;
  }[];
};

export type CoverageMetrics = {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  overall: number;
};

export type FileCoverageData = {
  filePath: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  overall?: number;
};

export interface BranchConnection {
  branchName: string;
  issueNumber: string | null;
  isLinked: boolean;
  issueTitle: string | null;
  url: string;
}

export interface ReportSectionProps {
  fileData: any;
  additionalData?: any;
  recommendations: string;
  setRecommendations: (value: string) => void;
  include: boolean;
}