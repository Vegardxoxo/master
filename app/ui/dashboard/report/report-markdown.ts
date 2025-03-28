export interface ReportData {
  reportTitle: string
  summary: string
  commitQuality: any
  commitRecommendations: string
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
    commitRecommendations,
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

        markdown += `| ${escapedMessage} | ${item.classification} | ${escapedReason} |\n`
      })

      markdown += "\n"
    }

    markdown += `### Recommendations

${commitRecommendations}

`
  }

  // Combined Test Coverage Section
  if (includedSections.testCoverage && (testCoverage || (fileCoverage && fileCoverage.length > 0))) {
    markdown += `## Test Coverage Analysis

`

    // Overall test coverage metrics
    if (testCoverage) {
      // Safely access properties with fallbacks
      const overall = testCoverage.overall || testCoverage.percentage || 0
      const statements = testCoverage.statements || 0
      const branches = testCoverage.branches || 0
      const functions = testCoverage.functions || 0
      const lines = testCoverage.lines || 0

      markdown += `### Overall Coverage Metrics

- **Overall Coverage**: ${overall.toFixed(1)}%
- **Statements**: ${statements.toFixed(1)}%
- **Branches**: ${branches.toFixed(1)}%
- **Functions**: ${functions.toFixed(1)}%
- **Lines**: ${lines.toFixed(1)}%

`
    }

    // File-specific coverage
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

${lowCoverageFiles
  .map(
    (file: any) =>
      `- **${file.filePath}**: Statements: ${file.statements}%, Branches: ${file.branches}%, Functions: ${file.functions}%`,
  )
  .join("\n")}

`
      } else {
        markdown += "### File Coverage\n\nAll files have good coverage levels.\n\n"
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
        markdown += `| ${escapedAuthor} | ${authorCount[author] || 0} |\n`
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

${sensFiles.map((file: any) => `- \`${file.path}\``).join("\n")}

`
      }

      if (warnFiles.length > 0) {
        markdown += `### Warning Files (${warnFiles.length})

These files may contain temporary data or system-specific configurations:

${warnFiles.map((file: any) => `- \`${file.path}\``).join("\n")}

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
Generated on ${new Date().toLocaleDateString()} by Git Workflow Analysis Tool`

  return markdown
}

