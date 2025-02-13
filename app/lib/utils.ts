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
  // console.log(clean)
  // const match = clean.match(/^(.*?)<(.*?)>$/);
  //
  // if (!match) {
  //   return { name: clean, email: "unknown@invalid.com" };
  // }
  // const name = match[1].trim();
  // const email = match[2].trim().toLowerCase();
  const name = "doe";
  const email = clean.trim().toLowerCase();
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

export function parseCommitStatsGraphQL(data: any[]) {
  const statMap: Record<string, CommitStats> = {};

  data.forEach((commit) => {
    if (!commit) return;

    const authorEmail: string = commit.author?.email || "unknown";
    const name: string = commit.author?.name || "unknown";
    const commitTotal: number =
      (commit.additions || 0) + (commit.deletions || 0);
    const commitUrl: string = commit.url || "";
    const message = commit.message || "";

    // Ensure an entry exists for each author
    if (!statMap[authorEmail]) {
      statMap[authorEmail] = {
        total: 0,
        additions: 0,
        deletions: 0,
        commits: 0,
        name,
        biggest_commit: 0,
        biggest_commit_url: "",
        co_authored_lines: 0,
        average_changes: 0,
        group_average: 0,
        additions_deletions_ratio: 0,
      };
    }

    // Update stats for main author
    statMap[authorEmail].total += commitTotal;
    statMap[authorEmail].additions += commit.additions || 0;
    statMap[authorEmail].deletions += commit.deletions || 0;
    statMap[authorEmail].commits += 1;

    // Track co-authors
    const lines = message.split("\n");
    let coAuthorLines = lines.filter((line: string) =>
      line.trim().startsWith("Co-authored-by:"),
    );
    coAuthorLines = coAuthorLines.filter((line: string) => line.length > 0);

    for (const line of coAuthorLines) {
      const { email } = parseCoAuthorLine(line);
      if (!email) continue;

      // Create an entry if co-author doesn't exist yet
      if (!statMap[email]) {
        statMap[email] = {
          total: 0,
          additions: 0,
          deletions: 0,
          commits: 0,
          name: "Unknown Co-Author",
          biggest_commit: 0,
          biggest_commit_url: "",
          co_authored_lines: 0,
          average_changes: 0,
          group_average: 0,
          additions_deletions_ratio: 0,
        };
      }
      statMap[email].co_authored_lines += commitTotal;
    }

    // Check if this commit is the biggest for the main author
    if (commitTotal > statMap[authorEmail].biggest_commit) {
      statMap[authorEmail].biggest_commit = commitTotal;
      statMap[authorEmail].biggest_commit_url = commitUrl;
    }
  });

  // Calculate totals for the entire project
  let overallTotal = 0;
  let overallCommits = 0;

  for (const email of Object.keys(statMap)) {
    const stats = statMap[email];
    overallTotal += stats.total;
    overallCommits += stats.commits;
  }

  const projectAverage = overallCommits > 0 ? overallTotal / overallCommits : 0;

  for (const email of Object.keys(statMap)) {
    const stats = statMap[email];

    if (stats.commits > 0) {
      stats.average_changes = stats.total / stats.commits;
    }

    // Ratio of additions to deletions
    if (stats.deletions === 0) {
      stats.additions_deletions_ratio = stats.additions;
    } else {
      stats.additions_deletions_ratio = stats.additions / stats.deletions;
    }

    stats.group_average = projectAverage;
  }

  return statMap;
}

export function parseRawPullRequests(data: any[]) {
  let pull_requests: Record<string, any> = {};

  for (const pr of data) {
    if (!pr.id) continue;
    pull_requests[pr.id] = {
      url: pr.html_url,
      user: pr.user?.login || "Unknown",
      title: pr.title,
      message: pr.body,
      state: pr.state,
      created_at: pr.created_at ? new Date(pr.created_at) : null,
      updated_at: pr.updated_at ? new Date(pr.updated_at) : null,
      closed_at: pr.closed_at ? new Date(pr.closed_at) : null,
      merged_at: pr.merged_at ? new Date(pr.merged_at) : null,
      reviewers: pr.requested_reviewers || [],
      labels:
        pr.labels?.map((label: any) => ({
          name: label.name,
          color: label.color,
          description: label.description,
        })) || [],
      milestone: pr.milestone || null,
    };
  }

  return pull_requests;
}

export function extractPRdata(pull_requests: Record<string, any>) {
  let totalPRs = 0;
  let reviewedPRs = 0;
  let timeOpenToClose: Record<string, number> = {};
  let reviewersCount: Record<string, number> = {};

  for (const prId in pull_requests) {
    totalPRs++;
    const pr = pull_requests[prId];

    // Determine if the PR was reviewed
    // Here we assume that a PR is "reviewed" if it has at least one reviewer
    if (
      pr.reviewers &&
      Array.isArray(pr.reviewers) &&
      pr.reviewers.length > 0
    ) {
      reviewedPRs++;

      // Count each reviewer
      pr.reviewers.forEach((reviewer: any) => {
        const reviewerName = reviewer.login || "Unknown";
        reviewersCount[reviewerName] = (reviewersCount[reviewerName] || 0) + 1;
      });
    }

    // Calculate the time between opening and closing the PR (in minutes)
    if (pr.created_at && pr.closed_at) {
      const timeDiffMs = pr.closed_at.getTime() - pr.created_at.getTime();
      const timeDiffMinutes = timeDiffMs / (1000 * 60);
      timeOpenToClose[prId] = Math.round(timeDiffMinutes);
    }
  }

  // Calculate the average review time
  const averageReviewTime =
    timeOpenToClose.length > 0
      ? timeOpenToClose.reduce((acc, cur) => acc + cur, 0) / timeOpenToClose.length
      : 0;

  return {
    totalPRs,
    reviewedPRs,
    reviewersCount,
    averageReviewTime,
    timeOpenToClose, // Optionally, return all individual review times if needed
  };
}

export function parseRawPullRequestComments(data: any[]) {
  let comments: Record<string, any> = {};

  for (const comment of data) {
    if (!comment.id) continue;
    comments[comment.id] = {
      url: comment.html_url,
      pull_request_review_id: comment.pull_request_review_id,
      user: comment.user?.login || "Unknown",
      comment: comment.body,
      subject_type: comment.subject_type,
      subject_id: comment.subject_id,
    }

  }
  return comments;
}

export function extractPRCommentsData(comments: Record<string, any>) {
  let leaderboard: Record<string, number> = {};
  for (const commentId in comments) {
    const obj = comments[commentId];
    const user = obj.user;
    leaderboard[user] = (leaderboard[user] || 0) + 1;
  }
  return leaderboard;
}
