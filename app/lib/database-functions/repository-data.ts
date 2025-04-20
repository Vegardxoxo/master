import fetchMilestones, {
    fetchAllCommits,
    fetchContributors, fetchPullRequests,
    getRepoLanguages
} from "@/app/lib/data/github-api-functions";
import {prisma} from "@/app/lib/prisma";
import {findRepositoryByOwnerRepo} from "@/app/lib/database-functions/helper-functions";
import {formatLanguageData} from "@/app/lib/utils/language-distribution-utils";

export async function storeLanguageDistribution(owner: string, repo: string, repoId: string) {
    try {
        const rawData = await getRepoLanguages(owner, repo);
        const formattedData = formatLanguageData(rawData, 10);

        const operations = formattedData.map((lang: { name: string; value: number; percentage: number }) =>
            prisma.languageDistribution.upsert({
                where: {
                    repositoryId_name: {
                        repositoryId: repoId,
                        name: lang.name
                    }
                },
                update: {
                    value: lang.value,
                    percentage: lang.percentage
                },
                create: {
                    repositoryId: repoId,
                    name: lang.name,
                    value: lang.value,
                    percentage: lang.percentage
                }
            })
        );

        await prisma.$transaction(operations);

        return { success: true };
    } catch (e) {
        console.error("Error fetching language distribution:", e);
        return { success: false, error: "Failed to fetch language distribution." };
    }
}

export async function getLanguageDistribution(owner: string, repo: string): Promise<{success: boolean; languages: any | undefined; error?: string;}> {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);

        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }

        const languages = await prisma.languageDistribution.findMany({
            where: {
                repositoryId: result.repository.id,
            },
            select: {
                name: true,
                value: true,
                percentage: true,
            },
            orderBy: {
                value: 'desc',
            },
        });

        console.log("fetched from local database", languages);
        return { success: true, languages };
    } catch (e) {
        console.error("Error fetching language distribution:", e);
        return { success: false, languages: undefined,  error: "Failed to fetch language distribution." };
    }
}


export async function storeContributors(owner: string, repo: string, repoId: string) {
    try {
        const {contributors} = await fetchContributors(owner, repo);
        const operation = contributors.map((contributor: { login: string, url: string }) => (
            prisma.contributor.upsert({
                where: {
                    login_repositoryId: {
                        login: contributor.login,
                        repositoryId: repoId,
                    },
                },
                update: { url: contributor.url },
                create: {
                    login: contributor.login,
                    url: contributor.url,
                    repositoryId: repoId,
                },
            })
        ));

        await prisma.$transaction(operation);
        return { success: true, contributors };

    } catch (e) {
        console.error("Error storing contributors:", e);
        return { success: false, error: "Failed to store contributors." };
    }
}

export async function getContributors(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);

        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }

        const contributors = await prisma.contributor.findMany({
            where: {
                repositoryId: result.repository.id,
            },
            select: {
                login: true,
                url: true,
            },
        });
        console.log("fetched from local database", contributors)
        return { success: true, contributors };
    } catch (e) {
        console.error("Error fetching contributors:", e);
        return { success: false, error: "Failed to fetch contributors." };
    }
}

export async function updateRepositoryData(owner: string, repo: string, repoId: string) {
    try {
        await Promise.all([
            storeContributors(owner, repo, repoId),
            storeLanguageDistribution(owner, repo, repoId),
            storeMilestones(owner, repo, repoId),
            storeCommits(owner, repo, repoId),
            storePullRequests(owner, repo, repoId)
        ]);
        return {success: true};
    } catch (e) {
        console.error("Error updating repository data:", e);
        return {success: false, error: "Failed to update repository data."};
    }
}


export async function getRepoInfo(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);

        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }

        const { stars, openIssues, forks, watchers, repoName, updatedAt } = result.repository;

        return {
            success: true,
            info: {
                updatedAt,
                stars,
                openIssues,
                forks,
                watchers,
                name: repoName,
            }
        };
    } catch (e) {
        console.error("Error fetching repository info:", e);
        return { success: false, error: "Failed to fetch repository info." };
    }
}

export async function storeMilestones(owner: string, repo: string, repoId: string) {

    try {
        const milestones = await fetchMilestones(owner, repo);
        const operations = milestones.map((m: any) =>
            prisma.milestone.upsert({
                where: {
                    repositoryId_githubId: {
                        repositoryId: repoId,
                        githubId: m.id,
                    }
                },
                update: {
                    title: m.title,
                    description: m.description,
                    state: m.state,
                    closedIssues: m.closedIssues,
                    openIssues: m.openIssues,
                    totalIssues: m.totalIssues,
                    dueDate: m.dueDate ? new Date(m.dueDate) : null,
                    createdAt: new Date(m.createdAt),
                    updatedAt: new Date(m.updatedAt),
                    url: m.url,
                },
                create: {
                    repositoryId: repoId,
                    githubId: m.id,
                    title: m.title,
                    description: m.description,
                    state: m.state,
                    closedIssues: m.closedIssues,
                    openIssues: m.openIssues,
                    totalIssues: m.totalIssues,
                    dueDate: m.dueDate ? new Date(m.dueDate) : null,
                    createdAt: new Date(m.createdAt),
                    updatedAt: new Date(m.updatedAt),
                    url: m.url,
                },
            })
        );
        await prisma.$transaction(operations);
        return { success: true };
    } catch (e) {
        console.error("Error storing milestones:", e);
        return { success: false, error: "Failed to store milestones." };
    }
}

export async function getMilestones(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;
        const milestones = await prisma.milestone.findMany({
            where: { repositoryId: repoId },
            orderBy: { dueDate: 'asc' },
            select: {
                githubId: true,
                title: true,
                description: true,
                state: true,
                closedIssues: true,
                openIssues: true,
                totalIssues: true,
                dueDate: true,
                createdAt: true,
                updatedAt: true,
                url: true,
            }
        });
        return { success: true, milestones };
    } catch (e) {
        console.error("Error fetching milestones:", e);
        return { success: false, milestones: undefined, error: "Failed to fetch milestones." };
    }
}

export async function storeCommits(owner: string, repo: string, repoId: string) {
    try {
        const commits = await fetchAllCommits(owner, repo);
        const operations = commits.map(commit => {
            const sha = commit.sha ?? commit.html_url?.split("/").pop() ?? "";
            return prisma.commit.upsert({
                where: { sha },
                update: {
                    authorName: commit.commit.author.name,
                    authorEmail: commit.commit.author.email,
                    committedAt: commit.commit.author.date
                        ? new Date(commit.commit.author.date)
                        : undefined,
                    message: commit.commit.message,
                    url: commit.html_url ?? commit.commit.url,
                    additions: commit.additions,
                    deletions: commit.deletions,
                    changedFiles: commit.changedFiles,
                    repositoryId: repoId,
                },
                create: {
                    sha,
                    authorName: commit.commit.author.name,
                    authorEmail: commit.commit.author.email,
                    committedAt: commit.commit.author.date
                        ? new Date(commit.commit.author.date)
                        : new Date(),
                    message: commit.commit.message,
                    url: commit.html_url ?? commit.commit.url,
                    additions: commit.additions,
                    deletions: commit.deletions,
                    changedFiles: commit.changedFiles,
                    repositoryId: repoId,
                },
            });
        });



        await prisma.$transaction(operations);
    }
    catch (e) {
        console.error("Error storing commits:", e);
        return { success: false, error: "Failed to store commits." };


    }
}

export async function getCommits(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;

        console.time(`fetch-commits-${repoId}`);
        const commits = await prisma.commit.findMany({
            where: { repositoryId: repoId },
            orderBy: { committedAt: 'desc' },
        });
        console.timeEnd(`fetch-commits-${repoId}`);

        console.log("fetched from local database");
        return { success: true, commits };
    } catch (e) {
        console.error("Error fetching commits:", e);
        return { success: false, commits: undefined, error: "Failed to fetch commits." };
    }
}

export async function storePullRequests(owner: string, repo: string, repoId: string) {
    try {
        const state = "all";
        const data = await fetchPullRequests(owner, repo, state);

        await prisma.pullRequest.upsert({
            where: { repositoryId_state: { repositoryId: repoId, state } },
            update: { data },
            create: { repositoryId: repoId, state, data },
        });

        return { success: true };
    } catch (e) {
        console.error("Failed to store pull requests:", e);
        return { success: false, error: "Failed to store pull requests." };
    }
}

export async function getPullRequests(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;

        // Attempt to fetch cached pull requests from the database
        const prRecord = await prisma.pullRequest.findUnique({
            where: {
                repositoryId_state: {
                    repositoryId: repoId,
                    state: "all",
                },
            },
        });

        if (prRecord && prRecord.data) {
            return { success: true, data: prRecord.data };
        } else {
            return { success: false, error: "No pull requests found in database for this repository." };
        }
    } catch (e) {
        console.error("Failed to get pull requests:", e);
        return { success: false, error: "Failed to get pull requests." };
    }
}
