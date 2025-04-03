import { getShortFilePath } from "@/app/ui/dashboard/project_info/test-coverage/coverage-utils"

export interface ReportData {
  reportTitle: string
  summary: string
  commitQuality: any
  commitQualityRecommendations: string
  commitFrequency: any
  commitFrequencyRecommendations: string
  commitContributions?: any
  commitContributionsRecommendations?: string
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

        markdown += `| ${escapedMessage} | ${item.category} | ${escapedReason} |
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
      console.log("commitFrequency MARKDOWN", commitFrequency)
      // Create an absolute URL if baseUrl is provided
      const imageUrl = commitFrequency.url
      console.log("imageUrl", imageUrl)
      markdown += `![Commit Frequency Chart](${imageUrl})

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
  markdown += `## Commit Contributions Analysis\n\n`

  // Check if we should include the image
  const shouldIncludeImage = commitContributions.includeImage !== false

  // If we should include the image and we have image data
  if (shouldIncludeImage && commitContributions.url) {
    const imageUrl = commitContributions.url
    markdown += `![Commit Contributions Chart](${imageUrl})\n\n`
  }

  // Add project average metrics
  const avgChanges = commitContributions.groupAverageChanges;
  const avgFilesChanged = commitContributions.groupAverageFilesChanged;

  if (avgChanges || avgFilesChanged) {
    markdown += `### Project Averages\n\n`
    markdown += `- **Average Changes Per Commit**: ${avgChanges || 'N/A'}\n`
    markdown += `- **Average Files Changed Per Commit**: ${avgFilesChanged || 'N/A'}\n\n`
  }

  // Add contributors table if available
  if (commitContributions.contributors && commitContributions.contributors.length > 0) {
    markdown += `### Contributors\n\n`
    markdown += `| Name | Total Commits | Additions | Deletions | Co-authored Lines | Avg Changes | Avg Files Changed |\n`
    markdown += `|------|--------------|-----------|-----------|------------------|------------|------------------|\n`

    // Add each contributor with their stats
    commitContributions.contributors.forEach((contributor: any) => {
      // Extract only the first part of the name (before any spaces)
      const firstName = contributor.name ? contributor.name.split(' ')[0] : ""
      const escapedName = firstName.replace(/\|/g, "\\|")

      markdown += `| ${escapedName} | ${contributor.commits || 0} | +${contributor.additions || 0} | -${contributor.deletions || 0} | ${contributor.co_authored_lines || 0} | ${contributor.average_changes.toFixed(1) || 0} | ${contributor.average_files_changed.toFixed(1) || 0} |\n`
    })

    markdown += `\n`
  }

  // Add recommendations
  if (commitContributionsRecommendations) {
    markdown += `### Recommendations\n\n${commitContributionsRecommendations}\n\n`
  }
}


  // Combined Test Coverage Section
  if (includedSections.testCoverage && (testCoverage || (fileCoverage && fileCoverage.length > 0))) {
    markdown += `## Test Coverage Analysis\n\n`

    // Overall test coverage metrics in a table
    if (testCoverage) {
      // Safely access properties with fallbacks
      const overall = testCoverage.overall || testCoverage.percentage || 0
      const statements = testCoverage.statements || 0
      const branches = testCoverage.branches || 0
      const functions = testCoverage.functions || 0
      const lines = testCoverage.lines || 0

      markdown += `### Overall Coverage Metrics\n\n`

      // Create a table for overall metrics
      markdown += `| Metric | Coverage |\n`
      markdown += `|--------|----------|\n`
      markdown += `| Overall | ${overall.toFixed(1)}% |\n`
      markdown += `| Statements | ${statements.toFixed(1)}% |\n`
      markdown += `| Branches | ${branches.toFixed(1)}% |\n`
      markdown += `| Functions | ${functions.toFixed(1)}% |\n`
      markdown += `| Lines | ${lines.toFixed(1)}% |\n\n`
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
        markdown += `### Files with Low Coverage\n\n`

        // Create a table for files with low coverage
        markdown += `| File | Statements | Branches | Functions |\n`
        markdown += `|------|------------|----------|----------|\n`

        lowCoverageFiles.forEach((file: any) => {
          markdown += `| \`${getShortFilePath(file.filePath)}\` | ${file.statements}% | ${file.branches}% | ${file.functions}% |\n`
        })

        markdown += `\n`
      } else {
        markdown += `### File Coverage\n\nAll files have good coverage levels.\n\n`
      }
    }

    markdown += `### Recommendations\n\n${coverageRecommendations}\n\n`
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
Generated on ${new Date().toLocaleDateString()} by Git Workflow Analysis Tool`

  return markdown
}

