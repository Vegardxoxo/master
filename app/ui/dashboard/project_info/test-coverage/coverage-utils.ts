export function getCoverageColor(percentage: number): string {
  if (percentage >= 90) {
    return "bg-green-500";
  } else if (percentage >= 75) {
    return "bg-yellow-500";
  } else if (percentage >= 50) {
    return "bg-orange-500";
  } else {
    return "bg-red-500";
  }
}

export function getCoverageTextColor(percentage: number): string {
  if (percentage >= 90) {
    return "text-green-700";
  } else if (percentage >= 75) {
    return "text-yellow-700";
  } else if (percentage >= 50) {
    return "text-orange-700";
  } else {
    return "text-red-700";
  }
}

export function getShortFilePath(filePath: string): string {
  // Extract just the file name and its parent directory
  const parts = filePath.split("/");
  if (parts.length <= 1) return filePath;

  // Find the index of 'app' directory if it exists
  const appIndex = parts.findIndex((part) => part === "app");

  if (appIndex !== -1) {
    // Return the path starting from 'app'
    return parts.slice(appIndex).join("/");
  } else {
    // If 'app' not found, return the last 3 parts of the path
    return parts.slice(Math.max(0, parts.length - 3)).join("/");
  }
}
