import { Octokit } from "octokit";
import { _Branches, repositoryOverview } from "@/app/lib/definitions";
import { formatTimestamp } from "@/app/lib/utils";

const octokit = new Octokit({
  auth: process.env.TOKEN,
  baseUrl: "https://git.ntnu.no/api/v3",
});

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

export async function fetchRepoDetails(owner: string, repo: string) {
  try {
    const { data: repoData } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
      },
    );

    const { data: contributorsData } = await octokit.request(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner,
        repo,
      },
    );

    // 3) Open issues
    const { data: issuesData } = await octokit.request(
      "GET /repos/{owner}/{repo}/issues",
      {
        owner,
        repo,
        state: "all",
      },
    );

    const { data: branchesData } = await octokit.request(
      "GET /repos/{owner}/{repo}/branches",
      {
        owner,
        repo,
      },
    );

    // 4) Languages breakdown
    const { data: languagesData } = await octokit.request(
      "GET /repos/{owner}/{repo}/languages",
      {
        owner,
        repo,
      },
    );

    let readmeContent = null;
    try {
      const { data: readmeData } = await octokit.request(
        "GET /repos/{owner}/{repo}/readme",
        {
          owner,
          repo,
          mediaType: {
            format: "raw",
          },
        },
      );

      readmeContent = readmeData;
    } catch (e) {
      console.warn("No README found or error fetching README:", e);
    }

    return {
      name: repoData.name,
      description: repoData.description,
      license: repoData.license?.spdx_id,
      topics: repoData.topics,
      branches: branchesData,

      // Stats
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count, // some repos have watchers_count = stargazers_count
      openIssuesCount: repoData.open_issues_count, // also includes PRs if not separated

      // Detailed calls
      contributors: contributorsData.map((c: any) => c.login),
      openIssues: issuesData.length, // or just issuesData if you want the full array
      languages: languagesData, // object of { "JavaScript": 12345, "CSS": 6789, ... }
      readme: readmeContent, // raw Markdown or decoded text
      updatedAt: repoData.updated_at,
    };
  } catch (err) {
    console.error("Error fetching repo details:", err);
    throw new Error("Failed to fetch repository details.");
  }
}

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
