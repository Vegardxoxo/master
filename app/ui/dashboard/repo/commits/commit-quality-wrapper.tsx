import CommitQuality from "@/app/ui/dashboard/repo/commits/commit-quality";
import { fetchCommits } from "@/app/lib/data";
import {createUrlMap, mapIdToUrl, parseCommitData, preprocessCommit} from "@/app/lib/utils";
import { sendCommitMessage } from "@/app/lib/model";
import { CommitEval } from "@/app/lib/definitions";
import {getDummyModelData} from "@/app/lib/placeholder-data";

export default async function CommitQualityWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // const commitData = await fetchCommits(owner, repo);
  // const { commitSummary } = parseCommitData(commitData);
  // const preparedData = preprocessCommit(commitSummary);
  // const { mappedCommits, urlMap } = createUrlMap(preparedData);
  //
  // const modelResponse = await Promise.all(
  //   mappedCommits.map((obj) => sendCommitMessage(obj)),
  // );
  // if (!modelResponse) return <p>data could not be loaded.</p>;
  // const nonNullResults = modelResponse.filter(Boolean) as CommitEval[][];
  // const flattened = nonNullResults.flat(); // => CommitEval[]
  // const final = mapIdToUrl(flattened, urlMap)
  // console.log(final)
  const data = await getDummyModelData();
  return <CommitQuality data={data} />;
}
