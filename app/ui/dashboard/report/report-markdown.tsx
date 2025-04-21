export interface ReportData {
  reportTitle: string
  summary: string
  commitQuality: any
  commitQualityRecommendations: string
  commitFrequency: any
  commitFrequencyRecommendations: string
  commitContributions?: any
  commitContributionsRecommendations?: string
  pullRequests?: any
  pullRequestsRecommendations?: string
  developmentBranches?: any
  developmentBranchesRecommendations?: string
  testCoverage: any
  coverageRecommendations: string
  fileCoverage: any
  sensitiveFiles: any
  sensitiveFilesRecommendations: string
  directCommits?: any
  directCommitsRecommendations?: string
  additionalNotes: string
  includedSections: {
    commitQuality: boolean
    commitFrequency?: boolean
    commitContributions?: boolean
    pullRequests?: boolean
    developmentBranches?: boolean
    testCoverage: boolean
    sensitiveFiles: boolean
    directCommits: boolean
  }
}

export function reportMarkdown(data: ReportData): string {
  const {
    reportTitle,
    summary,
    commitQuality,
    commitQualityRecommendations,
    commitFrequency,
    commitFrequencyRecommendations,
    commitContributions,
    commitContributionsRecommendations,
    pullRequests,
    pullRequestsRecommendations,
    developmentBranches,
    developmentBranchesRecommendations,
    testCoverage,
    coverageRecommendations,
    fileCoverage,
    sensitiveFiles,
    sensitiveFilesRecommendations,
    directCommits,
    directCommitsRecommendations,
    additionalNotes,
    includedSections,
  } = data

  let markdown = `# ${reportTitle}

## Summary

${summary}

`

  // Commit Quality Section
  if (includedSections.commitQuality && commitQuality) {
    markdown += `## Commit Quality Analysis

- **Total Commits Analyzed**: ${commitQuality.totalCommits}
- **Overall Quality Score**: ${commitQuality.qualityScore}/10
- **Quality Status**: ${commitQuality.qualityStatus.charAt(0).toUpperCase() + commitQuality.qualityStatus.slice(1)}

### Commit Categories Breakdown

- **Excellent**: ${commitQuality.categoryCounts?.Excellent || 0} commits (${commitQuality.excellentPercentage}%)
- **Good**: ${commitQuality.categoryCounts?.Good || 0} commits (${commitQuality.goodPercentage}%)
- **Needs Improvement**: ${commitQuality.categoryCounts?.["Needs Improvement"] || 0} commits (${commitQuality.needsImprovementPercentage}%)

`

    // Add commit message analysis if available
    if (commitQuality.justifications && commitQuality.justifications.length > 0) {
      markdown += `### Commit Message Analysis

| Commit Message | Classification | Justification |
|----------------|----------------|---------------|
`

      // Add each commit message with its classification and justification
      commitQuality.justifications.forEach((item: any) => {
        // Escape pipe characters in the message and reason to avoid breaking the table
        // Handle different property names (message vs commit_message)
        const messageField = item.commit_message || item.message
        const escapedMessage = messageField?.replace(/\|/g, "\\|") || ""
        const escapedReason = item.reason?.replace(/\|/g, "\\|") || ""

        markdown += `| ${escapedMessage} | ${item.classification || item.category} | ${escapedReason} |
`
      })

      markdown += "\n"
    }

    markdown += `### Recommendations

${commitQualityRecommendations}

`
  }

  // Commit Frequency Section
  if (includedSections.commitFrequency && commitFrequency) {
    markdown += `## Commit Frequency Analysis

`

    // Check if we should include the image
    // The includeImage property is directly on the commitFrequency object
    const shouldIncludeImage = commitFrequency.includeImage !== false

    // If we should include the image and we have image data
    if (shouldIncludeImage && commitFrequency.url) {
      // Create an absolute URL if baseUrl is provided
      const imageUrl = commitFrequency.url
      markdown += `![Commit Frequency Chart](${imageUrl})

`
    }

    // Add author statistics if available
    if (commitFrequency && commitFrequency.authorTotals) {
      markdown += `### Author Contribution Statistics

| Author | Email | Commits | Percentage |
|--------|-------|---------|------------|
`

      // Process author statistics
      const authorStats = Object.entries(commitFrequency.authorTotals)
        .filter(([email]) => email !== "TOTAL@commits")
        .map(([email, commits]) => ({
          email,
          name: commitFrequency.authors?.[email] || email,
          commits,
          percentage:
            commitFrequency.total > 0
              ? (((commits as number) / commitFrequency.total) * 100).toFixed(1)
              : "0",
        }))
        .sort((a, b) => (b.commits as number) - (a.commits as number))

      // Add each author with their stats
      authorStats.forEach((author) => {
        const escapedName = author.name.replace(/\|/g, "\\|")
        const escapedEmail = author.email.replace(/\|/g, "\\|")

        markdown += `| ${escapedName} | ${escapedEmail} | ${author.commits} | ${author.percentage}% |
`
      })

      markdown += `
**Total Commits**: ${commitFrequency.total}

`
    }

    // Add recommendations
    if (commitFrequencyRecommendations) {
      markdown += `### Recommendations

${commitFrequencyRecommendations}

`
    }
  }

  // Commit Contributions Section
  if (includedSections.commitContributions && commitContributions) {
    markdown += `## Commit Contributions Analysis

`

    // Check if we should include the image
    const shouldIncludeImage = commitContributions.includeImage !== false

    // If we should include the image and we have image data
    if (shouldIncludeImage && commitContributions.url) {
      const imageUrl = commitContributions.url
      markdown += `![Commit Contributions Chart](${imageUrl})

`
    }

    // Add contributors table if available
    if (commitContributions.contributors && commitContributions.contributors.length > 0) {
      markdown += `### Contributors

| Contributor | Email | Additions | Deletions | Total Lines |
|-------------|-------|-----------|-----------|-------------|
`

      // Add each contributor with their stats
      commitContributions.contributors.forEach((contributor: any) => {
        const escapedName = (contributor.name || "").replace(/\|/g, "\\|")
        const escapedEmail = (contributor.email || "").replace(/\|/g, "\\|")

        markdown += `| ${escapedName} | ${escapedEmail} | ${contributor.additions || 0} | ${contributor.deletions || 0} | ${contributor.total || 0} |
`
      })

      markdown += "\n"
    }

    // Add recommendations
    if (commitContributionsRecommendations) {
      markdown += `### Recommendations

${commitContributionsRecommendations}

`
    }
  }

  // Pull Requests Section
  if (includedSections.pullRequests && pullRequests) {
      console.log("her", pullRequests)
    markdown += `## Pull Requests Analysis
    

`

    // Check if we should include the image
    const shouldIncludeImage = pullRequests.includeImage !== false

    // If we should include the image and we have image data
    if (shouldIncludeImage && pullRequests.url) {
      const imageUrl = pullRequests.url
      markdown += `![Pull Requests Chart](${imageUrl})

`
    }

    // Add pull request stats
    markdown += `### Pull Request Statistics

- **Total Pull Requests**: ${pullRequests.totalPRs || 0}
- **PRs with Review**: ${pullRequests.prsWithReview || 0} (${pullRequests.prsWithReviewPercentage || 0}%)
- **PRs without Review**: ${pullRequests.prsWithoutReview || 0} (${pullRequests.prsWithoutReviewPercentage || 0}%)
- **Average Time to Merge**: ${(pullRequests.averageTimeToMerge || 0).toFixed(2)} hours
- **Average Comments per PR**: ${(pullRequests.averageCommentsPerPR || 0).toFixed(2)}

`

    // Add user activity table if available
    if (pullRequests.data && pullRequests.data.length > 0) {
      markdown += `### Pull Request Activity by User

| User | Pull Requests | Reviews | Reviews % | Comments | Comments % |
|------|--------------|---------|-----------|----------|------------|
`

      // Add each user's PR activity
      pullRequests.data.forEach((user: any) => {
        const escapedName = user.name.replace(/\|/g, "\\|")

        markdown += `| ${escapedName} | ${user.pullRequests} | ${user.reviews} | ${user.reviewPercentage}% | ${user.comments} | ${user.commentPercentage}% |
`
      })

      markdown += "\n"
    }

    // Add recommendations
    if (pullRequestsRecommendations) {
      markdown += `### Recommendations

${pullRequestsRecommendations}

`
    }
  }
  // Development Branches Section (Branch-Issue Connection)
  if (includedSections.developmentBranches && developmentBranches) {
    markdown += `## Branch-Issue Connection Analysis

- **Total Branches**: ${developmentBranches.totalBranches}
- **Branches Linked to Issues**: ${developmentBranches.linkedBranches} (${developmentBranches.linkPercentage}%)
- **Unlinked Branches**: ${developmentBranches.unlinkedBranches} (${100 - developmentBranches.linkPercentage}%)

`

    // Add branch connections table if available
    if (developmentBranches.branchConnections && developmentBranches.branchConnections.length > 0) {
      markdown += `### Branch Connections

| Branch Name | Issue | Status |
|-------------|-------|--------|
`

      // Add each branch connection
      developmentBranches.branchConnections.forEach((branch: any) => {
        const escapedBranchName = branch.branchName.replace(/\|/g, "\\|")
        const issueInfo = branch.issueNumber
          ? `#${branch.issueNumber}${branch.issueTitle ? ` (${branch.issueTitle.replace(/\|/g, "\\|")})` : ""}`
          : "—"
        const status = branch.isLinked ? "Linked" : "Unlinked"

        markdown += `| \`${escapedBranchName}\` | ${issueInfo} | ${status} |
`
      })

      markdown += "\n"
    }

    // Add recommendations
    if (developmentBranchesRecommendations) {
      markdown += `### Recommendations

${developmentBranchesRecommendations}

`
    }
  }

  // Combined Test Coverage Section
  if (includedSections.testCoverage && (testCoverage || (fileCoverage && fileCoverage.length > 0))) {
    markdown += `## Test Coverage Analysis

`

    // Overall test coverage metrics in a table
    if (testCoverage) {
      // Safely access properties with fallbacks
      const overall = testCoverage.overall || testCoverage.percentage || 0
      const statements = testCoverage.statements || 0
      const branches = testCoverage.branches || 0
      const functions = testCoverage.functions || 0
      const lines = testCoverage.lines || 0

      markdown += `### Overall Coverage Metrics

| Metric | Coverage |
|--------|----------|
| Overall | ${overall.toFixed(1)}% |
| Statements | ${statements.toFixed(1)}% |
| Branches | ${branches.toFixed(1)}% |
| Functions | ${functions.toFixed(1)}% |
| Lines | ${lines.toFixed(1)}% |

`
    }

    // File-specific coverage in a table
    if (fileCoverage && fileCoverage.length > 0) {
      const lowCoverageThreshold = 70
      const lowCoverageFiles = fileCoverage.filter((file: any) => {
        const statements = Number.parseFloat(file.statements)
        const branches = Number.parseFloat(file.branches)
        const functions = Number.parseFloat(file.functions)
        return statements < lowCoverageThreshold || branches < lowCoverageThreshold || functions < lowCoverageThreshold
      })

      if (lowCoverageFiles.length > 0) {
        markdown += `### Files with Low Coverage

| File | Statements | Branches | Functions |
|------|------------|----------|----------|
`

        lowCoverageFiles.forEach((file: any) => {
          markdown += `| \`${file.filePath}\` | ${file.statements}% | ${file.branches}% | ${file.functions}% |
`
        })

        markdown += "\n"
      } else {
        markdown += `### File Coverage

All files have good coverage levels.

`
      }
    }

    markdown += `### Recommendations

${coverageRecommendations}

`
  }

  // Direct Commits Section
  if (includedSections.directCommits && directCommits) {
    const sortedAuthors = directCommits[0] || []
    const authorCount = directCommits[1] || {}
    const totalDirectCommits = sortedAuthors.reduce(
      (total: number, author: string) => total + (authorCount[author] || 0),
      0,
    )

    markdown += `## Direct Commits to the Main Branch

${totalDirectCommits} commit${totalDirectCommits !== 1 ? "s" : ""} made directly to the main branch without going through pull requests.

`

    if (sortedAuthors.length > 0) {
      markdown += `### Contributors with Direct Commits

| Contributor | Number of Direct Commits |
|-------------|--------------------------|
`

      // Add each contributor with their commit count
      sortedAuthors.forEach((author: string) => {
        const escapedAuthor = author.replace(/\|/g, "\\|")
        markdown += `| ${escapedAuthor} | ${authorCount[author] || 0} |
`
      })

      markdown += "\n"
    }

    if (directCommitsRecommendations) {
      markdown += `### Recommendations

${directCommitsRecommendations}

`
    }
  }

  // Sensitive Files Section
  if (includedSections.sensitiveFiles && sensitiveFiles) {
    // Extract sensitive and warning files based on different possible data structures
    let sensFiles: any[] = []
    let warnFiles: any[] = []

    if (Array.isArray(sensitiveFiles)) {
      // If sensitiveFiles is already an array with [sensitiveFiles, warningFiles]
      sensFiles = sensitiveFiles[0] || []
      warnFiles = sensitiveFiles[1] || []
    } else if (sensitiveFiles?.data && Array.isArray(sensitiveFiles.data)) {
      // If sensitiveFiles has a data property that is an array
      sensFiles = sensitiveFiles.data[0] || []
      warnFiles = sensitiveFiles.data[1] || []
    } else if (sensitiveFiles?.sensitiveFiles && sensitiveFiles?.warningFiles) {
      // If sensitiveFiles has separate properties for each type
      sensFiles = sensitiveFiles.sensitiveFiles || []
      warnFiles = sensitiveFiles.warningFiles || []
    }

    if (sensFiles.length > 0 || warnFiles.length > 0) {
      markdown += `## Sensitive Files Analysis

${sensitiveFilesRecommendations}

`

      if (sensFiles.length > 0) {
        markdown += `### Sensitive Files (${sensFiles.length})

These files may contain credentials, tokens, or other secrets and should be handled with care:

| File Path |
|-----------|
${sensFiles
  .map((file: any) => {
    const escapedPath = file.path.replace(/\|/g, "\\|")
    return `| \`${escapedPath}\` |`
  })
  .join("\n")}

`
      }

      if (warnFiles.length > 0) {
        markdown += `### Warning Files (${warnFiles.length})

These files may contain temporary data or system-specific configurations:

| File Path |
|-----------|
${warnFiles
  .map((file: any) => {
    const escapedPath = file.path.replace(/\|/g, "\\|")
    return `| \`${escapedPath}\` |`
  })
  .join("\n")}

`
      }
    }
  }

  // Additional Notes Section
  if (additionalNotes) {
    markdown += `## Additional Notes

${additionalNotes}

`
  }

  // Footer
  markdown += `---
Generated on ${new Date().toLocaleDateString()} by GitTrack`

  return markdown
}
