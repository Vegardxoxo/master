import {
  fetchAllCommits,
  fetchCommitStatsGraphQL,
} from "@/app/lib/data/github-api-functions";
import CommitSize from "@/app/ui/dashboard/commits/commit-size";
import {convertToCommitStats, parseCommitData} from "@/app/lib/utils/commits-utils";

export default async function CommitSizeWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // fetch all commits
  const commitData = await fetchAllCommits(owner, repo);
  // Extract SHAs to fetch detailed information about each commit
  const { commitSummary } = parseCommitData(commitData);
  const commits = await fetchCommitStatsGraphQL(owner, repo, commitSummary);
  const commitsTransformed = convertToCommitStats(commits)

  return <CommitSize data={commitsTransformed} />;
}
