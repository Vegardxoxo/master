import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { commitMessageClassification } from "@/app/ui/courses/columns";
import { ReportSectionProps } from "@/app/lib/definitions";

export function CommitQualitySection({
  fileData,
  recommendations,
  setRecommendations,
  include,
}: ReportSectionProps) {
  const [qualityScore, setQualityScore] = useState<number>(0);
  console.log("fileData", fileData);

  useEffect(() => {
    if (fileData?.qualityScore) {
      setQualityScore(Number.parseFloat(fileData.qualityScore));
    }
  }, [fileData]);

  if (!include || !fileData) {
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

  // Get status icon based on quality status
  const getStatusIcon = () => {
    switch (fileData.qualityStatus) {
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "moderate":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "poor":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  // Get badge variant based on quality status
  const getBadgeVariant = () => {
    switch (fileData.qualityStatus) {
      case "good":
        return "outline" as const;
      case "moderate":
        return "secondary" as const;
      case "poor":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  // Get color for progress bar
  const getProgressColor = () => {
    if (qualityScore >= 7) return "bg-green-500";
    if (qualityScore >= 4) return "bg-blue-500";
    return "bg-amber-500";
  };

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
              {fileData.categoryCounts?.Excellent || 0} commits (
              {fileData.excellentPercentage}%)
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
              {fileData.categoryCounts?.Good || 0} commits (
              {fileData.goodPercentage}%)
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
              {fileData.categoryCounts?.["Needs Improvement"] || 0} commits (
              {fileData.needsImprovementPercentage}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <GenericDataTable
        data={fileData.justifications}
        columns={commitMessageClassification}
      />

      <div className="space-y-2">
        <Label htmlFor="commit-recommendations">Recommendations</Label>
        <Textarea
          id="commit-recommendations"
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          className="min-h-[100px]"
          placeholder="Add your recommendations for improving commit quality..."
        />
      </div>
    </div>
  );
}
