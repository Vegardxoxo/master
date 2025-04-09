"use client";
import { CoverageProgressBar } from "./coverage-progress-bar";
import {
  getCoverageColor,
  getCoverageTextColor,
} from "@/app/ui/dashboard/project_info/test-coverage/coverage-utils";
import { CoverageMetrics } from "@/app/lib/definitions/definitions";
import { useEffect } from "react";
import { useReport } from "@/app/contexts/report-context";

export function TestCoverageMetrics({ metrics }: { metrics: CoverageMetrics }) {
  const { statements, branches, functions, lines, overall } = metrics;
  const overallColorClass = getCoverageColor(overall);
  const overallTextColorClass = getCoverageTextColor(overall);

  const { addMetricData } = useReport();

  useEffect(() => {
    const metricsData = {
      percentage: metrics.overall,
      status: overall >= 80 ? "good" : overall >= 50 ? "info" : "warning",
      statements: metrics.statements,
      branches: metrics.branches,
      functions: metrics.functions,
      lines: metrics.lines,
      lastUpdated: new Date().toISOString(),
    };
    addMetricData("testCoverage", metrics, metricsData);
  }, [metrics]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4 w-40 h-40 flex items-center justify-center">
          {/* SVG Circle */}
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              className="dark:stroke-gray-700"
            />

            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${overall * 2.51}, 251`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className={overallColorClass.replace("bg-", "text-")}
            />
          </svg>

          {/* Percentage Text (positioned absolutely over the SVG) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{overall.toFixed(1)}%</span>
          </div>
        </div>

        <h2 className={`text-2xl font-bold ${overallTextColorClass}`}>
          Overall Coverage
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        <CoverageProgressBar percentage={statements} label="Statements" />
        <CoverageProgressBar percentage={branches} label="Branches" />
        <CoverageProgressBar percentage={functions} label="Functions" />
        <CoverageProgressBar percentage={lines} label="Lines" />
      </div>
    </div>
  );
}
