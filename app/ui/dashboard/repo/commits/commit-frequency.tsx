import FrequencyChart from "@/app/ui/dashboard/repo/commits/frequency-chart";
import { fetchCommits } from "@/app/lib/data";
import { parseCommitData } from "@/app/lib/utils";

export default async function CommitFrequency({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // const commitData = await fetchAllCommits(owner, repo);

  const commitData = await fetchCommits(owner, repo);
  const { total, dayEntries, emailToDisplayName } = parseCommitData(commitData);

  return (
    <FrequencyChart
      total={total}
      authors={emailToDisplayName}
      data={dayEntries}
    />
  );
}
