import CommitFrequency from "@/app/ui/dashboard/commits/commit-frequency";
import { fetchAllCommits } from "@/app/lib/data/data";
import { parseCommitData } from "@/app/lib/utils/utils";

export default async function CommitFrequencyWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { total, dayEntries, emailToDisplayName, commitByDate } = parseCommitData(commitData);


  return (
    <CommitFrequency
      total={total}
      authors={emailToDisplayName}
      data={dayEntries}
      dates={commitByDate}
    />
  );
}
