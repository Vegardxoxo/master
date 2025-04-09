"use client";

import { useEffect, useState } from "react";
import { CoverageProgressBar } from "./coverage-progress-bar";
import { ArrowUpDown, FileCode } from "lucide-react";
import {
  getCoverageTextColor,
  getShortFilePath,
} from "@/app/ui/dashboard/project_info/test-coverage/coverage-utils";
import { FileCoverageData } from "@/app/lib/definitions/definitions";
import { useReport } from "@/app/contexts/report-context";

type SortField = "filePath" | "statements" | "branches" | "functions" | "lines";
type SortDirection = "asc" | "desc";

export function FileCoverageTable({
  fileData,
}: {
  fileData: FileCoverageData[];
}) {
  const [sortField, setSortField] = useState<SortField>("filePath");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { addMetricData } = useReport();

  useEffect(() => {
    const metrics = fileData.map((file) => ({
      filePath: file.filePath,
      statements: file.statements,
      branches: file.branches,
      functions: file.functions,
      lines: file.lines,
      lastUpdated: new Date().toISOString(),
    }));
    addMetricData("fileCoverage", fileData, metrics);
  }, [fileData, addMetricData]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...fileData].sort((a, b) => {
    if (sortField === "filePath") {
      return sortDirection === "asc"
        ? a.filePath.localeCompare(b.filePath)
        : b.filePath.localeCompare(a.filePath);
    } else {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          File Coverage Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {fileData.length} files analyzed
        </p>
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("filePath")}
              >
                <div className="flex items-center">
                  File Path
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("statements")}
              >
                <div className="flex items-center">
                  Statements
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("branches")}
              >
                <div className="flex items-center">
                  Branches
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("functions")}
              >
                <div className="flex items-center">
                  Functions
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("lines")}
              >
                <div className="flex items-center">
                  Lines
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {sortedData.map((file, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileCode className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getShortFilePath(file.filePath)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getCoverageTextColor(file.statements)}`}
                  >
                    {file.statements.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getCoverageTextColor(file.branches)}`}
                  >
                    {file.branches.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getCoverageTextColor(file.functions)}`}
                  >
                    {file.functions.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-32">
                    <CoverageProgressBar
                      percentage={file.lines}
                      label=""
                      showPercentage={false}
                      height="h-2"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
