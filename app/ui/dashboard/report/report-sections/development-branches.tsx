"use client";
import { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { useReport } from "@/app/contexts/report-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { DevelopmentBranchColumns } from "@/app/ui/courses/columns";

export default function DevelopmentBranches({
  metrics,
  data,
  include,
}: ReportSectionProps) {
  const { addMetricData } = useReport();

  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Branch linkage section is not included in the report.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className={"space-y-6"}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Branch-Issue Connection Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className={"space-y-4"}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalBranches}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Linked to Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.linkedBranches}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unlinked Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {metrics.unlinkedBranches}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <GenericDataTable columns={DevelopmentBranchColumns} data={data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
