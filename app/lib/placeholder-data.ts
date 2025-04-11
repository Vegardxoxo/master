// placeholder data

import { Home, Settings } from "lucide-react";
import {CommitEval, LLMResponse, Payment, repositoryOverview, VisibleSections} from "@/app/lib/definitions/definitions";


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


export const defaultVisibleSections: VisibleSections = {
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
}
