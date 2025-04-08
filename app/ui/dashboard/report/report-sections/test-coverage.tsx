import { ReportSectionProps } from "@/app/lib/definitions";
import { CoverageProgressBar } from "@/app/ui/dashboard/project_info/test-coverage/coverage-progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverageTableReport } from "@/app/ui/dashboard/project_info/test-coverage/coverage-table-report";

interface TestCoverageProps extends ReportSectionProps {
  fileCoverage: any;
}

export default function TestCoverageSection({
  metrics,
  fileCoverage,
  include,
}: TestCoverageProps) {
  // Check if fileData exists and if section should be included

  console.log("filecoverage", fileCoverage);
  if (!metrics || !include || !fileCoverage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Test coverage section is not included in the report."
              : "No test coverage data available."}
          </p>
        </CardContent>
      </Card>
    );
  }
  console.log("fileCoverage", fileCoverage);

  const {
    statements = 0,
    branches = 0,
    functions = 0,
    lines = 0,
    percentage = 0,
  } = metrics || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Coverage Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CoverageProgressBar percentage={percentage} label="Total Coverage" />
          <CoverageProgressBar percentage={statements} label="Statements" />
          <CoverageProgressBar percentage={branches} label="Branches" />
          <CoverageProgressBar percentage={functions} label="Functions" />
          <CoverageProgressBar percentage={lines} label="Lines" />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CoverageTableReport fileData={fileCoverage} />
        </CardContent>
      </Card>
    </div>
  );
}
