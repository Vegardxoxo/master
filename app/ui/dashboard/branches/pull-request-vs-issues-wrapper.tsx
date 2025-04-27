import PullRequestVsIssues from "@/app/ui/dashboard/branches/pull-request-vs-issues";
import {GitHubIssue} from "@/app/lib/definitions/pull-requests";
import {getIssues, getPullRequests} from "@/app/lib/database-functions/repository-data";

export default async function PullRequestVsIssuesWrapper({owner, repo}: {owner: string, repo: string}) {
    const {data, success} = await getPullRequests(owner, repo);
    const {issues} = await getIssues(owner, repo);
    const prs = (data && Array.isArray(data.pullRequests)) ? data.pullRequests : [];
    return (
        <PullRequestVsIssues prs={prs} issues={issues}/>
    )
}
