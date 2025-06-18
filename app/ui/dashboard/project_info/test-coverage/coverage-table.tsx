"use client";

import { useEffect } from "react";
import type { FileCoverageData } from "@/app/lib/definitions/definitions";
import { useReport } from "@/app/contexts/report-context";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { coverageTableColumns } from "@/app/ui/courses/columns";

export function FileCoverageTable({
  fileData,
}: {
  fileData: FileCoverageData[];
}) {
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
        <GenericDataTable data={fileData} columns={coverageTableColumns} />
      </div>
    </div>
  );
}
