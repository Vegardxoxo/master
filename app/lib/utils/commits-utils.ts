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



export function parseCommitStatsGraphQL(stats: any[]) {
  if (!stats || stats.length === 0) {
    return {
      statMap: {},
      projectAverageChanges: 0,
      projectAverageFilesChanged: 0,
    }
  }

  // Create a map of email to stats
  const statMap: Record<string, any> = {}

  // Calculate project totals
  let totalChanges = 0
  let totalCommits = 0
  let totalFilesChanged = 0

  stats.forEach((stat) => {
    const email = stat.email

    statMap[email] = {
      ...stat,
      // Ensure these properties exist
      average_changes: stat.average_changes || 0,
      average_files_changed: stat.average_files_changed || 0,
      additions_deletions_ratio: stat.additions_deletions_ratio || 0,
    }

    totalChanges += stat.total || 0
    totalCommits += stat.commits || 0
    totalFilesChanged += stat.changed_files || 0
  })

  // Calculate project averages
  const projectAverageChanges = totalCommits > 0 ? totalChanges / totalCommits : 0
  const projectAverageFilesChanged = totalCommits > 0 ? totalFilesChanged / totalCommits : 0

  return {
    statMap,
    projectAverageChanges,
    projectAverageFilesChanged,
  }
}



interface ParseCommitDataResult {
  dayEntries: DayEntry[]
  total: number
  emailToDisplayName: Record<string, string>
  commitSummary: any[]
  commitByDate: any[]
  authorTotals: Record<string, number>
}

export function parseCommitData(commits: any[]) {
  if (!commits || commits.length === 0) {
    return {
      total: 0,
      dayEntries: [],
      emailToDisplayName: { "TOTAL@commits": "Total" },
      authorTotals: {},
    }
  }

  // Initialize data structures
  const dayMap = new Map<string, Record<string, number>>()
  const emailToDisplayName: Record<string, string> = { "TOTAL@commits": "Total" }
  const authorTotals: Record<string, number> = {}

  // Process each commit
  commits.forEach((commit) => {
    // Extract date from committedAt
    const date = new Date(commit.committedAt)
    const day = date.toISOString().split("T")[0]

    // Get or create day entry
    if (!dayMap.has(day)) {
      dayMap.set(day, { day, "TOTAL@commits": 0 })
    }
    const dayEntry = dayMap.get(day)!

    // Extract author email
    const authorEmail = commit.authorEmail

    // Update email to display name mapping
    if (!emailToDisplayName[authorEmail]) {
      emailToDisplayName[authorEmail] = commit.authorName || authorEmail
    }

    // Update day entry for this author
    if (!dayEntry[authorEmail]) {
      dayEntry[authorEmail] = 0
    }
    dayEntry[authorEmail]++
    dayEntry["TOTAL@commits"]++

    // Update author totals
    if (!authorTotals[authorEmail]) {
      authorTotals[authorEmail] = 0
    }
    authorTotals[authorEmail]++
  })

  // Convert day map to array and sort by day
  const dayEntries = Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day))

  return {
    total: commits.length,
    dayEntries,
    emailToDisplayName,
    authorTotals,
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





export function prepareCommitsData(commits: any[]) {
  if (!commits || commits.length === 0) {
    return {
      processedData: [],
      months: [],
      uniqueDays: [],
      maxChanges: 0,
      maxFileChanges: 0,
    };
  }

  // Process the commits data
  const processedData = commits.map((commit) => {
    const committedDate = new Date(commit.committedAt).getTime();
    const totalChanges = commit.additions + commit.deletions;

    return {
      ...commit,
      committedDate,
      totalChanges,
      size: Math.min(Math.log10(totalChanges) * 5, 50), // Size for scatter plot points
    };
  });

  // Get unique months for filtering
  const months = Array.from(
      new Set(
          processedData.map((commit) => {
            const date = new Date(commit.committedDate);
            return `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
          })
      )
  ).sort();

  // Get unique days for reference lines
  const uniqueDays = Array.from(
      new Set(
          processedData.map((commit) => {
            const date = new Date(commit.committedDate);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          })
      )
  ).sort();

  // Calculate max values for chart scaling
  const maxChanges = Math.max(
      ...processedData.map((commit) => commit.totalChanges)
  );
  const maxFileChanges = Math.max(
      ...processedData.map((commit) => commit.changedFiles)
  );

  return {
    processedData,
    months,
    uniqueDays,
    maxChanges,
    maxFileChanges,
  };
}



export function processCommitData(commits: any[]) {
  if (!commits || commits.length === 0) {
    return {
      statMap: {},
      chartData: [],
      projectAverageChanges: 0,
      projectAverageFilesChanged: 0,
    }
  }

  // Group commits by author email
  const authorCommits: Record<string, any[]> = {}

  commits.forEach((commit) => {
    const email = commit.authorEmail
    if (!authorCommits[email]) {
      authorCommits[email] = []
    }
    authorCommits[email].push(commit)
  })

  // Calculate stats for each author
  const statMap: Record<string, any> = {}
  let totalProjectChanges = 0
  let totalProjectCommits = 0
  let totalProjectFilesChanged = 0

  Object.entries(authorCommits).forEach(([email, authorCommitList]) => {
    // Get the most recent author name (in case it changed)
    const name = authorCommitList[0].authorName || email.split("@")[0]

    // Calculate totals
    let additions = 0
    let deletions = 0
    let changedFiles = 0
    let coAuthoredLines = 0
    let biggestCommit = 0
    let biggestCommitUrl = ""

    authorCommitList.forEach((commit) => {
      const commitAdditions = commit.additions || 0
      const commitDeletions = commit.deletions || 0
      const totalChanges = commitAdditions + commitDeletions
      const filesChanged = commit.changedFiles || 0

      additions += commitAdditions
      deletions += commitDeletions
      changedFiles += filesChanged

      // Update project totals
      totalProjectChanges += totalChanges
      totalProjectFilesChanged += filesChanged

      // Check for co-authored commits
      if (commit.message && commit.message.toLowerCase().includes("co-authored-by")) {
        coAuthoredLines += totalChanges
      }

      // Track biggest commit
      if (totalChanges > biggestCommit) {
        biggestCommit = totalChanges
        biggestCommitUrl = commit.url || ""
      }
    })

    const total = additions + deletions
    const commits = authorCommitList.length
    totalProjectCommits += commits

    const average_changes = commits > 0 ? total / commits : 0
    const average_files_changed = commits > 0 ? changedFiles / commits : 0
    const additions_deletions_ratio =
        deletions > 0 ? additions / deletions : additions > 0 ? Number.POSITIVE_INFINITY : 0

    // Store the stats in the map
    statMap[email] = {
      name,
      email,
      additions,
      deletions,
      total,
      commits,
      changed_files: changedFiles,
      average_changes,
      average_files_changed,
      additions_deletions_ratio,
      co_authored_lines: coAuthoredLines,
      biggest_commit: biggestCommit,
      biggest_commit_url: biggestCommitUrl,
    }
  })

  // Calculate project averages
  const projectAverageChanges = totalProjectCommits > 0 ? totalProjectChanges / totalProjectCommits : 0
  const projectAverageFilesChanged = totalProjectCommits > 0 ? totalProjectFilesChanged / totalProjectCommits : 0

  // Create chart data
  const chartData = Object.entries(statMap)
      .map(([email, stats]) => ({
        name: stats.name,
        email,
        additions: stats.additions,
        deletions: stats.deletions,
        total: stats.total,
        commits: stats.commits,
        average_changes: stats.average_changes,
        average_files_changed: stats.average_files_changed,
      }))
      .sort((a, b) => b.total - a.total)

  return {
    statMap,
    chartData,
    projectAverageChanges,
    projectAverageFilesChanged,
  }
}