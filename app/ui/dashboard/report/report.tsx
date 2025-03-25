"use client";
import { useReport } from "@/app/contexts/report-context";

export default function GenerateReport({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { getAllMetricsData, clearMetricsData } = useReport();

  console.log(getAllMetricsData());
  return (
    <div>
      <button onClick={clearMetricsData}>Clear</button>
    </div>
  );
}
