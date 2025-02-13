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

const comments = [
  {
    "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/527",
    "pull_request_review_id": 1233,
    "id": 527,
    "node_id": "MDI0OlB1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudDUyNw==",
    "diff_hunk": "",
    "path": "frontend/src/index.css",
    "commit_id": "2b4938d94020e8cb6466f4b3a1bc5f4755556039",
    "original_commit_id": "2b4938d94020e8cb6466f4b3a1bc5f4755556039",
    "user": {
      "login": "noraytt",
      "id": 578,
      "node_id": "MDQ6VXNlcjU3OA==",
      "avatar_url": "https://avatars.git.ntnu.no/u/578?",
      "gravatar_id": "",
      "url": "https://git.ntnu.no/api/v3/users/noraytt",
      "html_url": "https://git.ntnu.no/noraytt",
      "followers_url": "https://git.ntnu.no/api/v3/users/noraytt/followers",
      "following_url": "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      "gists_url": "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      "starred_url": "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      "subscriptions_url": "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      "organizations_url": "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      "repos_url": "https://git.ntnu.no/api/v3/users/noraytt/repos",
      "events_url": "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      "received_events_url": "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Nice!",
    "created_at": "2024-10-05T11:07:47Z",
    "updated_at": "2024-10-05T11:07:47Z",
    "html_url": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/29#discussion_r527",
    "pull_request_url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/29",
    "author_association": "MEMBER",
    "_links": {
      "self": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/527"
      },
      "html": {
        "href": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/29#discussion_r527"
      },
      "pull_request": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/29"
      }
    },
    "reactions": {
      "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/527/reactions",
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "hooray": 0,
      "confused": 0,
      "heart": 0,
      "rocket": 0,
      "eyes": 0
    },
    "start_line": null,
    "original_start_line": null,
    "start_side": null,
    "line": 1,
    "original_line": 1,
    "side": "RIGHT",
    "original_position": 1,
    "position": 1,
    "subject_type": "file"
  },
  {
    "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/529",
    "pull_request_review_id": 1235,
    "id": 529,
    "node_id": "MDI0OlB1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudDUyOQ==",
    "diff_hunk": "",
    "path": "frontend/src/layout/NavBar.tsx",
    "commit_id": "2b4938d94020e8cb6466f4b3a1bc5f4755556039",
    "original_commit_id": "2b4938d94020e8cb6466f4b3a1bc5f4755556039",
    "user": {
      "login": "noraytt",
      "id": 578,
      "node_id": "MDQ6VXNlcjU3OA==",
      "avatar_url": "https://avatars.git.ntnu.no/u/578?",
      "gravatar_id": "",
      "url": "https://git.ntnu.no/api/v3/users/noraytt",
      "html_url": "https://git.ntnu.no/noraytt",
      "followers_url": "https://git.ntnu.no/api/v3/users/noraytt/followers",
      "following_url": "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      "gists_url": "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      "starred_url": "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      "subscriptions_url": "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      "organizations_url": "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      "repos_url": "https://git.ntnu.no/api/v3/users/noraytt/repos",
      "events_url": "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      "received_events_url": "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Looks good, ease to understand!",
    "created_at": "2024-10-05T11:09:43Z",
    "updated_at": "2024-10-05T11:09:43Z",
    "html_url": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/29#discussion_r529",
    "pull_request_url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/29",
    "author_association": "MEMBER",
    "_links": {
      "self": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/529"
      },
      "html": {
        "href": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/29#discussion_r529"
      },
      "pull_request": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/29"
      }
    },
    "reactions": {
      "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/529/reactions",
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "hooray": 0,
      "confused": 0,
      "heart": 0,
      "rocket": 0,
      "eyes": 0
    },
    "start_line": null,
    "original_start_line": null,
    "start_side": null,
    "line": 1,
    "original_line": 1,
    "side": "RIGHT",
    "original_position": 1,
    "position": 1,
    "subject_type": "file"
  },
  {
    "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/584",
    "pull_request_review_id": 1307,
    "id": 584,
    "node_id": "MDI0OlB1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudDU4NA==",
    "diff_hunk": "",
    "path": "frontend/src/App.css",
    "commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "original_commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "user": {
      "login": "noraytt",
      "id": 578,
      "node_id": "MDQ6VXNlcjU3OA==",
      "avatar_url": "https://avatars.git.ntnu.no/u/578?",
      "gravatar_id": "",
      "url": "https://git.ntnu.no/api/v3/users/noraytt",
      "html_url": "https://git.ntnu.no/noraytt",
      "followers_url": "https://git.ntnu.no/api/v3/users/noraytt/followers",
      "following_url": "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      "gists_url": "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      "starred_url": "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      "subscriptions_url": "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      "organizations_url": "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      "repos_url": "https://git.ntnu.no/api/v3/users/noraytt/repos",
      "events_url": "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      "received_events_url": "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Very nice! Agree that it made things more complicated3",
    "created_at": "2024-10-07T06:53:40Z",
    "updated_at": "2024-10-07T06:53:41Z",
    "html_url": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r584",
    "pull_request_url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37",
    "author_association": "MEMBER",
    "_links": {
      "self": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/584"
      },
      "html": {
        "href": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r584"
      },
      "pull_request": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37"
      }
    },
    "reactions": {
      "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/584/reactions",
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "hooray": 0,
      "confused": 0,
      "heart": 0,
      "rocket": 0,
      "eyes": 0
    },
    "start_line": null,
    "original_start_line": null,
    "start_side": null,
    "line": 1,
    "original_line": 1,
    "side": "RIGHT",
    "original_position": 1,
    "position": 1,
    "subject_type": "file"
  },
  {
    "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/585",
    "pull_request_review_id": 1309,
    "id": 585,
    "node_id": "MDI0OlB1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudDU4NQ==",
    "diff_hunk": "",
    "path": "frontend/src/layout/Layout.tsx",
    "commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "original_commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "user": {
      "login": "noraytt",
      "id": 578,
      "node_id": "MDQ6VXNlcjU3OA==",
      "avatar_url": "https://avatars.git.ntnu.no/u/578?",
      "gravatar_id": "",
      "url": "https://git.ntnu.no/api/v3/users/noraytt",
      "html_url": "https://git.ntnu.no/noraytt",
      "followers_url": "https://git.ntnu.no/api/v3/users/noraytt/followers",
      "following_url": "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      "gists_url": "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      "starred_url": "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      "subscriptions_url": "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      "organizations_url": "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      "repos_url": "https://git.ntnu.no/api/v3/users/noraytt/repos",
      "events_url": "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      "received_events_url": "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Looks nice! I think maybe the cocktail page is cleaner if we have a sort of ${cocktail.id} and have a page for each cocktail, but we can look into that later!",
    "created_at": "2024-10-07T06:56:48Z",
    "updated_at": "2024-10-07T06:56:48Z",
    "html_url": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r585",
    "pull_request_url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37",
    "author_association": "MEMBER",
    "_links": {
      "self": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/585"
      },
      "html": {
        "href": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r585"
      },
      "pull_request": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37"
      }
    },
    "reactions": {
      "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/585/reactions",
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "hooray": 0,
      "confused": 0,
      "heart": 0,
      "rocket": 0,
      "eyes": 0
    },
    "start_line": null,
    "original_start_line": null,
    "start_side": null,
    "line": 1,
    "original_line": 1,
    "side": "RIGHT",
    "original_position": 1,
    "position": 1,
    "subject_type": "file"
  },
  {
    "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/586",
    "pull_request_review_id": 1311,
    "id": 586,
    "node_id": "MDI0OlB1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudDU4Ng==",
    "diff_hunk": "",
    "path": "frontend/src/layout/Layout.tsx",
    "commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "original_commit_id": "7dd349548999e4583bc1a450b986b844ae7fdb9f",
    "user": {
      "login": "camilsje",
      "id": 573,
      "node_id": "MDQ6VXNlcjU3Mw==",
      "avatar_url": "https://avatars.git.ntnu.no/u/573?",
      "gravatar_id": "",
      "url": "https://git.ntnu.no/api/v3/users/camilsje",
      "html_url": "https://git.ntnu.no/camilsje",
      "followers_url": "https://git.ntnu.no/api/v3/users/camilsje/followers",
      "following_url": "https://git.ntnu.no/api/v3/users/camilsje/following{/other_user}",
      "gists_url": "https://git.ntnu.no/api/v3/users/camilsje/gists{/gist_id}",
      "starred_url": "https://git.ntnu.no/api/v3/users/camilsje/starred{/owner}{/repo}",
      "subscriptions_url": "https://git.ntnu.no/api/v3/users/camilsje/subscriptions",
      "organizations_url": "https://git.ntnu.no/api/v3/users/camilsje/orgs",
      "repos_url": "https://git.ntnu.no/api/v3/users/camilsje/repos",
      "events_url": "https://git.ntnu.no/api/v3/users/camilsje/events{/privacy}",
      "received_events_url": "https://git.ntnu.no/api/v3/users/camilsje/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Nice catch! I agree with you",
    "created_at": "2024-10-07T07:01:54Z",
    "updated_at": "2024-10-07T07:01:55Z",
    "html_url": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r586",
    "pull_request_url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37",
    "author_association": "MEMBER",
    "_links": {
      "self": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/586"
      },
      "html": {
        "href": "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/37#discussion_r586"
      },
      "pull_request": {
        "href": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/37"
      }
    },
    "reactions": {
      "url": "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments/586/reactions",
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "hooray": 0,
      "confused": 0,
      "heart": 0,
      "rocket": 0,
      "eyes": 0
    },
    "start_line": null,
    "original_start_line": null,
    "start_side": null,
    "line": 1,
    "original_line": 1,
    "side": "RIGHT",
    "in_reply_to_id": 585,
    "original_position": 1,
    "position": 1,
    "subject_type": "file"
  }
]
const PR = {
  url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210",
  id: 4395,
  node_id: "MDExOlB1bGxSZXF1ZXN0NDM5NQ==",
  html_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/210",
  diff_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/210.diff",
  patch_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/210.patch",
  issue_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/210",
  number: 210,
  state: "closed",
  locked: false,
  title: "209 get project ready for final build",
  user: {
    login: "noraytt",
    id: 578,
    node_id: "MDQ6VXNlcjU3OA==",
    avatar_url: "https://avatars.git.ntnu.no/u/578?",
    gravatar_id: "",
    url: "https://git.ntnu.no/api/v3/users/noraytt",
    html_url: "https://git.ntnu.no/noraytt",
    followers_url: "https://git.ntnu.no/api/v3/users/noraytt/followers",
    following_url:
      "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
    gists_url: "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
    starred_url:
      "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
    subscriptions_url: "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
    organizations_url: "https://git.ntnu.no/api/v3/users/noraytt/orgs",
    repos_url: "https://git.ntnu.no/api/v3/users/noraytt/repos",
    events_url: "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
    received_events_url:
      "https://git.ntnu.no/api/v3/users/noraytt/received_events",
    type: "User",
    site_admin: false,
  },
  body: "Closes #209 \r\n\r\nBuilt project, fixed smaller bugs and updated README\r\n",
  created_at: "2024-12-06T10:10:37Z",
  updated_at: "2024-12-06T10:14:22Z",
  closed_at: "2024-12-06T10:14:17Z",
  merged_at: "2024-12-06T10:14:17Z",
  merge_commit_sha: "fbf9e9041f60b9eb3d1d3c9afdf0f1e9bf92c96d",
  assignee: {
    login: "noraytt",
    id: 578,
    node_id: "MDQ6VXNlcjU3OA==",
    avatar_url: "https://avatars.git.ntnu.no/u/578?",
    gravatar_id: "",
    url: "https://git.ntnu.no/api/v3/users/noraytt",
    html_url: "https://git.ntnu.no/noraytt",
    followers_url: "https://git.ntnu.no/api/v3/users/noraytt/followers",
    following_url:
      "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
    gists_url: "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
    starred_url:
      "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
    subscriptions_url: "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
    organizations_url: "https://git.ntnu.no/api/v3/users/noraytt/orgs",
    repos_url: "https://git.ntnu.no/api/v3/users/noraytt/repos",
    events_url: "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
    received_events_url:
      "https://git.ntnu.no/api/v3/users/noraytt/received_events",
    type: "User",
    site_admin: false,
  },
  assignees: [
    {
      login: "noraytt",
      id: 578,
      node_id: "MDQ6VXNlcjU3OA==",
      avatar_url: "https://avatars.git.ntnu.no/u/578?",
      gravatar_id: "",
      url: "https://git.ntnu.no/api/v3/users/noraytt",
      html_url: "https://git.ntnu.no/noraytt",
      followers_url: "https://git.ntnu.no/api/v3/users/noraytt/followers",
      following_url:
        "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      gists_url: "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      starred_url:
        "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      subscriptions_url:
        "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      organizations_url: "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      repos_url: "https://git.ntnu.no/api/v3/users/noraytt/repos",
      events_url: "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      received_events_url:
        "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      type: "User",
      site_admin: false,
    },
  ],
  requested_reviewers: [],
  requested_teams: [],
  labels: [
    {
      id: 1637,
      node_id: "MDU6TGFiZWwxNjM3",
      url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/labels/documentation",
      name: "documentation",
      color: "0075ca",
      default: true,
      description: "Improvements or additions to documentation",
    },
    {
      id: 3415,
      node_id: "MDU6TGFiZWwzNDE1",
      url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/labels/devops",
      name: "devops",
      color: "8444BB",
      default: false,
      description: "Infrastructure, deployment-related",
    },
  ],
  milestone: {
    url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/milestones/4",
    html_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2/milestone/4",
    labels_url:
      "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/milestones/4/labels",
    id: 160,
    node_id: "MDk6TWlsZXN0b25lMTYw",
    number: 4,
    title: "Sprint 4",
    description:
      "This sprint is used to review and further improve our project based on the last peer reviews. Some additional functionality and refactoring that were not finished in time for sprint 3 is also being addressed here. \r\nAfter this sprint, the project will be delivered for final submission. ",
    creator: {
      login: "noraytt",
      id: 578,
      node_id: "MDQ6VXNlcjU3OA==",
      avatar_url: "https://avatars.git.ntnu.no/u/578?",
      gravatar_id: "",
      url: "https://git.ntnu.no/api/v3/users/noraytt",
      html_url: "https://git.ntnu.no/noraytt",
      followers_url: "https://git.ntnu.no/api/v3/users/noraytt/followers",
      following_url:
        "https://git.ntnu.no/api/v3/users/noraytt/following{/other_user}",
      gists_url: "https://git.ntnu.no/api/v3/users/noraytt/gists{/gist_id}",
      starred_url:
        "https://git.ntnu.no/api/v3/users/noraytt/starred{/owner}{/repo}",
      subscriptions_url:
        "https://git.ntnu.no/api/v3/users/noraytt/subscriptions",
      organizations_url: "https://git.ntnu.no/api/v3/users/noraytt/orgs",
      repos_url: "https://git.ntnu.no/api/v3/users/noraytt/repos",
      events_url: "https://git.ntnu.no/api/v3/users/noraytt/events{/privacy}",
      received_events_url:
        "https://git.ntnu.no/api/v3/users/noraytt/received_events",
      type: "User",
      site_admin: false,
    },
    open_issues: 0,
    closed_issues: 21,
    state: "closed",
    created_at: "2024-11-22T13:32:20Z",
    updated_at: "2024-12-06T10:15:04Z",
    due_on: "2024-12-06T00:00:00Z",
    closed_at: "2024-12-06T10:15:04Z",
  },
  draft: false,
  commits_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210/commits",
  review_comments_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210/comments",
  review_comment_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments{/number}",
  comments_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/210/comments",
  statuses_url:
    "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/statuses/c6dc32d3b736e5d454129674198f213118d11b5c",
  head: {
    label: "IT2810-H24:209-get-project-ready-for-final-build",
    ref: "209-get-project-ready-for-final-build",
    sha: "c6dc32d3b736e5d454129674198f213118d11b5c",
    user: {
      login: "IT2810-H24",
      id: 319,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjMxOQ==",
      avatar_url: "https://avatars.git.ntnu.no/u/319?",
      gravatar_id: "",
      url: "https://git.ntnu.no/api/v3/users/IT2810-H24",
      html_url: "https://git.ntnu.no/IT2810-H24",
      followers_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/followers",
      following_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/following{/other_user}",
      gists_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/gists{/gist_id}",
      starred_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/starred{/owner}{/repo}",
      subscriptions_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/subscriptions",
      organizations_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/orgs",
      repos_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/repos",
      events_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/events{/privacy}",
      received_events_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/received_events",
      type: "Organization",
      site_admin: false,
    },
    repo: {
      id: 173,
      node_id: "MDEwOlJlcG9zaXRvcnkxNzM=",
      name: "T02-Project-2",
      full_name: "IT2810-H24/T02-Project-2",
      private: false,
      owner: {
        login: "IT2810-H24",
        id: 319,
        node_id: "MDEyOk9yZ2FuaXphdGlvbjMxOQ==",
        avatar_url: "https://avatars.git.ntnu.no/u/319?",
        gravatar_id: "",
        url: "https://git.ntnu.no/api/v3/users/IT2810-H24",
        html_url: "https://git.ntnu.no/IT2810-H24",
        followers_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/followers",
        following_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/following{/other_user}",
        gists_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/gists{/gist_id}",
        starred_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/starred{/owner}{/repo}",
        subscriptions_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/subscriptions",
        organizations_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/orgs",
        repos_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/repos",
        events_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/events{/privacy}",
        received_events_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/received_events",
        type: "Organization",
        site_admin: false,
      },
      html_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2",
      description: null,
      fork: false,
      url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2",
      forks_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/forks",
      keys_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/keys{/key_id}",
      collaborators_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/collaborators{/collaborator}",
      teams_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/teams",
      hooks_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/hooks",
      issue_events_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/events{/number}",
      events_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/events",
      assignees_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/assignees{/user}",
      branches_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/branches{/branch}",
      tags_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/tags",
      blobs_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/blobs{/sha}",
      git_tags_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/tags{/sha}",
      git_refs_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/refs{/sha}",
      trees_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/trees{/sha}",
      statuses_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/statuses/{sha}",
      languages_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/languages",
      stargazers_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/stargazers",
      contributors_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/contributors",
      subscribers_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/subscribers",
      subscription_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/subscription",
      commits_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/commits{/sha}",
      git_commits_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/commits{/sha}",
      comments_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/comments{/number}",
      issue_comment_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/comments{/number}",
      contents_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/contents/{+path}",
      compare_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/compare/{base}...{head}",
      merges_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/merges",
      archive_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/{archive_format}{/ref}",
      downloads_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/downloads",
      issues_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues{/number}",
      pulls_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls{/number}",
      milestones_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/milestones{/number}",
      notifications_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/notifications{?since,all,participating}",
      labels_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/labels{/name}",
      releases_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/releases{/id}",
      deployments_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/deployments",
      created_at: "2024-09-05T09:58:52Z",
      updated_at: "2024-12-13T15:37:17Z",
      pushed_at: "2024-12-06T10:14:22Z",
      git_url: "git://git.ntnu.no/IT2810-H24/T02-Project-2.git",
      ssh_url: "git@git.ntnu.no:IT2810-H24/T02-Project-2.git",
      clone_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2.git",
      svn_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2",
      homepage: null,
      size: 68881,
      stargazers_count: 0,
      watchers_count: 0,
      language: "TypeScript",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 0,
      license: null,
      allow_forking: true,
      is_template: false,
      web_commit_signoff_required: false,
      topics: [],
      visibility: "public",
      forks: 0,
      open_issues: 0,
      watchers: 0,
      default_branch: "main",
    },
  },
  base: {
    label: "IT2810-H24:main",
    ref: "main",
    sha: "8d62285cf996993bb2400e0a084da30be02e5c92",
    user: {
      login: "IT2810-H24",
      id: 319,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjMxOQ==",
      avatar_url: "https://avatars.git.ntnu.no/u/319?",
      gravatar_id: "",
      url: "https://git.ntnu.no/api/v3/users/IT2810-H24",
      html_url: "https://git.ntnu.no/IT2810-H24",
      followers_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/followers",
      following_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/following{/other_user}",
      gists_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/gists{/gist_id}",
      starred_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/starred{/owner}{/repo}",
      subscriptions_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/subscriptions",
      organizations_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/orgs",
      repos_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/repos",
      events_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/events{/privacy}",
      received_events_url:
        "https://git.ntnu.no/api/v3/users/IT2810-H24/received_events",
      type: "Organization",
      site_admin: false,
    },
    repo: {
      id: 173,
      node_id: "MDEwOlJlcG9zaXRvcnkxNzM=",
      name: "T02-Project-2",
      full_name: "IT2810-H24/T02-Project-2",
      private: false,
      owner: {
        login: "IT2810-H24",
        id: 319,
        node_id: "MDEyOk9yZ2FuaXphdGlvbjMxOQ==",
        avatar_url: "https://avatars.git.ntnu.no/u/319?",
        gravatar_id: "",
        url: "https://git.ntnu.no/api/v3/users/IT2810-H24",
        html_url: "https://git.ntnu.no/IT2810-H24",
        followers_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/followers",
        following_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/following{/other_user}",
        gists_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/gists{/gist_id}",
        starred_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/starred{/owner}{/repo}",
        subscriptions_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/subscriptions",
        organizations_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/orgs",
        repos_url: "https://git.ntnu.no/api/v3/users/IT2810-H24/repos",
        events_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/events{/privacy}",
        received_events_url:
          "https://git.ntnu.no/api/v3/users/IT2810-H24/received_events",
        type: "Organization",
        site_admin: false,
      },
      html_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2",
      description: null,
      fork: false,
      url: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2",
      forks_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/forks",
      keys_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/keys{/key_id}",
      collaborators_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/collaborators{/collaborator}",
      teams_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/teams",
      hooks_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/hooks",
      issue_events_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/events{/number}",
      events_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/events",
      assignees_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/assignees{/user}",
      branches_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/branches{/branch}",
      tags_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/tags",
      blobs_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/blobs{/sha}",
      git_tags_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/tags{/sha}",
      git_refs_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/refs{/sha}",
      trees_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/trees{/sha}",
      statuses_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/statuses/{sha}",
      languages_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/languages",
      stargazers_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/stargazers",
      contributors_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/contributors",
      subscribers_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/subscribers",
      subscription_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/subscription",
      commits_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/commits{/sha}",
      git_commits_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/git/commits{/sha}",
      comments_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/comments{/number}",
      issue_comment_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/comments{/number}",
      contents_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/contents/{+path}",
      compare_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/compare/{base}...{head}",
      merges_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/merges",
      archive_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/{archive_format}{/ref}",
      downloads_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/downloads",
      issues_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues{/number}",
      pulls_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls{/number}",
      milestones_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/milestones{/number}",
      notifications_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/notifications{?since,all,participating}",
      labels_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/labels{/name}",
      releases_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/releases{/id}",
      deployments_url:
        "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/deployments",
      created_at: "2024-09-05T09:58:52Z",
      updated_at: "2024-12-13T15:37:17Z",
      pushed_at: "2024-12-06T10:14:22Z",
      git_url: "git://git.ntnu.no/IT2810-H24/T02-Project-2.git",
      ssh_url: "git@git.ntnu.no:IT2810-H24/T02-Project-2.git",
      clone_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2.git",
      svn_url: "https://git.ntnu.no/IT2810-H24/T02-Project-2",
      homepage: null,
      size: 68881,
      stargazers_count: 0,
      watchers_count: 0,
      language: "TypeScript",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 0,
      license: null,
      allow_forking: true,
      is_template: false,
      web_commit_signoff_required: false,
      topics: [],
      visibility: "public",
      forks: 0,
      open_issues: 0,
      watchers: 0,
      default_branch: "main",
    },
  },
  _links: {
    self: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210",
    },
    html: {
      href: "https://git.ntnu.no/IT2810-H24/T02-Project-2/pull/210",
    },
    issue: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/210",
    },
    comments: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/issues/210/comments",
    },
    review_comments: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210/comments",
    },
    review_comment: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/comments{/number}",
    },
    commits: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/pulls/210/commits",
    },
    statuses: {
      href: "https://git.ntnu.no/api/v3/repos/IT2810-H24/T02-Project-2/statuses/c6dc32d3b736e5d454129674198f213118d11b5c",
    },
  },
  author_association: "MEMBER",
  auto_merge: null,
  active_lock_reason: null,
};
