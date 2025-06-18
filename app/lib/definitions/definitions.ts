import { ReportSectionProps } from "@/app/ui/dashboard/report/report-sections/sensitive-files";

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

export type User = {
  id: string;
  email: string;
};
export type Commit = {
  author: string;
  message: string;
  date: string | null;
  url: string;
  branch: string;
};

export type CommitMessageShort = {
  id: string;
  commit_message: string;
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

export type MenuItem = {
  visible: boolean;
  text: string;
};

export type VisibleSections = {
  overview: {
    visible: boolean;
    text: string;
    contributors: MenuItem;
    distribution: MenuItem;
    milestones: MenuItem;
    info: MenuItem;
    files: MenuItem;
    coverage: MenuItem;
  };
  commits: {
    visible: boolean;
    text: string;
    quality: MenuItem;
    frequency: MenuItem;
    size: MenuItem;
    contributions: MenuItem;
  };
  branches: {
    visible: boolean;
    text: string;
    to_main: MenuItem;
    strategy: MenuItem;
    issuesVsPrs: MenuItem;
  };
  pipelines: boolean | MenuItem;
  pullRequests: {
    visible: boolean;
    text: string;
    overview: MenuItem;
    members: MenuItem;
    comments: MenuItem;
    reviews: MenuItem;
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
  pullRequests: any[];
};

export type Repository = {
  id: string;
  username: string;
  repoName: string;
  url?: string;
  updatedAt?: Date;
  hasReport?: boolean;
  reportGeneratedAt?: Date;
  openIssues?: string;
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
  metrics: any;
  data?: any;
  include: boolean;
}

export interface CommitData {
  sha?: string;
  branch: string;
  associatedPullRequests: boolean;
  html_url?: string;
  commit: {
    author: {
      name: string;
      email: string;
      date?: string;
    };
    message: string;
    url: string;
  };
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface GithubRepoOverview {
  id?: string;
  name?: string;
  url?: string;
  openIssues?: string;
  updatedAt?: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  success: boolean;
  error?: string;
}
