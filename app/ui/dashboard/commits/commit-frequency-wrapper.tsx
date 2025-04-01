import CommitFrequency from "@/app/ui/dashboard/commits/commit-frequency";
import { fetchAllCommits } from "@/app/lib/data/data";
import { parseCommitData } from "@/app/lib/utils/utils";
import {fetchGraphUrl} from "@/app/lib/database-functions";

export default async function CommitFrequencyWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { total, dayEntries, emailToDisplayName, commitByDate } = parseCommitData(commitData);
  const image_url = await fetchGraphUrl(owner, repo, "COMMIT_FREQUENCY");


  return (
    <CommitFrequency
      total={total}
      authors={emailToDisplayName}
      data={dayEntries}
      dates={commitByDate}
      image_url={image_url}
    />
  );
}
