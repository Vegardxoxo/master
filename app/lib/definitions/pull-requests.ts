export interface GitHubIssue {
    id?: string;
    title: string;
    number: number;
    url: string;
    createdAt: Date;
    closedAt?: Date | null;
}
