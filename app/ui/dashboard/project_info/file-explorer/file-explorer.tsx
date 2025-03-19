"use client";

import { useState } from "react";
import { FileTreeNode } from "./file-tree-node";
import { FileIcon } from "./file-icon";

import { AlertTriangle, HelpCircle, Lock, Search } from "lucide-react";
import {
  buildFileTree,
  sortFileTree,
} from "@/app/ui/dashboard/project_info/file-explorer/file-utils";
import { FileSummary } from "@/app/ui/dashboard/project_info/file-explorer/file-summary";

type FileNode = {
  id: string;
  name: string;
  path: string;
  extension?: string;
  children: Record<string, FileNode>;
  isDirectory: boolean;
};

type RepoFile = {
  id: string;
  path: string;
  extension: string;
};

export function FileExplorer({
  files,
  repoName,
}: {
  files: RepoFile[];
  repoName: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Build and sort the file tree
  const fileTree = sortFileTree(buildFileTree(files));

  // Filter files based on search query
  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.path.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : files;

  const filteredTree = searchQuery
    ? sortFileTree(buildFileTree(filteredFiles))
    : fileTree;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* File Explorer Panel */}
        <div className="w-full lg:w-2/3 border rounded-md shadow-sm flex flex-col relative">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Repository: {repoName}</h3>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle file legend"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>

            {showLegend && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                <h4 className="font-medium mb-2">File Legend:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-red-700 dark:text-red-400">
                      Sensitive files (.env, credentials)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-amber-700 dark:text-amber-400">
                      Warning files (node_modules, .idea)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-8 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable File Tree */}
          <div className="max-h-[500px] overflow-auto p-2 flex-grow">
            <div className="border rounded-md">
              {Object.values(filteredTree.children).length > 0 ? (
                Object.values(filteredTree.children).map((node) => (
                  <FileTreeNode
                    key={node.id}
                    node={node}
                    onSelectFile={setSelectedFile}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery
                    ? "No files match your search"
                    : "No files found in repository"}
                </div>
              )}
            </div>
          </div>

          {/* Selected File Info - Sticky at Bottom */}
          {selectedFile && (
            <div className="sticky bottom-0 p-3 border-t bg-gray-50 dark:bg-gray-800 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <FileIcon
                  path={selectedFile.path}
                  extension={selectedFile.extension}
                  isDirectory={selectedFile.isDirectory}
                />
                <h3 className="font-medium">Selected File</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Path:
                </span>{" "}
                {selectedFile.path}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Type:
                </span>{" "}
                {selectedFile.extension || "Directory"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  ID:
                </span>{" "}
                {selectedFile.id}
              </p>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="w-full lg:w-1/3">
          <FileSummary files={files} />
        </div>
      </div>
    </div>
  );
}
