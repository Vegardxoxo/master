import {fetchPullRequests} from "@/app/lib/data/data";
import PullRequestsReviews from "@/app/ui/dashboard/pull_requests/pull-requests-reviews";

export default async function PullRequestsReviewsWrapper({owner, repo}: { owner: string, repo: string }) {
    const data = await fetchPullRequests(owner, repo, "all");
    return <PullRequestsReviews data={data}/>
}