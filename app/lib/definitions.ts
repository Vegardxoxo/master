export type repositoryOverview = {
  owner: string;
  name: string;
  contributors: string[];
  openIssues: number;
  url: string;
};

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
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
  url: string;
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

export type VisibleSections = {
  [key: string]:
    | boolean
    | {
        visible: boolean;
        [subKey: string]: boolean;
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
  labelCounts: Record<string, number>;
  fastMergedPRs: any[];
  totalComments: number;
};
