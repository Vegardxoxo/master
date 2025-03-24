import { getCoverageReport } from "@/app/lib/database-functions";
import { TestCoverageMetrics } from "@/app/ui/dashboard/project_info/test-coverage/test-coverage-metrics";
import { FileCoverageTable } from "@/app/ui/dashboard/project_info/test-coverage/coverage-table";
import Warning from "@/app/ui/dashboard/alerts/warning";

export default async function TestCoverage({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const coverage = await getCoverageReport(owner, repo);

  if (coverage.error || !coverage.metrics || !coverage.fileData) {
    return (
      <Warning
        title={`Coverage Report Unavailable: ${coverage.error}`}
        message="Unable to retrieve coverage data for this repository."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Test Coverage Report</h1>
        <p className="text-gray-500">
          Repository: <span className="font-medium">{repo}</span> by {owner}
        </p>
        <p className="text-gray-500 text-sm">
          Commit:{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">
            {coverage.commitId?.substring(0, 7)}
          </code>{" "}
          • Generated:{" "}
          {coverage.timestamp
            ? new Date(coverage.timestamp).toLocaleString()
            : "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col">
          <TestCoverageMetrics metrics={coverage.metrics} />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <FileCoverageTable fileData={coverage.fileData} />
        </div>
      </div>
    </div>
  );
}
