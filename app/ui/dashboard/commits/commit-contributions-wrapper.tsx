import { parseCommitData } from "@/app/lib/utils/utils";
import { fetchAllCommits, fetchCommitStatsGraphQL } from "@/app/lib/data/github-api-functions";
import CommitContributions from "@/app/ui/dashboard/commits/commit-contributions";
import { fetchGraphUrl } from "@/app/lib/database-functions";
import { parseCommitStatsGraphQLEnhanched } from "@/app/lib/utils/email-similarity";
import { parseCommitStatsGraphQL } from "@/app/lib/utils/commits-utils";

export default async function CommitContributionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { commitSummary } = parseCommitData(commitData);
  const commits = await fetchCommitStatsGraphQL(owner, repo, commitSummary);
  // const parsedCommits = parseCommitStatsGraphQLEnhanched(commits);
  const image_url = await fetchGraphUrl(owner, repo, "CONTRIBUTIONS");
  const { statMap, projectAverageFilesChanged, projectAverageChanges } = parseCommitStatsGraphQL(commits);
  return <CommitContributions data={statMap} projectAverageChanges={projectAverageChanges} projectAverageFilesChanged={projectAverageFilesChanged} url={image_url} />;
}
