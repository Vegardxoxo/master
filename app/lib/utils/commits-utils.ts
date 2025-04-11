import {CommitData, CommitStats} from "@/app/lib/definitions/definitions";

export interface PreparedCommit {
  oid: string;
  committedDate: number;
  additions: number;
  deletions: number;
  changedFiles: number;
  message: string;
  url: string;
  author: {
    user: {
      login: string;
    };
    email: string;
    name: string;
  };
  totalChanges: number;
  size: number;
}

export function prepareCommitsData(data: any[]): {
  processedData: PreparedCommit[];
  months: string[];
  uniqueDays: number[];
  maxChanges: number;
  maxFileChanges: number;
} {
  const processedData = data.map((commit) => {
    const totalChanges = commit.additions + commit.deletions;
    return {
      ...commit,
      committedDate: new Date(commit.committedDate).getTime(),
      totalChanges: totalChanges === 0 ? 1 : totalChanges,
      size: Math.log(totalChanges + 1) * 2,
    };
  });

  const uniqueMonths = new Set(
    data.map((commit) => {
      const date = new Date(commit.committedDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    }),
  );
  const months = Array.from(uniqueMonths).sort();

  const days = new Set(
    data.map((item) => new Date(item.committedDate).setHours(0, 0, 0, 0)),
  );

  const uniqueDays = Array.from(days);

  const maxChanges = Math.max(...data.map((item) => item.totalChanges));

  const maxFileChanges = Math.max(...data.map((item) => item.changedFiles));

  return { processedData, months, uniqueDays, maxChanges, maxFileChanges };
}

//////////////////////////////////////////////////////

export function parseCommitStatsGraphQL(data: any[]) {
  const statMap: Record<string, CommitStats> = {};

  data.forEach((commit) => {
    if (!commit) return;

    const authorEmail: string = commit.author?.email;
    const name: string = commit.author?.name;
    const totalChanges: number =
      (commit.additions || 0) + (commit.deletions || 0);
    const commitUrl: string = commit.url || "";
    const message = commit.message || "";
    const totalFileChanges = commit.changedFiles || 0;

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
        additions_deletions_ratio: 0,
        total_files_changed: 0,
        average_files_changed: 0,
      };
    }

    // Update stats for the main author
    statMap[authorEmail].total += totalChanges;
    statMap[authorEmail].additions += commit.additions || 0;
    statMap[authorEmail].deletions += commit.deletions || 0;
    statMap[authorEmail].commits += 1;
    statMap[authorEmail].total_files_changed += totalFileChanges;

    // Process co-authors (omitted here for brevity; same logic as existing code)

    // Update biggest commit if needed
    if (totalChanges > statMap[authorEmail].biggest_commit) {
      statMap[authorEmail].biggest_commit = totalChanges;
      statMap[authorEmail].biggest_commit_url = commitUrl;
    }
  });
  // END FOR-LOOP

  let overallTotalChanges = 0;
  let overallCommits = 0;
  let overallTotalFilesChanged = 0;

  // Compute overall totals
  for (const email of Object.keys(statMap)) {
    const stats = statMap[email];
    overallTotalChanges += stats.total;
    overallTotalFilesChanged += stats.total_files_changed;
    overallCommits += stats.commits;
  }

  // Calculate averages
  const projectAverageChanges =
    overallCommits > 0 ? overallTotalChanges / overallCommits : 0;
  const projectAverageFilesChanged =
    overallCommits > 0 ? overallTotalFilesChanged / overallCommits : 0;

  for (const email of Object.keys(statMap)) {
    const stats = statMap[email];

    if (stats.commits > 0) {
      stats.average_changes = stats.total / stats.commits;
      stats.average_files_changed = stats.total_files_changed / stats.commits;
    }

    // Additions to deletions ratio
    stats.additions_deletions_ratio =
      stats.deletions === 0
        ? stats.additions
        : stats.additions / stats.deletions;
  }

  return { statMap, projectAverageChanges, projectAverageFilesChanged };
}

// function parseCoAuthorLine(line: string): { name: string; email: string } {
//   const clean = line.replace("Co-authored-by:", "").trim();
//
//   // Match the pattern "Name <email>"
//   const match = clean.match(/^(.*?)\s*<([^>]+)>/);
//
//   if (!match) {
//     return { name: clean, email: "unknown@invalid.com" };
//   }
//
//   const name = match[1].trim();
//   const email = match[2].trim().toLowerCase();
//
//   return { name, email };
// }

interface ParseCommitDataResult {
  dayEntries: DayEntry[]
  total: number
  emailToDisplayName: Record<string, string>
  commitSummary: any[]
  commitByDate: any[]
  authorTotals: Record<string, number>
}

export function parseCommitData(commitData: any[]): ParseCommitDataResult {
  const dayMap: Record<string, AuthorFrequency> = {}
  const dayTotals: Record<string, number> = {}
  const emailToDisplayName: Record<string, string> = {}
  const commitSummary = []
  const commitByDate = []

  // Add authorTotals to track commits per author
  const authorTotals: Record<string, number> = {}

  // Process each commit
  for (const item of commitData) {
    const authorName = item.commit.author.name ?? "unknown"
    const authorEmail = item.commit.author.email ?? "unknown"
    const commitDate = item.commit.author.date
    const message = item.commit.message
    const url = item.commit.url
    const htmlUrl = item.html_url
    const sha = item.sha

    emailToDisplayName[authorEmail] = authorName
    commitSummary.push({ sha, url, commit_message: message })
    commitByDate.push({
      authorEmail,
      authorName,
      commitDate,
      message,
      htmlUrl,
    })

    const day = new Date(commitDate).toISOString().split("T")[0]
    if (!dayMap[day]) dayMap[day] = {}
    if (!dayTotals[day]) dayTotals[day] = 0
    // Increment commit count for this author on this day
    if (!dayMap[day][authorEmail]) {
      dayMap[day][authorEmail] = 0
    }
    dayMap[day][authorEmail]++
    dayTotals[day]++

    // Track total commits per author
    if (!authorTotals[authorEmail]) {
      authorTotals[authorEmail] = 0
    }
    authorTotals[authorEmail]++
  }

  // Add total commits for each day
  emailToDisplayName["TOTAL@commits"] = "Total"
  for (const day of Object.keys(dayMap)) {
    dayMap[day]["TOTAL@commits"] = dayTotals[day]
  }

  // Create the final data structure for the chart
  const dayEntries: DayEntry[] = Object.entries(dayMap)
    .map(([day, authorsMap]) => ({
      day,
      ...authorsMap,
    }))
    .sort((a, b) => a.day.localeCompare(b.day))

  let total = 0
  for (const day of dayEntries) {
    total += day["TOTAL@commits"] as number
  }

  return {
    dayEntries,
    total,
    emailToDisplayName,
    commitSummary,
    commitByDate,
    authorTotals
  }
}






// Type definitions
interface AuthorFrequency {
  [email: string]: number
}

interface DayEntry {
  day: string
  [email: string]: string | number
}



export function convertToCommitStats(commitData: CommitData[]): CommitStats[] {
  return commitData.map((data) => {
    const original = data._original || {}

    return {
      committedDate: data.commit.author.date || new Date().toISOString(),
      author: {
        email: data.commit.author.email,
        name: data.commit.author.name,
      },
      message: original.message || "",
      additions: original.additions || 0,
      deletions: original.deletions || 0,
      changedFiles: original.changedFiles || 0,
      url: data.commit.url || data.html_url || "",
    }
  })
}