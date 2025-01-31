// utility functions
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";
import {
  AuthorFrequency,
  DayEntry,
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
    return { name: clean, email: "unknown@invalid.com" };
  }
  const name = match[1].trim();
  const email = match[2].trim().toLowerCase();
  return { name, email };
}

export function parseCommitData(commitData: any[]): ParseCommitDataResult {
  const dayMap: Record<string, AuthorFrequency> = {};
  const dayTotals: Record<string, number> = {};
  const emailToDisplayName: Record<string, string> = {};
  const allEmails = new Set<string>();

  for (const item of commitData) {
    const authorName = item.commit.author.name ?? "unknown";
    const authorEmail = item.commit.author.email ?? "unknown";
    const commitDate = item.commit.author.date;
    const message = item.commit.message;

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
      const { email, name } = parseCoAuthorLine(line);
      emailToDisplayName[email] = name;
      if (!dayMap[day][email]) {
        dayMap[day][email] = 0;
      }
      dayMap[day][email]++;
    }

    allEmails.add(authorEmail);
    for (const line of coAuthorLines) {
      const { email } = parseCoAuthorLine(line);
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
  };
}

