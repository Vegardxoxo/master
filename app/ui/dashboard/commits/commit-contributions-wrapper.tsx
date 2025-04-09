import {
  fetchAllCommits,
  fetchCommitStatsGraphQL,
} from "@/app/lib/data/github-api-functions";
import CommitContributions from "@/app/ui/dashboard/commits/commit-contributions";
import { fetchGraphUrl } from "@/app/lib/database-functions";
import { parseCommitStatsGraphQLEnhanched } from "@/app/lib/utils/email-similarity";
import {parseCommitData, parseCommitStatsGraphQL} from "@/app/lib/utils/commits-utils";

export default async function CommitContributionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const image_url = await fetchGraphUrl(owner, repo, "CONTRIBUTIONS");
  const commitData = await fetchAllCommits(owner, repo);
  const { commitSummary } = parseCommitData(commitData);
  const commits = await fetchCommitStatsGraphQL(owner, repo, commitSummary);
  // console.log(commits)
  //
  // const { statMap, projectAverageFilesChanged, projectAverageChanges } =
  //   parseCommitStatsGraphQL(commits);
  return (
    <CommitContributions
        commits={commits}
        url={image_url}
    />
  );
}
