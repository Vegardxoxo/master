import {Octokit} from "octokit";


const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});


export async function fetchRepoOverview(owner: string, repo: string) {
    try {
        const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
            owner,
            repo,
        })

        const contributorsRes = await octokit.request(
            "GET /repos/{owner}/{repo}/contributors",
            {
                owner,
                repo,
            }
        )

        const issuesRes = await octokit.request("GET /repos/{owner}/{repo}/issues", {
            owner,
            repo,
            state: "open",
        })

        return {
            name: repoInfo.data.name,
            contributors: contributorsRes.data.map((c) => c.login),
            openIssues: issuesRes.data.length, // or issuesRes.data if you need details
        }
    } catch (err) {
        console.error("Error fetching repo data via REST:", err)
        throw new Error("Failed to fetch repository overview.")
    }


}

export async function fetchRepoDetails(owner: string, repo: string) {
    try {
        const {data: repoData} = await octokit.request("GET /repos/{owner}/{repo}", {
            owner,
            repo,
        });

        const {data: contributorsData} = await octokit.request(
            "GET /repos/{owner}/{repo}/contributors",
            {
                owner,
                repo,
            });


        // 3) Open issues
        const {data: issuesData} = await octokit.request("GET /repos/{owner}/{repo}/issues", {
            owner,
            repo,
            state: "all",
        });

        // 4) Languages breakdown
        const {data: languagesData} = await octokit.request(
            "GET /repos/{owner}/{repo}/languages",
            {
                owner,
                repo,
            });


        // 5) README (Base64-encoded by default, so we need to decode)
        // If some repos don't have a README, this call can fail with 404. You can wrap it in try/catch.
        let readmeContent = null
        try {
            const {data: readmeData} = await octokit.request("GET /repos/{owner}/{repo}/readme", {
                owner,
                repo,
                mediaType: {
                    format: "raw",
                },
            });
            // readmeData might be the raw text if you specify "raw" media type,
            // or base64-encoded if you use the default. For base64, you need:
            // import { Buffer } from "buffer";
            // readmeContent = Buffer.from(readmeData.content, "base64").toString("utf8");

            // If you used `format: "raw"`, you already get plain text/Markdown:
            readmeContent = readmeData
        } catch (e) {
            // If the repo has no README, we skip
            console.warn("No README found or error fetching README:", e)
        }

        return {
            name: repoData.name,
            description: repoData.description,
            license: repoData.license?.spdx_id, // e.g. "MIT"
            topics: repoData.topics, // array of topics

            // Stats
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            watchers: repoData.watchers_count, // some repos have watchers_count = stargazers_count
            openIssuesCount: repoData.open_issues_count, // also includes PRs if not separated

            // Detailed calls
            contributors: contributorsData.map((c: any) => c.login),
            openIssues: issuesData.length, // or just issuesData if you want the full array
            languages: languagesData, // object of { "JavaScript": 12345, "CSS": 6789, ... }
            readme: readmeContent,    // raw Markdown or decoded text
            updatedAt: repoData.updated_at,
        }
    } catch (err) {
        console.error("Error fetching repo details:", err)
        throw new Error("Failed to fetch repository details.")
    }
}