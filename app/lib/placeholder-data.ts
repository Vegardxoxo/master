// placeholder data

import {
  LLMResponse,
  VisibleSections,
} from "@/app/lib/definitions/definitions";

export async function getDummyModelData(): Promise<LLMResponse[]> {
  return [
    {
      url: "a1b2c3",
      commit_message:
        "Set up project structure and added initial configuration",
      category: "Good",
      reason:
        "Clearly states what was done but does not explain the motivation or give specifics about the configuration.",
    },
    {
      url: "d4e5f6",
      commit_message: "Implemented user authentication feature",
      category: "Good",
      reason:
        "Describes the main change (adding authentication), yet lacks detail on scope, methods, or rationale.",
    },
    {
      url: "g7h8i9",
      commit_message: "Fixed issue with login validation",
      category: "Good",
      reason:
        "Indicates a bug fix and its context (login validation) but omits the underlying cause or approach taken.",
    },
    {
      url: "j1k2l3",
      commit_message:
        "Refactored API calls for better performance. Resolves #23",
      category: "Excellent",
      reason:
        "Specifies what was refactored, why (better performance), and links to the related issue.",
    },
    {
      url: "m4n5o6",
      commit_message: "Added detailed contributor guidelines in README",
      category: "Excellent",
      reason:
        "Explains what changed (README guidelines) and implicitly why (to guide contributors), providing sufficient clarity and context.",
    },
    {
      url: "p7q8r9",
      commit_message: "changes",
      category: "Needs Improvement",
      reason:
        "Extremely vague; offers no insight into what was changed or why.",
    },
    {
      url: "s1t2u3",
      commit_message: "fix stuff",
      category: "Needs Improvement",
      reason:
        "Provides neither detail about the problem nor the fix; lacks context entirely.",
    },
    {
      url: "s1t2u3",
      commit_message: "progress",
      category: "Needs Improvement",
      reason:
        "Generic and uninformative; does not describe what progress was made.",
    },
    {
      url: "s1t2u3",
      commit_message: "FINALLY WORKING",
      category: "Needs Improvement",
      reason:
        "Emotional statement without technical detail; fails to explain what is working or how.",
    },
  ];
}

export const defaultVisibleSections: VisibleSections = {
  overview: {
    visible: true,
    text: "Repository Overview",
    contributors: { visible: true, text: "Contributors" },
    distribution: { visible: true, text: "Language Distribution" },
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
    issuesVsPrs: { visible: true, text: "Issues vs. Pull Requests" },
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
};

export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#a65628",
  "#f781bf",
  "#999999",
  "#e41a1c",
  "#377eb8",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33",
  "#a6cee3",
  "#1f78b4",
  "#b2df8a",
];
