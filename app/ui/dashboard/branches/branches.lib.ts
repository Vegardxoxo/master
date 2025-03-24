


export function extractIssueFromBranchName(branchName: string): string | null {
  const patterns = [
    /issue[/-](\d+)/i,
    /issues[/-](\d+)/i,
    /^(\d+)[-/]/,
    /#(\d+)[-/]/,
    /fix\/issue-(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = branchName.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

