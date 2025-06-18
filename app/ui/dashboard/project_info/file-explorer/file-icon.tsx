import {
  AlertTriangle,
  Database,
  File,
  FileCode,
  FileImage,
  FileJson,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  Lock,
} from "lucide-react";

const sensitivePatterns = [
  /\.env($|\.)/i,
  /password/i,
  /secret/i,
  /credential/i,
  /\.key$/i,
  /database\.([^.]+)$/i,
  /\.sqlite$/i,
  /\.db$/i,
];

const warningPatterns = [
  /node_modules/i,
  /.idea/i,
  /\.idea\//i,
  /\.vscode\//i,
  /\.vs\//i,
];

export function isSensitiveFile(path: string): boolean {
  return sensitivePatterns.some((pattern) => pattern.test(path));
}

export function isWarningFile(path: string): boolean {
  return warningPatterns.some((pattern) => pattern.test(path));
}

export function FileIcon({
  path,
  extension,
  isDirectory,
  isOpen = false,
}: {
  path: string;
  extension?: string;
  isDirectory: boolean;
  isOpen?: boolean;
}) {
  // Check if this is a sensitive or warning file
  const isSensitive = isSensitiveFile(path);
  const isWarning = isWarningFile(path);

  // Determine the color class based on file type
  const colorClass = isSensitive
    ? "text-red-500"
    : isWarning
      ? "text-amber-500"
      : "";

  if (isDirectory) {
    if (isWarning) {
      return isOpen ? (
        <FolderOpen className={`h-4 w-4 ${colorClass}`} />
      ) : (
        <Folder className={`h-4 w-4 ${colorClass}`} />
      );
    }
    return isOpen ? (
      <FolderOpen className="h-4 w-4 text-yellow-500" />
    ) : (
      <Folder className="h-4 w-4 text-yellow-500" />
    );
  }

  // Special icons for sensitive files
  if (isSensitive) {
    if (
      path.includes("database") ||
      extension === "db" ||
      extension === "sqlite"
    ) {
      return <Database className="h-4 w-4 text-red-500" />;
    }
    return <Lock className="h-4 w-4 text-red-500" />;
  }

  // Special icons for warning files
  if (isWarning) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }

  // Regular file icons
  switch (extension) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return <FileCode className="h-4 w-4 text-blue-500" />;
    case "json":
      return <FileJson className="h-4 w-4 text-green-500" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "ico":
      return <FileImage className="h-4 w-4 text-purple-500" />;
    case "md":
      return <FileText className="h-4 w-4 text-gray-500" />;
    case "css":
    case "scss":
      return <FileType className="h-4 w-4 text-pink-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
}
