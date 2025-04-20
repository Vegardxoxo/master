"use server";
import {Octokit} from "octokit";
import {promises as fs} from "fs";
import * as path from "path";
import {
  Commit,
  CommitData,
  CommitMessageLong,
  PullRequestData,
  repositoryOverview,
} from "@/app/lib/definitions/definitions";
import {parseCommitStats, parsePullRequests, transformLocalImagePaths,} from "@/app/lib/utils/utils";
import {cache} from "react";
import {getCommitsOnMain} from "@/app/lib/data/graphql-queries";
import {CommitStats} from "@/app/lib/definitions/commits";
import {GitHubIssue} from "@/app/lib/definitions/pull-requests";

/**
 * Fetches the languages used in a repository and their byte counts
 * @param owner - The owner of the repository
 * @param repo - The name of the repository
 * @returns An object mapping language names to byte counts
 */
export async function getRepoLanguages(
  owner: string,
  repo: string
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

//const octokit = new Octokit({
 // auth: process.env.TOKEN,
  //baseUrl: "https://git.ntnu.no/api/v3",
//});

 const octokit = new Octokit({
   auth: process.env.SUPER_TOKEN,
 });

/**
 * Checks if there is a connection to the repo before displaying the rest of the dashboard.
 * @param owner
 * @param repo
 */
export async function checkConnection(
  owner: string,
  repo: string,
): Promise<boolean> {
  try {
    await octokit.rest.repos.get({
      owner,
      repo,
    });
    return true;
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

    // Return false instead of throwing an error
    return false;
  }
}

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
        url: c.html_url
      })),
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

interface GithubRepoOverview {
  id?: string;
  name?: string;
  url?: string;
  openIssues?: string;
  updatedAt?: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  success: boolean;
  error?: string;
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

    // Filtrerer ut pull requests ved å sjekke om issue har pull_request property
    const realIssues = issues.filter(issue => !issue.pull_request);

    return realIssues.map((issue) => ({
      title: issue.title,
      number: issue.number,
      url: issue.html_url,
      createdAt: new Date(issue.created_at),
      closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    }));
  } catch (e) {
    console.log("Error fetching issues:", e);
    return [];  // Returnerer tom array ved feil istedenfor feilobjekt
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
      const absoluteLocalPath = path.resolve(
        process.cwd(),
        normalizedLocalPath,
      );
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
