"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { Clock, GitPullRequest, ImageOff } from "lucide-react";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { pullRequestActivity } from "@/app/ui/courses/columns";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useReport } from "@/app/contexts/report-context";

export default function PullRequestsSection({
  metrics,
  data,
  include,
}: ReportSectionProps) {
  const [includeImageInMarkdown, setIncludeImageInMarkdown] = useState<boolean>(
    metrics.includeImage || false,
  );
  const { addMetricData } = useReport();

  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Pull requests section is not included in the report.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleIncludeImageChange = (checked: boolean) => {
    setIncludeImageInMarkdown(checked);
    const updatedMetrics = {
      ...metrics,
      includeImage: checked,
    };
    addMetricData("pullRequests", data, updatedMetrics);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pull Request Metrics</CardTitle>
          <CardDescription>
            Key metrics about pull request activity and participation
          </CardDescription>
        </CardHeader>
        <CardContent className={"space-y-2"}>
          {metrics.url ? (
            <div className="space-y-4">
              <div className="relative rounded-lg border overflow-hidden bg-muted/20">
                {/* Image container with aspect ratio */}
                <div className="relative aspect-[16/9] w-full h-full">
                  <Image
                    src={metrics.url}
                    alt={"Commit Frequency Chart"}
                    height={1200}
                    width={1200}
                  />
                </div>
              </div>

              {/* Include in markdown option */}
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="include-image"
                  checked={includeImageInMarkdown}
                  onCheckedChange={handleIncludeImageChange}
                />
                <Label
                  htmlFor="include-image"
                  className="text-sm cursor-pointer flex items-center"
                >
                  Include this image in the markdown report
                </Label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No pull request chart available.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a chart from the Pull Request section first.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-blue-200/50">
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
                  <GitPullRequest className="h-5 w-5 mr-2 text-blue-600" />
                  Pull Requests
                </CardTitle>
                <div className="text-3xl font-bold text-blue-900">
                  {metrics.totalPRs}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-blue-700 mb-1">
                      With Review
                    </div>
                    <div className="text-xl font-bold text-blue-900 flex items-center">
                      {metrics.prsWithReview || 0}
                      <span className="text-xs ml-2 font-normal text-blue-600">
                        (
                        {Math.round(
                          (metrics.prsWithReview / metrics.totalPRs) * 100,
                        ) || 0}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-blue-700 mb-1">
                      Without Review
                    </div>
                    <div className="text-xl font-bold text-blue-900 flex items-center">
                      {metrics.prsWithoutReview || 0}
                      <span className="text-xs ml-2 font-normal text-blue-600">
                        (
                        {Math.round(
                          (metrics.prsWithoutReview / metrics.totalPRs) * 100,
                        ) || 0}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-purple-200/50">
                <CardTitle className="text-lg font-semibold text-purple-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Time to Merge
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-2xl text-purple-700 font-bold text-center">
                  {metrics.averageTimeToMerge.toFixed(2)} hours
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <GenericDataTable data={data} columns={pullRequestActivity} />
      </Card>
    </div>
  );
}
