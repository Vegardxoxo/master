// utility functions
import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import Papa from "papaparse";
import {
    AuthorFrequency,
    CommitEval,
    CommitMessageLong,
    DayEntry,
    LLMResponse, MappedCommitMessage,
    ParseCommitDataResult,
} from "@/app/lib/definitions";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseCSV(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            complete: (results) => {
                const names = results.data
                    .flat()
                    .filter(
                        (name): name is string =>
                            typeof name === "string" && name.trim() !== "",
                    );
                resolve(names);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}`;
}

function parseCoAuthorLine(line: string): { name: string; email: string } {
    const clean = line.replace("Co-authored-by:", "").trim();
    const match = clean.match(/^(.*?)<(.*?)>$/);
    if (!match) {
        return {name: clean, email: "unknown@invalid.com"};
    }
    const name = match[1].trim();
    const email = match[2].trim().toLowerCase();
    return {name, email};
}

export function parseCommitData(commitData: any[]): ParseCommitDataResult {
    const dayMap: Record<string, AuthorFrequency> = {};
    const dayTotals: Record<string, number> = {};
    const emailToDisplayName: Record<string, string> = {};
    const allEmails = new Set<string>();
    const commitSummary = [];

    for (const item of commitData) {
        const authorName = item.commit.author.name ?? "unknown";
        const authorEmail = item.commit.author.email ?? "unknown";
        const commitDate = item.commit.author.date;
        const message = item.commit.message;
        const url = item.commit.url;
        commitSummary.push({url, commit_message: message});

        emailToDisplayName[authorEmail] = authorName;
        const day = new Date(commitDate).toISOString().split("T")[0];

        // --- MAIN-AUTHOR ---
        // if the datastructures have not been initialized
        if (!dayMap[day]) dayMap[day] = {};
        if (!dayTotals[day]) dayTotals[day] = 0;

        if (!dayMap[day][authorEmail]) {
            dayMap[day][authorEmail] = 0;
        }
        dayMap[day][authorEmail]++;
        dayTotals[day]++;

        // --- CO-AUTHORS ---
        const lines = message.split("\n");
        const coAuthorLines = lines.filter((line: string) =>
            line.trim().startsWith("Co-authored-by:"),
        );

        for (const line of coAuthorLines) {
            const {email, name} = parseCoAuthorLine(line);
            emailToDisplayName[email] = name;
            if (!dayMap[day][email]) {
                dayMap[day][email] = 0;
            }
            dayMap[day][email]++;
        }

        allEmails.add(authorEmail);
        for (const line of coAuthorLines) {
            const {email} = parseCoAuthorLine(line);
            allEmails.add(email);
        }
    }

    // Sum the total number of commits for the given day
    allEmails.add("TOTAL@commits");
    for (const day of Object.keys(dayMap)) {
        dayMap[day]["TOTAL@commits"] = dayTotals[day] ?? 0;
        emailToDisplayName["TOTAL@commits"] = "Total";
    }

    const dayEntries: DayEntry[] = Object.entries(dayMap)
        .map(([day, authorsMap]) => ({
            day,
            ...authorsMap,
        }))
        .sort((a, b) => a.day.localeCompare(b.day));

    // total count for all days
    let total = 0;
    for (const day of dayEntries) {
        total += day["TOTAL@commits"] as number;
    }

    return {
        dayEntries,
        total,
        emailToDisplayName,
        commitSummary,
    };
}



function fixBracketedWords(jsonText: string): string {
    return jsonText.replace(
        // Find patterns like : [Fix]
        /(\:\s*)\[([^\]]+)\]/g,
        (full, prefix, bracketContent) => {
            // Convert e.g. : [Fix] into : "[Fix]"
            return `${prefix}"[${bracketContent}]"`;
        },
    );
}

export function parseModelResponse(response: any): CommitEval[] | null {
    try {
        const content: string = response.choices[0].message.content;
        const arrayRegex = /\[\s*[\s\S]*?\]/m;
        let match = content.match(arrayRegex);

        if (match) {
            let jsonSnippet = fixBracketedWords(match[0].trim());
            try {
                const parsed = JSON.parse(jsonSnippet);
                if (Array.isArray(parsed)) {
                    return parsed as CommitEval[];
                } else {
                    console.error(
                        "Parsed JSON is not an array (from bracketed content).",
                    );
                }
            } catch (err) {
                console.error("Failed to parse bracketed JSON array:", err);
            }
        }

        const objectRegex = /(\{\s*[\s\S]*?\})(?=\s*(\{|\s*$))/g;
        const objectMatches = content.match(objectRegex);
        if (objectMatches) {
            const results: CommitEval[] = [];

            for (const objStr of objectMatches) {
                const fixedObjStr = fixBracketedWords(objStr);
                try {
                    const parsedObject = JSON.parse(fixedObjStr);
                    results.push(parsedObject);
                } catch (err) {
                    console.error("Failed to parse one object:\n", objStr, err);
                }
            }

            if (results.length > 0) {
                return results;
            }
        }

        console.error("No valid JSON array or objects could be parsed.");
        return null;
    } catch (err) {
        console.error("Failed to parse JSON from model response:", err);
        return null;
    }
}

/**
 * Removes things like ["DOCS"] from the commit messages as this makes it hard to parse as JSON objects.
 * @param commits
 */
export function preprocessCommit(commits: CommitMessageLong[]): CommitMessageLong[] {
    return commits.map((commit) => {
        const newCommit = {...commit};
        newCommit.commit_message = newCommit.commit_message.replace(
            /\[([^\]]+)\]/g,
            "($1)",
        );
        newCommit.commit_message = newCommit.commit_message.trim();
        newCommit.url = newCommit.url.replace(/\r?\n/g, " ").trim();
        newCommit.commit_message = newCommit.commit_message.replace(
            /\[([^\]]+)\]/g,
            "($1)",
        );

        return newCommit;
    });
}



export function createUrlMap(commits: CommitMessageLong[]): {
    mappedCommits: MappedCommitMessage[];
    urlMap: Record<string, string>;
} {
    const urlMap: Record<string, string> = {};
    const mappedCommits: MappedCommitMessage[] = commits.map((item, index) => {
        const idx = String(index);
        urlMap[idx] = item.url;
        return {
            id: idx,
            commit_message: item.commit_message,
        };
    });
    return {mappedCommits, urlMap};
}

export function mapIdToUrl(
    reponse: CommitEval[],
    urlMap: Record<string, string>,
): LLMResponse[] {
    return reponse.map((obj) => {
        return {
            url: urlMap[obj.id] || "UNKNOWN_URL",
            commit_message: obj.commit_message,
            category: obj.category,
            reason: obj.reason,
        };
    });
}

