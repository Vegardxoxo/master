export interface UserSummary {
  name: string;
  pullRequests: number;
  reviews: number;
  comments: number;
  reviewPercentage: number;
  commentPercentage: number;
}

export function transformPullRequestActivityData(data: any): UserSummary[] {
  const userStats: UserSummary[] = [];

  if (!data.prsByMember) {
    return [];
  }

  // Calculate summary values first
  const summary = {
    totalPRs: data.totalPRs || 0,
    totalComments: data.totalComments || 0,
    totalReviews: data.prsWithReview || 0,
    prsWithoutReview: data.prsWithoutReview || 0,
  };

  for (const userName in data.prsByMember) {
    const userInfo = data.prsByMember[userName];
    const reviews = data.reviewsByMember?.[userName]?.count || 0;
    const comments = data.commentsByMembers?.[userName] || 0;

    userStats.push({
      name: userName,
      pullRequests: userInfo.count || 0,
      reviews: reviews,
      comments: comments,
      reviewPercentage:
        summary.totalReviews > 0
          ? Math.round((reviews / summary.totalReviews) * 100)
          : 0,
      commentPercentage:
        summary.totalComments > 0
          ? Math.round((comments / summary.totalComments) * 100)
          : 0,
    });
  }

  return userStats;
}
