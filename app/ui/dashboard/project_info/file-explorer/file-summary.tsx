import { AlertTriangle, Lock } from "lucide-react";
import { isSensitiveFile, isWarningFile } from "./file-icon";
import { useReport } from "@/app/contexts/report-context";
import { useEffect } from "react";

type RepoFile = {
  id: string;
  path: string;
  extension: string;
};

export function FileSummary({ files }: { files: RepoFile[] }) {
  const { addMetricData } = useReport();
  const sensitiveFiles = files.filter((file) => isSensitiveFile(file.path));
  const warningFiles = files.filter((file) => isWarningFile(file.path));

  useEffect(() => {
    addMetricData(
      "sensitiveFiles",
      [sensitiveFiles, warningFiles],
      warningFiles,
    );
  }, [files]);

  return (
    <div className="border rounded-md shadow-sm h-full">
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-medium">Repository Summary</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center">
            <Lock className="h-4 w-4 text-red-500 mr-2" />
            Sensitive Files
          </h4>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
            {sensitiveFiles.length}
          </span>
        </div>

        {sensitiveFiles.length > 0 ? (
          <ul className="mb-6 text-sm space-y-1 max-h-[200px] overflow-y-auto">
            {sensitiveFiles.map((file) => (
              <li
                key={file.id}
                className="text-red-700 dark:text-red-400 truncate pl-6"
              >
                {file.path}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-6 pl-6">
            No sensitive files detected
          </p>
        )}

        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            Warning Files
          </h4>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-amber-900 dark:text-amber-300">
            {warningFiles.length}
          </span>
        </div>

        {warningFiles.length > 0 ? (
          <ul className="text-sm space-y-1 max-h-[200px] overflow-y-auto">
            {warningFiles.map((file) => (
              <li
                key={file.id}
                className="text-amber-700 dark:text-amber-400 truncate pl-6"
              >
                {file.path}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 pl-6">
            No warning files detected
          </p>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-500">
          <p className="mb-1">
            <strong>Total Files:</strong> {files.length}
          </p>
          <p>
            <strong>Clean Files:</strong>{" "}
            {files.length - sensitiveFiles.length - warningFiles.length}
          </p>
        </div>
      </div>
    </div>
  );
}
