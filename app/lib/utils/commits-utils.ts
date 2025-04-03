import { CommitStats } from "@/app/lib/definitions";

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

  return { processedData, months, uniqueDays, maxChanges };
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
