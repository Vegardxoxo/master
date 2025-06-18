// utility functions
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CommitEval,
  PullRequestData,
  Review,
} from "@/app/lib/definitions/definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function fixBracketedWords(jsonText: string): string {
  return jsonText.replace(
    /(\:\s*)\[([^\]]+)\]/g,
    (full, prefix, bracketContent) => {
      return `${prefix}"[${bracketContent}]"`;
    },
  );
}

export function parseModelResponse(response: any): CommitEval[] | null {
  try {
    const content: string = response.choices[0].message.content;
    const arrayRegex = /\[\s*[\s\S]*?\]/m;
    let match = content.match(arrayRegex);

    if (match) {
      let jsonSnippet = fixBracketedWords(match[0].trim());
      try {
        const parsed = JSON.parse(jsonSnippet);
        if (Array.isArray(parsed)) {
          return parsed as CommitEval[];
        } else {
          console.error(
            "Parsed JSON is not an array (from bracketed content).",
          );
        }
      } catch (err) {
        console.error("Failed to parse bracketed JSON array:", err);
      }
    }

    const objectRegex = /(\{\s*[\s\S]*?\})(?=\s*(\{|\s*$))/g;
    const objectMatches = content.match(objectRegex);
    if (objectMatches) {
      const results: CommitEval[] = [];

      for (const objStr of objectMatches) {
        const fixedObjStr = fixBracketedWords(objStr);
        try {
          const parsedObject = JSON.parse(fixedObjStr);
          results.push(parsedObject);
        } catch (err) {
          console.error("Failed to parse one object:\n", objStr, err);
        }
      }

      if (results.length > 0) {
        return results;
      }
    }

    console.error("No valid JSON array or objects could be parsed.");
    return null;
  } catch (err) {
    console.error("Failed to parse JSON from model response:", err);
    return null;
  }
}

export function parsePullRequests(data: any[]): PullRequestData {
  const totalPRs = data.length;
  const openPRs = data.filter((pr) => pr.state === "open").length;
  const closedPRs = totalPRs - openPRs;

  const commentsByMembers: Record<string, number> = {};
  const prsByMember: Record<string, Review> = {};
  const reviewsByMember: Record<string, Review> = {};

  let totalComments = 0;
  let prsWithReview = 0;
  let prsWithoutReview = 0;
  let prsLinkedToIssues = 0;
  const labelCounts: Record<string, { count: number; color: string }> = {};

  const milestones: Set<string> = new Set();
  const pullRequests: any[] = data;

  data.forEach((pr) => {
    // PRs by member
    if (!prsByMember[pr.user]) {
      prsByMember[pr.user] = { count: 0, prs: [] };
    }
    prsByMember[pr.user].count++;
    prsByMember[pr.user].prs.push(pr);

    // Reviews by member
    Object.entries(pr.reviewers).forEach(([reviewer, count]) => {
      if (!reviewsByMember[reviewer]) {
        reviewsByMember[reviewer] = { count: 0, prs: [] };
      }
      reviewsByMember[reviewer].count += count as number;
      reviewsByMember[reviewer].prs.push(pr);
    });
    // Comments by member
    Object.entries(pr.commenters || {}).forEach(([commenter, count]) => {
      commentsByMembers[commenter] =
        (commentsByMembers[commenter] || 0) + (count as number);
    });

    if (pr.review_comments.length > 0) {
      commentsByMembers[pr.user] = (commentsByMembers[pr.user] || 0) + 1;
      totalComments += 1;
    }
    totalComments += pr.comments;

    // PRs with/without review
    if (pr.reviews > 0) {
      prsWithReview++;
    } else {
      prsWithoutReview++;
    }

    // PRs linked to issues
    if (pr.linked_issues > 0) {
      prsLinkedToIssues++;
    }

    // Label usage
    if (pr.labels) {
      pr.labels.forEach((label: { name: string; color: string }) => {
        if (!labelCounts[label.name]) {
          labelCounts[label.name] = { count: 0, color: label.color };
        }
        labelCounts[label.name].count += 1;
      });
    }

    milestones.add(pr.milestone);
  });

  const averageCommentsPerPR = totalPRs > 0 ? totalComments / totalPRs : 0;
  const percentageLinkedToIssues = (prsLinkedToIssues / totalPRs) * 100;

  const averageTimeToMerge =
    data.reduce((sum, pr) => {
      if (pr.merged_at) {
        const createDate = new Date(pr.created_at);
        const mergeDate = new Date(pr.merged_at);
        return (
          sum + (mergeDate.getTime() - createDate.getTime()) / (1000 * 3600)
        );
      }
      return sum;
    }, 0) / data.filter((pr) => pr.merged_at).length;

  const fastMergedPRs = data.filter((pr) => {
    if (pr.merged_at) {
      const createDate = new Date(pr.created_at);
      const mergeDate = new Date(pr.merged_at);
      const timeDiffMinutes =
        (mergeDate.getTime() - createDate.getTime()) / (1000 * 60);
      return timeDiffMinutes <= 5;
    }
    return false;
  });

  return {
    totalPRs,
    openPRs,
    closedPRs,
    averageTimeToMerge,
    prsByMember,
    reviewsByMember,
    prsWithReview,
    prsWithoutReview,
    averageCommentsPerPR,
    commentsByMembers,
    percentageLinkedToIssues,
    milestones,
    labelCounts,
    fastMergedPRs,
    totalComments,
    pullRequests,
  };
}

export function createChartData(
  data: PullRequestData,
  selectedMembers: string[],
  selectedMilestone: string,
) {
  // Create a map to store PR counts by date and member
  const prCountsByDate = new Map<string, Record<string, number>>();

  // Process each selected member's PRs
  selectedMembers.forEach((member) => {
    const memberData = data.prsByMember[member];
    if (!memberData) return;

    // Filter PRs by milestone if needed
    const filteredPRs =
      selectedMilestone === "all"
        ? memberData.prs
        : memberData.prs.filter((pr) => pr.milestone === selectedMilestone);

    // Count PRs by date
    filteredPRs.forEach((pr) => {
      const date = new Date(pr.created_at).toISOString().split("T")[0];

      if (!prCountsByDate.has(date)) {
        prCountsByDate.set(date, {});
      }

      const dateData = prCountsByDate.get(date)!;
      dateData[member] = (dateData[member] || 0) + 1;
    });
  });

  // Convert the map to an array of objects for the chart
  return Array.from(prCountsByDate.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Transforms local image references in markdown to their new repo-relative paths.
 */
export function transformLocalImagePaths(
  markdown: string,
  replacements: Record<string, string>,
): string {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const rel = replacements[src] || src;
    return `![${alt}](${rel})`;
  });
}
