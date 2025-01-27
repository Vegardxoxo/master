// utility functions
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from 'papaparse';
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
