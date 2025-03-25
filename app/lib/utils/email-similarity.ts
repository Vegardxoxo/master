import { CommitStats } from "@/app/lib/definitions";

function parseCoAuthorLine(line: string): { name: string; email: string } {
  const clean = line.replace("Co-authored-by:", "").trim();
  const match = clean.match(/^(.*?)\s*<([^>]+)>/);

  if (!match) {
    return { name: clean, email: "unknown@invalid.com" };
  }

  const name = match[1].trim();
  const email = match[2].trim().toLowerCase();
  return { name, email };
}

export function parseCommitStatsGraphQLEnhanched(data: any[]) {
  const statMap: Record<string, CommitStats> = {};

  data.forEach((commit) => {
    if (!commit) return;

    const authorEmail: string = commit.author?.email;
    const name: string = commit.author?.name;
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
      const { email, name } = parseCoAuthorLine(line);

      // Skip if the email is the default unknown one
      if (email === "unknown@invalid.com") {
        console.warn("Skipping unrecognized co-author format:", line);
        continue;
      }

      // Create an entry if co-author doesn't exist yet
      if (!statMap[email]) {
        statMap[email] = {
          total: 0,
          additions: 0,
          deletions: 0,
          commits: 0,
          name: name || "Unknown Co-Author", // Use the parsed name if available
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

  // Consolidate contributors with similar emails/names
  const consolidatedMap = consolidateContributors(statMap);

  // Calculate totals for the entire project using the consolidated map
  let overallTotal = 0;
  let overallCommits = 0;

  for (const email of Object.keys(consolidatedMap)) {
    const stats = consolidatedMap[email];
    overallTotal += stats.total;
    overallCommits += stats.commits;
  }

  const projectAverage = overallCommits > 0 ? overallTotal / overallCommits : 0;

  // Calculate additional metrics for each contributor
  for (const email of Object.keys(consolidatedMap)) {
    const stats = consolidatedMap[email];

    if (stats.commits > 0) {
      stats.average_changes = stats.total / stats.commits;
    }

    stats.group_average = projectAverage;

    if (stats.deletions > 0) {
      stats.additions_deletions_ratio = stats.additions / stats.deletions;
    } else {
      stats.additions_deletions_ratio = stats.additions > 0 ? Infinity : 0;
    }
  }

  return consolidatedMap;
}

// Add this function to handle contributor consolidation
function consolidateContributors(
  statMap: Record<string, CommitStats>,
): Record<string, CommitStats> {
  // Create a mapping of normalized emails to original emails
  const emailMap: Record<string, string[]> = {};

  // First pass: group by domain and username
  Object.keys(statMap).forEach((email) => {
    if (!email || email.indexOf("@") === -1) return;

    // Normalize email by removing dots from Gmail addresses and handling +aliases
    let normalizedEmail = email.toLowerCase();
    const [username, domain] = normalizedEmail.split("@");

    // Special handling for Gmail (dots don't matter in username)
    if (domain === "gmail.com") {
      const cleanUsername = username.replace(/\./g, "").split("+")[0];
      normalizedEmail = `${cleanUsername}@${domain}`;
    }
    // Handle +aliases for all email providers
    else {
      const cleanUsername = username.split("+")[0];
      normalizedEmail = `${cleanUsername}@${domain}`;
    }

    if (!emailMap[normalizedEmail]) {
      emailMap[normalizedEmail] = [];
    }

    emailMap[normalizedEmail].push(email);
  });

  // Second pass: check for similar names where emails weren't matched
  const nameMap: Record<string, string[]> = {};

  Object.entries(statMap).forEach(([email, stats]) => {
    if (!stats.name) return;

    // Normalize name (lowercase, remove non-alphanumeric)
    const normalizedName = stats.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (normalizedName.length < 3) return; // Skip very short names

    if (!nameMap[normalizedName]) {
      nameMap[normalizedName] = [];
    }

    nameMap[normalizedName].push(email);
  });

  // Create merged contributors
  const mergedStats: Record<string, CommitStats> = {};
  const processed = new Set<string>();

  // Process email-matched groups
  Object.values(emailMap).forEach((emailGroup) => {
    if (emailGroup.length <= 1) {
      return; // No need to merge single email
    }

    // Find primary email (prefer personal over noreply and with more commits)
    const primaryEmail = emailGroup.sort((a, b) => {
      // Sort by type (prefer non-noreply emails)
      const aNoreply = a.includes("noreply") ? 1 : 0;
      const bNoreply = b.includes("noreply") ? 1 : 0;

      if (aNoreply !== bNoreply) {
        return aNoreply - bNoreply;
      }

      // Then sort by number of commits
      return (statMap[b].commits || 0) - (statMap[a].commits || 0);
    })[0];

    // Merge stats from all emails
    const merged: CommitStats = {
      total: 0,
      additions: 0,
      deletions: 0,
      commits: 0,
      name: "",
      biggest_commit: 0,
      biggest_commit_url: "",
      co_authored_lines: 0,
      average_changes: 0,
      group_average: 0,
      additions_deletions_ratio: 0,
    };

    // Find best name (prefer longer names)
    let bestName = "";
    let bestNameLength = 0;

    emailGroup.forEach((email) => {
      const stats = statMap[email];

      merged.total += stats.total;
      merged.additions += stats.additions;
      merged.deletions += stats.deletions;
      merged.commits += stats.commits;
      merged.co_authored_lines += stats.co_authored_lines;

      // Keep track of biggest commit
      if (stats.biggest_commit > merged.biggest_commit) {
        merged.biggest_commit = stats.biggest_commit;
        merged.biggest_commit_url = stats.biggest_commit_url;
      }

      // Find best name
      const fullName = stats.name || "";
      if (fullName.length > bestNameLength) {
        bestName = fullName;
        bestNameLength = fullName.length;
      }

      processed.add(email);
    });

    merged.name = bestName;
    mergedStats[primaryEmail] = merged;
  });

  // Process name-matched groups (only for emails not already processed)
  Object.values(nameMap).forEach((emailGroup) => {
    const unprocessedEmails = emailGroup.filter(
      (email) => !processed.has(email),
    );

    if (unprocessedEmails.length <= 1) {
      return; // No need to merge single email
    }

    // Find primary email
    const primaryEmail = unprocessedEmails.sort((a, b) => {
      // Sort by type (prefer non-noreply emails)
      const aNoreply = a.includes("noreply") ? 1 : 0;
      const bNoreply = b.includes("noreply") ? 1 : 0;

      if (aNoreply !== bNoreply) {
        return aNoreply - bNoreply;
      }

      // Then sort by number of commits
      return (statMap[b].commits || 0) - (statMap[a].commits || 0);
    })[0];

    // Merge stats from all emails
    const merged: CommitStats = {
      total: 0,
      additions: 0,
      deletions: 0,
      commits: 0,
      name: "",
      biggest_commit: 0,
      biggest_commit_url: "",
      co_authored_lines: 0,
      average_changes: 0,
      group_average: 0,
      additions_deletions_ratio: 0,
    };

    let bestName = "";
    let bestNameLength = 0;

    unprocessedEmails.forEach((email) => {
      const stats = statMap[email];

      merged.total += stats.total;
      merged.additions += stats.additions;
      merged.deletions += stats.deletions;
      merged.commits += stats.commits;
      merged.co_authored_lines += stats.co_authored_lines;

      // Keep track of biggest commit
      if (stats.biggest_commit > merged.biggest_commit) {
        merged.biggest_commit = stats.biggest_commit;
        merged.biggest_commit_url = stats.biggest_commit_url;
      }

      // Find best name
      const fullName = stats.name || "";
      if (fullName.length > bestNameLength) {
        bestName = fullName;
        bestNameLength = fullName.length;
      }

      processed.add(email);
    });

    merged.name = bestName;
    mergedStats[primaryEmail] = merged;
  });

  // Add remaining unprocessed stats
  Object.entries(statMap).forEach(([email, stats]) => {
    if (!processed.has(email)) {
      mergedStats[email] = stats;
    }
  });

  console.log("--- Contributor Consolidation Results ---");
  console.log(`Original contributors: ${Object.keys(statMap).length}`);
  console.log(`After consolidation: ${Object.keys(mergedStats).length}`);
  console.log("------------------------------------");

  return mergedStats;
}
