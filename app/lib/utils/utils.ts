// utility functions
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";
import {
  AuthorFrequency,
  CommitEval,
  CommitMessageLong,
  CommitStats,
  DayEntry,
  LLMResponse,
  MappedCommitMessage,
  ParseCommitDataResult,
  PullRequestData,
  Review,
} from "@/app/lib/definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseCSV(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .filter(
            (name): name is string =>
              typeof name === "string" && name.trim() !== "",
          );
        resolve(names);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}

function parseCoAuthorLine(line: string): { name: string; email: string } {
  const clean = line.replace("Co-authored-by:", "").trim();

  // Match the pattern "Name <email>"
  const match = clean.match(/^(.*?)\s*<([^>]+)>/);

  if (!match) {
    return { name: clean, email: "unknown@invalid.com" };
  }

  const name = match[1].trim();
  const email = match[2].trim().toLowerCase();

  return { name, email };
}

export function parseCommitData(commitData: any[]): ParseCommitDataResult {
  const dayMap: Record<string, AuthorFrequency> = {};
  const dayTotals: Record<string, number> = {};
  const emailToDisplayName: Record<string, string> = {};
  const allEmails = new Set<string>();
  const commitSummary = [];
  const commitByDate = [];

  for (const item of commitData) {
    const authorName = item.commit.author.name ?? "unknown";
    const authorEmail = item.commit.author.email ?? "unknown";
    const commitDate = item.commit.author.date;
    const message = item.commit.message;
    const url = item.commit.url;
    const htmlUrl = item.html_url;
    const sha = item.sha;
    commitSummary.push({ sha, url, commit_message: message });
    commitByDate.push({
      authorEmail,
      authorName,
      commitDate,
      message,
      htmlUrl,
    });

    emailToDisplayName[authorEmail] = authorName;
    const day = new Date(commitDate).toISOString().split("T")[0];

    // --- MAIN-AUTHOR ---
    // if the datastructures have not been initialized
    if (!dayMap[day]) dayMap[day] = {};
    if (!dayTotals[day]) dayTotals[day] = 0;

    if (!dayMap[day][authorEmail]) {
      dayMap[day][authorEmail] = 0;
    }
    dayMap[day][authorEmail]++;
    dayTotals[day]++;

    // --- CO-AUTHORS ---
    const lines = message.split("\n");
    const coAuthorLines = lines.filter((line: string) =>
      line.trim().startsWith("Co-authored-by:"),
    );

    for (const line of coAuthorLines) {
      const { email, name } = parseCoAuthorLine(line);
      emailToDisplayName[email] = name;
      if (!dayMap[day][email]) {
        dayMap[day][email] = 0;
      }
      dayMap[day][email]++;
    }

    allEmails.add(authorEmail);
    for (const line of coAuthorLines) {
      const { email } = parseCoAuthorLine(line);
      allEmails.add(email);
    }
  }

  // Sum the total number of commits for the given day
  allEmails.add("TOTAL@commits");
  for (const day of Object.keys(dayMap)) {
    dayMap[day]["TOTAL@commits"] = dayTotals[day] ?? 0;
    emailToDisplayName["TOTAL@commits"] = "Total";
  }

  const dayEntries: DayEntry[] = Object.entries(dayMap)
    .map(([day, authorsMap]) => ({
      day,
      ...authorsMap,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // total count for all days
  let total = 0;
  for (const day of dayEntries) {
    total += day["TOTAL@commits"] as number;
  }

  return {
    dayEntries,
    total,
    emailToDisplayName,
    commitSummary,
    commitByDate,
  };
}

function fixBracketedWords(jsonText: string): string {
  return jsonText.replace(
    // Find patterns like : [Fix]
    /(\:\s*)\[([^\]]+)\]/g,
    (full, prefix, bracketContent) => {
      // Convert e.g. : [Fix] into : "[Fix]"
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

/**
 * Removes things like ["DOCS"] from the commit messages as this makes it hard to parse as JSON objects.
 * @param commits
 */
export function preprocessCommit(
  commits: CommitMessageLong[],
): CommitMessageLong[] {
  return commits.map((commit) => {
    const newCommit = { ...commit };
    newCommit.commit_message = newCommit.commit_message.replace(
      /\[([^\]]+)\]/g,
      "($1)",
    );
    newCommit.commit_message = newCommit.commit_message.trim();
    newCommit.url = newCommit.url.replace(/\r?\n/g, " ").trim();
    newCommit.commit_message = newCommit.commit_message.replace(
      /\[([^\]]+)\]/g,
      "($1)",
    );

    return newCommit;
  });
}

export function createUrlMap(commits: CommitMessageLong[]): {
  mappedCommits: MappedCommitMessage[];
  urlMap: Record<string, string>;
} {
  const urlMap: Record<string, string> = {};
  const mappedCommits: MappedCommitMessage[] = commits.map((item, index) => {
    const idx = String(index);
    urlMap[idx] = item.url;
    return {
      id: idx,
      commit_message: item.commit_message,
    };
  });
  return { mappedCommits, urlMap };
}

export function mapIdToUrl(
  reponse: CommitEval[],
  urlMap: Record<string, string>,
): LLMResponse[] {
  return reponse.map((obj) => {
    return {
      url: urlMap[obj.id] || "UNKNOWN_URL",
      commit_message: obj.commit_message,
      category: obj.category,
      reason: obj.reason,
    };
  });
}

export function parseCommitStats(...data: any[]) {
  let statMap: Record<string, CommitStats> = {};
  data.forEach((obj) => {
    const email = obj.commit.committer.email;
    const name = obj.commit.committer.name;
    // create a key for the user if it doesn't exist
    if (!statMap[email]) {
      statMap[email] = {
        total: 0,
        additions: 0,
        deletions: 0,
        commits: 0,
        name: name,
        average_changes: 0,
        biggest_commit: 0,
        biggest_commit_url: "",
      };
    }
    statMap[email].total += obj.stats.total;
    statMap[email].additions += obj.stats.additions;
    statMap[email].deletions += obj.stats.deletions;
    statMap[email].commits += 1;
  });
  return statMap;
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

  // collect all milestones in an array

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
 * Utility function for replacing local urls with the ones on github
 */
export function transformLocalImagePaths(
  content: string,
  replacements: Record<string, string>
): string {
  let updated = content;

  for (const [oldPath, newPath] of Object.entries(replacements)) {
    const escapedOld = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\]\\(${escapedOld}\\)`, "g");
    updated = updated.replace(pattern, `](${newPath})`);
  }

  return updated;
}