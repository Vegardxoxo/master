import { fetchBranches, fetchIssues } from "@/app/lib/data/data";
import { extractIssueFromBranchName } from "@/app/ui/dashboard/branches/branches.lib";
import Warning from "@/app/ui/dashboard/alerts/warning";
import BranchConnections from "@/app/ui/dashboard/branches/branch-connections";

export default async function BranchConnectionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // Fetch branches and issues
  const branches = await fetchBranches(owner, repo);
  const issues = await fetchIssues(owner, repo);

  if (!branches) {
    return (
      <Warning
        title={"No branches found"}
        message={"No branches found for this repository."}
      />
    );
  }

  // Filter out main/master branches
  const developmentBranches = branches.filter(
    (branch) => branch.name !== "main" && branch.name !== "master",
  );

  // Extract issue numbers from branch names
  const branchConnections = developmentBranches.map((branch) => {
    const issueNumber = extractIssueFromBranchName(branch.name);
    const linkedIssue = issueNumber
      ? issues.find(
          (issue: { number: number }) => issue.number === parseInt(issueNumber),
        )
      : null;

    return {
      branchName: branch.name,
      issueNumber: issueNumber,
      url: linkedIssue?.url || "#",
      isLinked: !!linkedIssue,
      issueTitle: linkedIssue?.title || null,
    };
  });

  // Calculate statistics
  const totalBranches = branchConnections.length;
  const linkedBranches = branchConnections.filter((b) => b.isLinked).length;
  const unlinkedBranches = totalBranches - linkedBranches;
  const linkPercentage =
    totalBranches > 0 ? Math.round((linkedBranches / totalBranches) * 100) : 0;

  return (
    <BranchConnections
      branchConnections={branchConnections}
      linkedBranches={linkedBranches}
      totalBranches={totalBranches}
      unlinkedBranches={unlinkedBranches}
      linkPercentage={linkPercentage}
      addToReport={true}
    />
  );
}
