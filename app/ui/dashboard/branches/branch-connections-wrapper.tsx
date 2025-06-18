import { extractIssueFromBranchName } from "@/app/ui/dashboard/branches/branches.lib";
import Warning from "@/app/ui/dashboard/alerts/warning";
import BranchConnections from "@/app/ui/dashboard/branches/branch-connections";
import {
  getBranches,
  getIssues,
} from "@/app/lib/database-functions/repository-data";

export default async function BranchConnectionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // Fetch branches and issues
  const { branches } = await getBranches(owner, repo);
  const { issues } = await getIssues(owner, repo);

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
      ? issues.find((issue) => {
          // Handle both string and number types for issue.number
          const issueNumberAsInt = parseInt(issueNumber);
          return (
            issue.number === issueNumberAsInt ||
            issue.number === issueNumber ||
            `${issue.number}` === issueNumber
          );
        })
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
