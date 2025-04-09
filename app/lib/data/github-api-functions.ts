"use server"
import { Octokit } from "octokit";
import { promises as fs } from "fs";
import * as path from "path";
import {
  _Branches,
  Commit, CommitData,
  CommitMessageLong,
  PullRequestData,
  repositoryOverview,
} from "@/app/lib/definitions/definitions";
import {
  formatTimestamp,
  parseCommitStats,
  parsePullRequests, transformLocalImagePaths,
} from "@/app/lib/utils/utils";
import { cache } from "react";
import { getCommitsOnMain } from "@/app/lib/data/graphql-queries";
import {CommitStats} from "@/app/lib/definitions/commit-definitions";

const octokit = new Octokit({
  auth: process.env.TOKEN,
  baseUrl: "https://git.ntnu.no/api/v3",
});

// const octokit = new Octokit({
//   auth: process.env.SUPER_TOKEN,
// });

/**
 * Fetches an overview about the projects. Data is used to render data tables.
 * @param owner
 * @param repo
 */
export async function fetchRepoOverview(
  owner: string,
  repo: string,
): Promise<{ data: repositoryOverview; error: string | null }> {
  try {
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    const contributorsRes = await octokit.request(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner,
        repo,
      },
    );

    const issuesRes = await octokit.request(
      "GET /repos/{owner}/{repo}/issues",
      {
        owner,
        repo,
        state: "open",
      },
    );

    return {
      data: {
        owner: repoInfo.data.owner.login,
        name: repoInfo.data.name,
        contributors: contributorsRes.data
          .map((c) => c.login)
          .filter((login): login is string => !!login),
        openIssues: issuesRes.data.length,
        url: repoInfo.data.html_url,
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching repo data via REST:", err);
    return {
      data: {
        contributors: [],
        name: repo,
        openIssues: 0,
        owner: owner,
        url: "",
      },
      error:
        err instanceof Error && "status" in err && (err as any).status === 404
          ? `Repository ${owner}/${repo} not found. Please check if the repository URL is correct.`
          : `Failed to fetch data for ${owner}/${repo}. Please try again later.`,
    };
  }
}

/**
 * Lists branches in a repository.
 * @param owner - GitHub owner/organization
 * @param repo  - Repository name
 */
export async function fetchBranches(owner: string, repo: string) {
  try {
    const { data: branchesData } = await octokit.request(
      "GET /repos/{owner}/{repo}/branches",
      {
        owner,
        repo,
      },
    );
    return branchesData;
  } catch (e) {
    console.error("Error fetching branches:", e);
    throw new Error("Failed to fetch branches.");
  }
}

/**
 * Fetches details for a single branch (including its latest commit info).
 * @param owner - GitHub owner/organization
 * @param repo  - Repository name
 * @param branch - DirectCommitsWrapper name
 */
export async function fetchBranchDetails(
  owner: string,
  repo: string,
  branch: string,
) {
  try {
    const { data: branchData } = await octokit.request(
      "GET /repos/{owner}/{repo}/branches/{branch}",
      {
        owner,
        repo,
        branch,
      },
    );
    return branchData;
  } catch (e) {
    console.error("Error fetching details for branch:", e);
    throw new Error("Failed to fetch details for branch.");
  }
}

/**
 * Fetches all branches, determines their "staleness" based on last commit date,
 * and returns them with an added `status` and `lastUpdate`.
 * @param owner - GitHub owner/organization
 * @param repo  - Repository name
 * @param branches
 */
export async function fetchBranchesWithStatus(
  owner: string,
  repo: string,
  branches: _Branches[],
) {
  const now = new Date();
  const staleThresholdDays = 14;

  return await Promise.all(
    branches.map(async (branch) => {
      const commitData = await fetchBranchDetails(owner, repo, branch.name);

      // Default to a far-past date if commit info is missing
      let lastCommitDate = new Date(0);
      if (commitData.commit?.commit?.author?.date) {
        lastCommitDate = new Date(commitData.commit.commit.author.date);
      }

      // Calculate difference in days from now
      const diffInMs = now.getTime() - lastCommitDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      let status = "active";
      if (diffInDays > staleThresholdDays) {
        status = "stale";
      }

      return {
        ...branch,
        lastUpdate: formatTimestamp(lastCommitDate.toISOString()),
        status,
      };
    }),
  );
}

/**
 * Fetches contributors for the contributor card in the dashboard.
 * @param owner
 * @param repo
 */
export async function fetchContributors(owner: string, repo: string) {
  try {
    const { data: contributorData } = await octokit.request(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner,
        repo,
      },
    );
    return {
      contributors: contributorData.map((c: any) => c.login),
    };
  } catch (e) {
    console.error("Error fetching contributors:", e);
    throw new Error("Failed to fetch contributors.");
  }
}

/**
 * Fetches general information about the repository.
 * @param owner
 * @param repo
 */
export async function fetchProjectInfo(owner: string, repo: string) {
  try {
    const { data: repoData } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
      },
    );
    return {
      name: repoData.name,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      updatedAt: repoData.updated_at,
    };
  } catch (e) {
    console.error("Error fetching project info:", e);
    throw new Error("Failed to fetch repository information.");
  }
}

/**
 * Fetches commits from a repository
 * @param owner
 * @param repo
 */
export async function fetchCommits(owner: string, repo: string) {
  try {
    const { data: commitData } = await octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner,
        repo,
        per_page: 5,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    return commitData;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch commits");
  }
}

/**
 * Fetches all commits for a repository. Uses octokit's built in pagination.
 * @param owner
 * @param repo
 */
export async function fetchAllCommits(owner: string, repo: string): Promise<CommitData[]> {
  try {
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return commits.map(item => ({
      sha: item.sha,
      html_url: item.html_url,
      commit: {
        author: {
          name: item.commit.author?.name  || "Unknown",
          email: item.commit.author?.email || "Unknown",
          date: item.commit.author?.date || "Unknown",
        },
        message: item.commit.message,
        url: item.commit.url
      }
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function fetchRepoId(owner: string, repo: string) {
  try {
    const { data: repoData } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
      },
    );
    return {
      id: repoData.id.toString(),
      name: repoData.name,
      fullName: repoData.full_name,
      url: repoData.html_url,
      success: true,
    };
  } catch (e) {
    console.error("Error fetching repository info:", e);
    return {
      id: null,
      name: null,
      fullName: null,
      url: null,
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to fetch repository information",
    };
  }
}

export async function fetchCommitStats(
  owner: string,
  repo: string,
  ref: string,
) {
  try {
    const { data: commitData } = await octokit.request(
      "/repos/{owner}/{repo}/commits/{ref}",
      {
        owner,
        repo,
        ref,

        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    return parseCommitStats(commitData);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch details about commit:" + ref);
  }
}

export async function fetchCommitStatsGraphQL(
  owner: string,
  repo: string,
  data: CommitMessageLong[],
): Promise<CommitData[]> {
  const shas = data.map((obj) => obj.sha)
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ${shas
          .map(
            (sha, index) => `
            commit${index}: object(oid: "${sha}") {
              ... on Commit {
                committedDate
                author {
                  email
                  name
                }
                additions
                deletions
                changedFiles
                url
              }
            }
          `,
          )
          .join("\n")}
      }
    }
  `

  try {
    const response = await octokit.graphql(query, { owner, repo })
    const commitStats = Object.values(response.repository) as CommitStats[]

    // Transform the data to match the CommitData structure expected by AuthorMerger
    return commitStats.map((stat, index) => {
      // Find the corresponding original data to get the message
      const originalCommit = data.find((commit) => commit.sha === stat.url.split("/").pop())

      return {
        html_url: stat.url,
        commit: {
          author: {
            name: stat.author.name,
            email: stat.author.email,
            date: stat.committedDate,
          },
          url: stat.url,
        },
        _original: {
          additions: stat.additions,
          deletions: stat.deletions,
          changedFiles: stat.changedFiles,
        },
      }
    })
  } catch (e) {
    console.error("GraphQL Error:", e)
    throw new Error("Failed to fetch commit details via GraphQL.")
  }
}

// Cache key generator
const getPullRequestsCacheKey = (
  owner: string,
  repo: string,
  state: "open" | "closed" | "all",
) => `pull-requests:${owner}:${repo}:${state}`;

/**
 * Fetches the list of pull requests for a given repository.
 *
 * @param {string} owner - The username or organization name of the repository owner.
 * @param {string} repo - The name of the repository.
 * @param state
 * @return {Promise<Array>} A promise that resolves to an array of pull request objects retrieved from the repository. Returns an empty array if an error occurs.
 */
export const fetchPullRequests = cache(
  async (
    owner: string,
    repo: string,
    state: "open" | "closed" | "all",
  ): Promise<PullRequestData> => {
    const cacheKey = getPullRequestsCacheKey(owner, repo, state);
    console.log(`Fetching pull requests for ${cacheKey}`);
    try {
      const pullRequests = await octokit.paginate(octokit.rest.pulls.list, {
        owner,
        repo,
        state,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      const prsWithReviews = await Promise.all(
        pullRequests.map(async (pr) => {
          try {
            const reviews = await octokit.paginate(
              octokit.rest.pulls.listReviews,
              {
                owner,
                repo,
                pull_number: pr.number,
                per_page: 100,
              },
            );

            // if (reviews.length > 0) console.log(reviews[0].body);

            const comments = await octokit.paginate(
              octokit.rest.issues.listComments,
              {
                owner,
                repo,
                issue_number: pr.number,
                per_page: 100,
              },
            );
            // if (comments.length > 0) console.log("comments", comments[0].body, comments[0].user.login)

            const commenters = comments.reduce(
              (acc, comment) => {
                if (comment.user && comment.user.login) {
                  acc[comment.user.login] = (acc[comment.user.login] || 0) + 1;
                }
                return acc;
              },
              {} as Record<string, number>,
            );

            const reviewers = reviews.reduce(
              (acc, review) => {
                if (review.user && review.user.login) {
                  acc[review.user.login] = (acc[review.user.login] || 0) + 1;
                }
                return acc;
              },
              {} as Record<string, number>,
            );
            return {
              number: pr.number,
              url: pr.html_url,
              title: pr.title,
              state: pr.state,
              milestone: pr.milestone?.title ?? "None",
              created_at: pr.created_at,
              updated_at: pr.updated_at,
              closed_at: pr.closed_at,
              merged_at: pr.merged_at,
              user: pr.user?.login ?? "unknown",
              reviews: reviews.length,
              review_comments: reviews.map((review) => review.body).join(", "),
              comments: comments.length,
              linked_issues:
                typeof pr.body === "string"
                  ? pr.body.match(/#\d+/g)?.length || 0
                  : 0,
              reviewers,
              commenters,
              labels: pr.labels || [],
            };
          } catch (e) {
            console.error("GitHub api error: failed to fetch pull requests");
            return [];
          }
        }),
      );
      const parsed = parsePullRequests(prsWithReviews);
      return parsed;
    } catch (e) {
      console.log(e);
      return [];
    }
  },
);

export async function listWorkflowRuns(owner: string, repo: string) {
  try {
    // Use Octokit's paginate method to automatically handle pagination
    const runs = await octokit.paginate(
      "GET /repos/{owner}/{repo}/actions/runs",
      {
        owner,
        repo,
        per_page: 100,
      },
    );

    const simplifiedRuns = runs.map((run) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      created_at: run.created_at,
      updated_at: run.updated_at,
      run_started_at: run.run_started_at,
      run_number: run.run_number,
    }));

    const sorted_runs = simplifiedRuns.sort((a, b) => {
      return b.run_number - a.run_number;
    });

    return {
      workflow_runs: sorted_runs,
      total_count: simplifiedRuns.length,
    };
  } catch (e) {
    console.error("Error fetching workflow runs:", e);
    return { workflow_runs: [], total_count: 0 };
  }
}

export async function getMainCommits(
  owner: string,
  repo: string,
): Promise<Commit[] | null> {
  try {
    const branchesToCheck = ["master", "main"];

    for (const branch of branchesToCheck) {
      try {
        const branchResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/branches/{branch}",
          {
            owner,
            repo,
            branch,
          },
        );

        if (branchResponse.status === 200) {
          const response = await octokit.graphql(getCommitsOnMain, {
            owner,
            repo,
            branch,
          });

          // @ts-ignore - Type safety for the response
          const commits =
            response?.repository?.ref?.target?.history?.nodes || [];

          const directCommits = commits.filter(
            (commit: any) => commit.associatedPullRequests.nodes.length === 0,
          );

          if (directCommits.length > 0) {
            return directCommits.map((commit: any) => ({
              author: commit.author.name || "Unknown",
              message: commit.message,
              date: commit.author.date,
              url: commit.commitUrl,
              sha: commit.oid,
            }));
          } else {
            console.log(`No direct commits found in branch '${branch}'`);
          }
        }
      } catch (err) {
        console.log(`Error with branch '${branch}', trying next:`, err);
        continue;
      }
    }

    console.log(
      "No direct commits found in either 'master' or 'main' branches.",
    );
    return null;
  } catch (e: any) {
    console.error("GitHub GraphQL API error:", e);
    return null;
  }
}

interface GitHubIssue {
  error?: string;
  title: string;
  number: number;
  url: string;
}

export async function fetchIssues(
  owner: string,
  repo: string,
): Promise<GitHubIssue[]> {
  try {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
    });
    return issues.map((issue) => ({
      title: issue.title,
      number: issue.number,
      url: issue.html_url,
    }));
  } catch (e) {
    console.log("Errir fetching issues:", e);
    return {
      error: "GitHub API error: Failed to fetch issues.",
      title: null,
      number: null,
      url: null,
    };
  }
}

export default async function fetchMilestones(owner: string, repo: string) {
  try {
    const milestones = await octokit.paginate(
      octokit.rest.issues.listMilestones,
      {
        owner,
        repo,
        state: "all",
      },
    );
    return milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description || "No description provided",
      state: milestone.state,
      closedIssues: milestone.closed_issues,
      openIssues: milestone.open_issues,
      totalIssues: milestone.closed_issues + milestone.open_issues,
      dueDate: milestone.due_on,
      createdAt: milestone.created_at,
      updatedAt: milestone.updated_at,
      url: milestone.html_url,
    }));
  } catch (e) {
    console.error("GitHub api error: Failed to fetch milestones:", e);
    return [];
  }
}

type UploadResult =
  | { success: true; url?: string; branch?: string }
  | { success: false; error: string };



export async function uploadReportToRepository(
  owner: string,
  repo: string,
  content: string,
  filename: string,
  images: string[],
  commitMessage = "Add Git Workflow Analysis Report",
): Promise<UploadResult> {
  try {
    console.log("Images to upload:", images);

    // 1) Get the default branch (e.g., "master" or "main")
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    // 2) Create a unique new branch name
    const timestamp = new Date()
      .toISOString()
      .replace("T", "-")
      .split(":")
      .slice(0, 2)
      .join("-");
    const newBranchName = `report-${timestamp}`;
    console.log("Creating new branch:", newBranchName);

    // 3) Get the SHA of the default branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const defaultBranchSha = refData.object.sha;

    // 4) Create the new branch from the default branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: defaultBranchSha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // 5) For each image, we:
    //    - Read the file
    //    - Upload it to "report/images/<uniqueFileName>"
    //    - Build a map from the "old local path" => "new relative path in GitHub"
    const replacements: Record<string, string> = {};

    for (let i = 0; i < images.length; i++) {
      const localPath = images[i]; // e.g. "/charts/foo.png"

      // Remove leading slash if present
      const normalizedLocalPath = localPath.startsWith("/")
        ? localPath.slice(1)
        : localPath;

      // Resolve it relative to current working directory
      const absoluteLocalPath = path.resolve(process.cwd(), normalizedLocalPath);
      console.log(`Reading image from: ${absoluteLocalPath}`);

      // Read file and convert to base64
      const fileBuffer = await fs.readFile(absoluteLocalPath);
      const base64Content = fileBuffer.toString("base64");

      // Decide a filename in the repo
      // We'll place them in "report/images/uniqueFileName.ext"
      const ext = path.extname(localPath) || ".png";
      const baseName = path.basename(localPath, ext);
      const uniqueFileName = `${baseName}-${Date.now()}${ext}`;
      const repoImagePath = `report/images/${uniqueFileName}`;

      // Upload to GitHub
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: repoImagePath,
        message: `${commitMessage}: ${uniqueFileName}`,
        content: base64Content,
        branch: newBranchName,
      });

      // Because the final Markdown is at "report/<filename>",
      // the relative path to images is "./images/<uniqueFileName>"
      const relativePathInMarkdown = `./images/${uniqueFileName}`;

      // We'll store the mapping: localPath => new relative path
      // so we can transform "![Alt](/charts/foo.png)" into "![Alt](./images/foo-123.png)"
      replacements[localPath] = relativePathInMarkdown;
    }

    // 6) Use the utility to transform all local references in "content"
    //    to the new GitHub "report/images" references
    const updatedContent = transformLocalImagePaths(content, replacements);

    // 7) Now commit the updated Markdown to "report/[filename]"
    const markdownPath = `report/${filename}`;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: markdownPath,
      message: commitMessage,
      content: Buffer.from(updatedContent).toString("base64"),
      branch: newBranchName,
    });

    // 8) Return success info
    return {
      success: true,
      url: `https://github.com/${owner}/${repo}/blob/${newBranchName}/${markdownPath}`,
      branch: newBranchName,
    };
  } catch (error) {
    console.error("Error uploading report:", error);

    let errorMessage = "Unknown error occurred during upload";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}