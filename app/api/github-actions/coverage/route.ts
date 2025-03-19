import { NextRequest, NextResponse } from "next/server";
import { saveCoverageReport } from "@/app/lib/server-actions/actions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  // Check token
  if (!process.env.WEBHOOK_SECRET || apiKey !== process.env.WEBHOOK_SECRET) {
    console.log("Missing or invalid API key.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Extract all the fields from the payload
    const repoId = payload.repository_id;
    const repoName = payload.repository_name;
    const commit = payload.commit;
    const branch = payload.branch;
    const coverageReport = payload.coverage_report;

    if (!repoId) {
      return NextResponse.json({
        error: "Missing repository_id in payload"
      }, { status: 400 });
    }

    // Validate coverage report structure
    if (!coverageReport || !coverageReport.total) {
      throw new Error(
        "Invalid coverage report format: Missing 'total' property",
      );
    }

    // Extract metrics directly from the total property
    const metrics = {
      statements: coverageReport.total.statements?.pct || 0,
      branches: coverageReport.total.branches?.pct || 0,
      functions: coverageReport.total.functions?.pct || 0,
      lines: coverageReport.total.lines?.pct || 0,
      overall: 0,
    };

    // Calculate overall coverage
    const values = [
      metrics.statements,
      metrics.branches,
      metrics.functions,
      metrics.lines,
    ];
    metrics.overall = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Parse file coverage data
    const filesCoverage = Object.entries(coverageReport)
      .filter(([key]) => key !== "total")
      .map(([filePath, coverage]) => {
        const fileCoverage = coverage as {
          lines: { pct: number };
          statements: { pct: number };
          functions: { pct: number };
          branches: { pct: number };
        };

        return {
          filePath,
          lines: fileCoverage.lines.pct,
          statements: fileCoverage.statements.pct,
          functions: fileCoverage.functions.pct,
          branches: fileCoverage.branches.pct,
        };
      });

    // Save the coverage report
    const result = await saveCoverageReport(
      repoId,
      commit,
      branch, // Pass the branch from the payload
      metrics,
      filesCoverage,
    );

    return NextResponse.json({
      success: true,
      message: "Coverage report received and processed",
      repositoryId: repoId,
      repositoryName: repoName || "Unknown", // Use the name from the payload
      commit,
      branch,
      timestamp: new Date().toISOString(),
      coverageReport: result.coverageReport,
    });
  } catch (error) {
    console.error("Error processing coverage report:", error);
    return NextResponse.json(
      {
        error: "Failed to process coverage report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

