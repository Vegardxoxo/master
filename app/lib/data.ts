import { Octokit } from "octokit";
import { _Branches, repositoryOverview } from "@/app/lib/definitions";
import { formatTimestamp } from "@/app/lib/utils";

const octokit = new Octokit({
  auth: process.env.TOKEN,
  baseUrl: "https://git.ntnu.no/api/v3",
});

/**
 * Fetches an overview about the projects. Data is used to render data tables.
 * @param owner
 * @param repo
 */
export async function fetchRepoOverview(
  owner: string,
  repo: string,
): Promise<repositoryOverview> {
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
      name: repoInfo.data.name,
      contributors: contributorsRes.data
        .map((c) => c.login)
        .filter((login): login is string => !!login),
      openIssues: issuesRes.data.length,
      url: repoInfo.data.html_url,
    };
  } catch (err) {
    console.error("Error fetching repo data via REST:", err);
    throw new Error("Failed to fetch repository overview.");
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
 * @param branch - Branch name
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
    console.log(owner);
    console.log(repo);
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
    console.error("Error fetching repo details:", e);
    throw new Error("Failed to fetch repository details.");
  }
}

/**
 * Fetches general information about the repository.
 * @param owner
 * @param repo
 */
export async function fetchProjectInfo(owner: string, repo: string) {
  try {
    console.log(owner);
    console.log(repo);
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
    console.error("Error fetching repo details:", e);
    throw new Error("Failed to fetch repository details.");
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
        per_page: 20,
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
export async function fetchAllCommits(owner: string, repo: string) {
  try {
    return await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch (e) {
    console.log(e);
  }
}
