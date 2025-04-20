import {prisma} from "@/app/lib/prisma";
import {Repository} from "@/app/lib/definitions/definitions";

export async function findRepositoryByGithubId(githubId: string) {
    try {
        const repository = await prisma.repository.findFirst({
            where: { githubId },
        });
        return repository;
    } catch (e) {
        return {
            error: "Database error: Failed to fetch repository.",
            repository: null,
        };
    }
}

export async function findRepositoryByOwnerRepo(
    owner: string,
    repo: string,
): Promise<{
    success: boolean;
    error?: string;
    repository: Repository | null;
}> {
    try {
        const repository = await prisma.repository.findFirst({
            where: {
                username: owner,
                repoName: repo,
            },
        });

        if (!repository) {
            return {
                success: false,
                error: "Repository not found or you don't have access to it.",
                repository: null,
            };
        }

        return {
            success: true,
            repository: repository as Repository,
        };
    } catch (e) {
        console.error("Database error: Error fetching repository:", e);
        return {
            success: false,
            error: "Database error: Error fetching repository",
            repository: null,
        };
    }
}
