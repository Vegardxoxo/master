import { getCoverageReport } from "@/app/lib/database-functions";
import { TestCoverageMetrics } from "@/app/ui/dashboard/project_info/test-coverage/test-coverage-metrics";
import { FileCoverageTable } from "@/app/ui/dashboard/project_info/test-coverage/coverage-table";

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
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Coverage Report Unavailable: {coverage.error}
        </h2>
        <p className="text-red-600">
          Unable to retrieve coverage data for this repository.
        </p>
      </div>
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
