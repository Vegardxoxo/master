import React from "react";
import {
  LayoutDashboard,
  GitCommit,
  GitPullRequest,
  GitBranch,
  Eye,
  EyeOff,
} from "lucide-react";

type SidebarProps = {
  onToggle: (section: string) => void;
  visibleSections: {
    overview: boolean;
    commits: boolean;
    branches: boolean;
    pullRequests: boolean;
  };
};

export function DashboardNavigation({ onToggle, visibleSections }: SidebarProps) {
  return (
    <div className="w-full rounded-xl  bg-slate-50 p-4 overflow-auto ">
      <h2 className="text-lg font-semibold mb-4  text-center text-blue-600">
        Dashboard Controls
      </h2>
      <ul>
        <li className="mb-2">
          <button
            onClick={() => onToggle("overview")}
            className="w-full flex h-[48px] grow items-center justify-between gap-2 rounded-md bg-gray-50 p-2  font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-between md:p-2 md:px-3"
          >
            <span className="flex items-center justify-between">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Repository Overview
            </span>
            {visibleSections.overview ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </li>
        <li className="mb-2">
          <button
            onClick={() => onToggle("commits")}
            className="w-full flex h-[48px] grow items-center justify-between gap-2 rounded-md bg-gray-50 p-2  font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:md:justify-between md:p-2 md:px-3"
          >
            <span className="flex items-center">
              <GitCommit className="h-4 w-4 mr-2" />
              Commit Analysis
            </span>
            {visibleSections.commits ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </li>
        <li className="mb-2">
          <button
            onClick={() => onToggle("branches")}
            className="w-full flex h-[48px] grow items-center justify-between gap-2 rounded-md bg-gray-50 p-2  font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:md:justify-between md:p-2 md:px-3"
          >
            <span className="flex items-center">
              <GitBranch className="h-4 w-4 mr-2" />
              Branching Strategy
            </span>
            {visibleSections.branches ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </li>
        <li className="mb-2">
          <button
            onClick={() => onToggle("pullRequests")}
            // className="w-full flex items-center justify-between p-2 hover:bg-gray-200 rounded"
            className="w-full flex h-[48px] grow items-center justify-between gap-2 rounded-md bg-gray-50 p-2  font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:md:justify-between md:p-2 md:px-3"
          >
            <span className="flex items-center">
              <GitPullRequest className="h-4 w-4 mr-2" />
              Pull Requests
            </span>
            {visibleSections.pullRequests ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}
