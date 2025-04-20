import fetchMilestones, {
    fetchAllCommits, fetchBranches,
    fetchContributors, fetchIssues, fetchPullRequests, fetchWorkflowRuns, getMainCommits,
    getRepoLanguages
} from "@/app/lib/data/github-api-functions";
import {prisma} from "@/app/lib/prisma";
import {findRepositoryByOwnerRepo} from "@/app/lib/database-functions/helper-functions";
import {formatLanguageData} from "@/app/lib/utils/language-distribution-utils";
import {GitHubIssue} from "@/app/lib/definitions/pull-requests";

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

        const commits = await prisma.commit.findMany({
            where: { repositoryId: repoId },
            orderBy: { committedAt: 'desc' },
        });

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

export async function storeCommitsToMain(owner: string, repo: string, repoId: string) {
    try {
        const commitsToMain = await getMainCommits(owner, repo);

        if (!commitsToMain || commitsToMain.length === 0) {
            console.log("No direct commits to store.");
            return;
        }

        const operations = commitsToMain.map((commit) =>
            prisma.commitMain.upsert({
                where: {
                    repositoryId_sha: {
                        repositoryId: repoId,
                        sha: commit.sha,
                    },
                },
                update: {
                    author: commit.author,
                    date: commit.date ? new Date(commit.date) : new Date(),
                    url: commit.url,
                    branch: commit.branch,
                    message: commit.message,
                },
                create: {
                    repositoryId: repoId,
                    sha: commit.sha,
                    author: commit.author,
                    date: commit.date ? new Date(commit.date) : new Date(),
                    url: commit.url,
                    branch: commit.branch,
                    message: commit.message,
                },
            }),
        );

        await prisma.$transaction(operations);
    } catch (error) {
        console.error("Error storing commits:", error);
        throw error;
    }
}

export async function getDirectCommits(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;

        const commits = await prisma.commitMain.findMany({
            where: { repositoryId: repoId },
            orderBy: { date: "desc" },
        });

        return { success: true, commits };
    } catch (e) {
        console.error("Error fetching commits:", e);
        return { success: false, commits: undefined, error: "Failed to fetch commits." };
    }
}

export async function storeBranches(owner: string, repo: string, repoId: string) {
    try {
        const branches = await fetchBranches(owner, repo);

        const upserts = branches.map((branch: { name: string }) =>
            prisma.branch.upsert({
                where: {
                    repositoryId_name: {
                        repositoryId: repoId,
                        name: branch.name,
                    },
                },
                update: {
                    updatedAt: new Date(),
                },
                create: {
                    repositoryId: repoId,
                    name: branch.name,
                },
            })
        );

        // Execute all upserts atomically
        await prisma.$transaction(upserts);

        return { success: true };
    } catch (e) {
        console.error("Failed to store branches in a transaction:", e);
        throw e;
    }
}

export async function getBranches(owner: string, repo: string) {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;

        const branches = await prisma.branch.findMany({
            where: { repositoryId: repoId },
            orderBy: { name: "asc" },
        });

        return { success: true, branches };
    } catch (e) {
        console.error("Error fetching branches:", e);
        return { success: false, error: "Internal server error" };
    }
}

export async function storeIssues(owner: string, repo: string, repoId: string) {
    try {
        const issues = await fetchIssues(owner, repo);

        if (!issues.length) {
            return { success: true, message: "No issues to store." };
        }

        const operations = issues.map((issue: GitHubIssue) =>
            prisma.issue.upsert({
                where: {
                    repositoryId_number: {
                        repositoryId: repoId,
                        number: issue.number.toString(),
                    },
                },
                update: {
                    title: issue.title,
                    url: issue.url,
                    closedAt: issue.closedAt ?? null,
                    updatedAt: new Date(),
                },
                create: {
                    repositoryId: repoId,
                    number: issue.number.toString(),
                    title: issue.title,
                    url: issue.url,
                    createdAt: issue.createdAt,
                    closedAt: issue.closedAt ?? null,
                    updatedAt: new Date(),
                },
            })
        );


        await prisma.$transaction(operations);

        return { success: true };
    } catch (e) {
        console.error("Error storing issues:", e);
        return { success: false, error: "Internal server error" };
    }
}

export async function getIssues(owner: string, repo: string): Promise<{issues: GitHubIssue[] | undefined; success: boolean; error?: string;}> {
    try {
        const result = await findRepositoryByOwnerRepo(owner, repo);
        if (!result.success || !result.repository) {
            return { success: false, error: result.error };
        }
        const repoId = result.repository.id;

        const issues = await prisma.issue.findMany({
            where: { repositoryId: repoId },
            orderBy: { number: "asc" },
        });

        return { success: true, issues };
    } catch (e) {
        console.error("Error fetching issues:", e);
        return { success: false, error: "Internal server error", issues: undefined };
    }
}

export async function storeWorkFlowRuns(owner: string, repo: string, repoId: string) {
    try {
        const { workflow_runs } = await fetchWorkflowRuns(owner, repo);

        const upserts = workflow_runs.map(run =>
            prisma.workflowRuns.upsert({
                where: {
                    repositoryId_githubRunId: {
                        repositoryId: repoId,
                        githubRunId: run.id,
                    },
                },
                update: {
                    name: run.name,
                    status: run.status,
                    conclusion: run.conclusion,
                    created_at: new Date(run.created_at),
                    updated_at: new Date(run.updated_at),
                    run_started_at: new Date(run.run_started_at),
                    run_number: run.run_number,
                },
                create: {
                    repositoryId: repoId,
                    githubRunId: run.id,
                    name: run.name,
                    status: run.status,
                    conclusion: run.conclusion,
                    created_at: new Date(run.created_at),
                    updated_at: new Date(run.updated_at),
                    run_started_at: new Date(run.run_started_at),
                    run_number: run.run_number,
                },
            })
        );

        await prisma.$transaction(upserts);

        return { success: true };
    } catch (e) {
        console.error("Failed to store workflow runs:", e);
        throw e;
    }
}

export async function getWorkflowRuns(owner: string, repo: string) {
    const { success, repository, error } = await findRepositoryByOwnerRepo(owner, repo);
    if (!success || !repository) {
        return { workflow_runs: [], total_count: 0, error: error || "Repository not found" };
    }

    const workflow_runs = await prisma.workflowRuns.findMany({
        where: {
            repositoryId: repository.id,
        },
        orderBy: {
            run_number: "desc",
        },
    });

    return {
        workflow_runs,
        total_count: workflow_runs.length,
    };
}


export async function updateRepositoryData(owner: string, repo: string, repoId: string) {
    try {
        await Promise.all([
            storeContributors(owner, repo, repoId),
            storeLanguageDistribution(owner, repo, repoId),
            storeMilestones(owner, repo, repoId),
            storeCommits(owner, repo, repoId),
            storePullRequests(owner, repo, repoId),
            storeCommitsToMain(owner, repo, repoId),
            storeBranches(owner, repo, repoId),
            storeIssues(owner, repo, repoId),
            storeWorkFlowRuns(owner, repo, repoId),
        ]);
        return {success: true};
    } catch (e) {
        console.error("Error updating repository data:", e);
        return {success: false, error: "Failed to update repository data."};
    }
}
