export interface GitHubIssue {
    error?: string;
    title: string;
    number: number;
    url: string;
    createdAt: Date;
    closedAt?: Date | null;
}