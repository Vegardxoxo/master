import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { commitMessageClassification } from "@/app/ui/courses/columns";
import { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { Separator } from "@/components/ui/separator";

export function CommitQualitySection({ metrics, include }: ReportSectionProps) {
  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Commit quality section is not included in the report."
              : "No commit quality data available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-sm text-green-800 dark:text-green-300">
              Excellent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {metrics.categoryCounts?.Excellent || 0} commits (
              {metrics.excellentPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800 dark:text-yellow-300">
              Good
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
              {metrics.categoryCounts?.Good || 0} commits (
              {metrics.goodPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-sm text-red-800 dark:text-red-300">
              Needs Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">
              {metrics.categoryCounts?.["Needs Improvement"] || 0} commits (
              {metrics.needsImprovementPercentage}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <GenericDataTable
        data={metrics.justifications}
        columns={commitMessageClassification}
      />
    </div>
  );
}
