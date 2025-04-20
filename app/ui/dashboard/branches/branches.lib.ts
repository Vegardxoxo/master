export function extractIssueFromBranchName(branchName: string): string | null {
  const directMatch = branchName.match(/^(\d+)[-/]/)
  if (directMatch) {
    return directMatch[1]
  }

  const prefixMatch = branchName.match(/(?:issue|feature|bugfix|hotfix)[/-](\d+)[-/]/i)
  if (prefixMatch) {
    return prefixMatch[1]
  }

  return null
}