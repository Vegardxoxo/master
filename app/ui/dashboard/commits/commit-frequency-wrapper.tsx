import CommitFrequency from "@/app/ui/dashboard/commits/commit-frequency";
import { fetchAllCommits } from "@/app/lib/data/github-api-functions";
import { parseCommitData } from "@/app/lib/utils/utils";
import { fetchGraphUrl } from "@/app/lib/database-functions/database-functions";
import {CommitData} from "@/app/lib/definitions/definitions";

export default async function CommitFrequencyWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const image_url = await fetchGraphUrl(owner, repo, "COMMIT_FREQUENCY");

  return <CommitFrequency data={commitData} image_url={image_url} />;
}
