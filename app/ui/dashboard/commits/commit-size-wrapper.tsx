import { parseCommitData } from "@/app/lib/utils/utils";
import { fetchAllCommits, fetchCommitStatsGraphQL } from "@/app/lib/data/data";
import CommitSize from "@/app/ui/dashboard/commits/commit-size";
import { fetchGraphUrl } from "@/app/lib/database-functions";

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
  const { commits } = await fetchCommitStatsGraphQL(owner, repo, commitSummary);
  const image_url = await fetchGraphUrl(owner, repo, "COMMIT_SIZE");

  return <CommitSize data={commits} />;
}
