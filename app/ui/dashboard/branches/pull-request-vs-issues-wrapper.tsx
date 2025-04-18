import {fetchIssues, fetchPullRequests} from "@/app/lib/data/github-api-functions";
import PullRequestVsIssues from "@/app/ui/dashboard/branches/pull-request-vs-issues";
import {GitHubIssue} from "@/app/lib/definitions/pull-requests";

export default async function PullRequestVsIssuesWrapper({owner, repo}: {owner: string, repo: string}) {
    const {pullRequests} = await fetchPullRequests(owner, repo, "all");
    const issues: GitHubIssue[] = await fetchIssues(owner, repo);

    return (
        <PullRequestVsIssues prs={pullRequests} issues={issues}/>
    )
}
