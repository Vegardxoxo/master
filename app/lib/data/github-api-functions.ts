"use server";
import { Octokit } from "octokit";
import { promises as fs } from "fs";
import * as path from "path";
import {
  Commit,
  CommitData,
  GithubRepoOverview,
  PullRequestData,
} from "@/app/lib/definitions/definitions";
import {
  parsePullRequests,
  transformLocalImagePaths,
} from "@/app/lib/utils/utils";
import { getCommitsOnMain } from "@/app/lib/data/graphql-queries";
import { CommitStats } from "@/app/lib/definitions/commits";
import { GitHubIssue } from "@/app/lib/definitions/pull-requests";

// const octokit = new Octokit({
//   auth: process.env.TOKEN,
//   baseUrl: "https://git.ntnu.no/api/v3",
// });

const octokit = new Octokit({
  auth: process.env.SUPER_TOKEN,
});

/**
 * Fetches the languages used in a repository and their byte counts
 * @param owner - The owner of the repository
 * @param repo - The name of the repository
 * @returns An object mapping language names to byte counts
 */
export async function getRepoLanguages(
  owner: string,
  repo: string,
): Promise<{ [key: string]: number }> {
  try {
    const response = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching repository languages:", error);
    return null;
  }
}

/**
 * Checks if there is a connection to the repo before displaying the rest of the dashboard.
 * @param owner
 * @param repo
 */
export async function checkConnection(
  owner: string,
  repo: string,
): Promise<string | boolean> {
  try {
    const data = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data.data.html_url;
  } catch (e: any) {
    if (e.status === 401 || e.status === 403 || e.status === 404) {
      console.error(
        `Authentication error: No permission to access ${owner}/${repo}. Please check your GitHub token.`,
      );
    } else if (e.status === 429) {
      console.error(`Rate limit exceeded. Please try again later.`);
    } else {
      console.error("GitHub API Error:", e);
    }

    return false;
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
    return branchesData.map((b: any) => ({
      name: b.name,
    }));
  } catch (e) {
    console.error("Error fetching branches:", e);
    throw new Error("Failed to fetch branches.");
  }
}

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
      contributors: contributorData.map((c: any) => ({
        login: c.login,
        url: c.html_url,
      })),
    };
  } catch (e) {
    console.error("Error fetching contributors:", e);
    throw new Error("Failed to fetch contributors.");
  }
}

/**
 * Fetches all commits  SHAs for a repository. Uses octokit's built in pagination.
 * @param owner
 * @param repo
 */
export async function fetchCommitSHAs(
  owner: string,
  repo: string,
): Promise<string[]> {
  try {
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return commits.map((item) => item.sha);
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function fetchRepository(
  owner: string,
  repo: string,
): Promise<GithubRepoOverview> {
  try {
    const { data: repoData } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
      },
    );
    return {
      id: repoData.id?.toString(),
      name: repoData.name,
      url: repoData.html_url,
      openIssues: repoData.open_issues_count.toString(),
      updatedAt: repoData.updated_at,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      success: true,
    };
  } catch (e) {
    console.error("Error fetching repository info:", e);
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to fetch repository information",
    };
  }
}

export async function fetchAllCommits(
  owner: string,
  repo: string,
): Promise<CommitData[]> {
  const shas = await fetchCommitSHAs(owner, repo);
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ${shas
          .map(
            (sha, index) => `
            commit${index}: object(oid: "${sha}") {
              ... on Commit {
                committedDate
                message
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
  `;

  try {
    const response = await octokit.graphql(query, { owner, repo });
    const commitStats = Object.values(response.repository) as CommitStats[];
    return commitStats.map((stat, index) => ({
      sha: shas[index],
      html_url: stat.url,
      commit: {
        author: {
          name: stat.author.name,
          email: stat.author.email,
          date: stat.committedDate,
        },
        message: stat.message,
        url: stat.url,
      },
      additions: stat.additions,
      deletions: stat.deletions,
      changedFiles: stat.changedFiles,
    }));
  } catch (e) {
    console.error("GraphQL Error:", e);
    throw new Error("Failed to fetch commit details via GraphQL.");
  }
}

/**
 * Fetches the list of pull requests for a given repository.
 *
 * @param {string} owner - The username or organization name of the repository owner.
 * @param {string} repo - The name of the repository.
 * @param state
 * @return {Promise<PullRequestData>} A promise that resolves to a PullRequestData object from the repository. Returns an empty array if an error occurs.
 */
export const fetchPullRequests = async (
  owner: string,
  repo: string,
  state: "open" | "closed" | "all",
): Promise<PullRequestData> => {
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

          const comments = await octokit.paginate(
            octokit.rest.issues.listComments,
            {
              owner,
              repo,
              issue_number: pr.number,
              per_page: 100,
            },
          );

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
    return parsePullRequests(prsWithReviews);
  } catch (e) {
    console.log(e);
    return [] as any;
  }
};

export async function fetchWorkflowRuns(owner: string, repo: string) {
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

export async function fetchMainCommits(
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
              branch,
            }));
          } else {
            console.log(`No direct commits found in branch '${branch}'`);
          }
        }
      } catch (err) {
        console.log(`Error with branch '${branch}', trying next:`, err);
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

    const realIssues = issues.filter((issue) => !issue.pull_request);

    return realIssues.map((issue) => ({
      title: issue.title,
      number: issue.number,
      url: issue.html_url,
      createdAt: new Date(issue.created_at),
      closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    }));
  } catch (e) {
    console.log("Error fetching issues:", e);
    return [];
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

/**
 * Creates a new branch from the repository's default branch.
 */
async function createBranch(owner: string, repo: string): Promise<string> {
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const baseSha = refData.object.sha;

  const timestamp = new Date()
    .toISOString()
    .replace("T", "-")
    .split(":")
    .slice(0, 2)
    .join("-");
  const newBranch = `report-${timestamp}`;

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranch}`,
    sha: baseSha,
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
  });

  return newBranch;
}

/**
 * Commits the markdown report to the new branch.
 */
async function uploadMarkdown(
  owner: string,
  repo: string,
  branch: string,
  filename: string,
  content: string,
  commitMessage: string,
): Promise<string> {
  const pathInRepo = `report/${filename}`;
  const encoded = Buffer.from(content).toString("base64");

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: pathInRepo,
    message: commitMessage,
    content: encoded,
    branch,
  });

  return `https://github.com/${owner}/${repo}/blob/${branch}/${pathInRepo}`;
}

/**
 * Uploads images and returns a mapping of local paths to Markdown-relative paths.
 */
async function uploadImages(
  owner: string,
  repo: string,
  branch: string,
  images: Awaited<ReturnType<typeof loadImages>>,
  commitMessage: string,
): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {};

  for (const { originalPath, base64, uniqueName } of images) {
    const repoPath = `report/images/${uniqueName}`;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: repoPath,
      message: `${commitMessage}: ${uniqueName}`,
      content: base64,
      branch,
    });

    mapping[originalPath] = `./images/${uniqueName}`;
  }
  return mapping;
}

export async function uploadReportToRepository(
  owner: string,
  repo: string,
  content: string,
  filename: string,
  images: string[],
  commitMessage = "Add Git Workflow Analysis Report",
): Promise<UploadResult> {
  try {
    const branch = await createBranch(owner, repo);

    const loaded = await loadImages(images);
    const replacements = await uploadImages(
      owner,
      repo,
      branch,
      loaded,
      commitMessage,
    );

    const updatedContent = transformLocalImagePaths(content, replacements);
    const url = await uploadMarkdown(
      owner,
      repo,
      branch,
      filename,
      updatedContent,
      commitMessage,
    );

    return { success: true, url, branch };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Reads image files and returns their base64 content and unique names.
 */
async function loadImages(
  imagePaths: string[],
): Promise<
  Array<{ originalPath: string; base64: string; uniqueName: string }>
> {
  const results: Array<{
    originalPath: string;
    base64: string;
    uniqueName: string;
  }> = [];

  for (const localPath of imagePaths) {
    // strip leading slash: "/charts/foo.png" → "charts/foo.png"
    const relative = localPath.startsWith("/") ? localPath.slice(1) : localPath;

    // point at the Next.js public folder
    const absPath = path.resolve(process.cwd(), "public", relative);

    // read & encode
    const buffer = await fs.readFile(absPath);
    const base64 = buffer.toString("base64");

    // generate a unique name for the repo
    const ext = path.extname(localPath) || ".png";
    const base = path.basename(localPath, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;

    results.push({ originalPath: localPath, base64, uniqueName });
  }

  return results;
}
