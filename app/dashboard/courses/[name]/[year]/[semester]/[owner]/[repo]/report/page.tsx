"use client";

import { useReportHelper } from "@/app/contexts/report-context-helper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import FinalReport from "@/app/ui/dashboard/report/final-report";
import { useReport } from "@/app/contexts/report-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Page() {
  const { getReport } = useReportHelper();
  const { getAllImageUrls, getRepositoryInfo } = useReport();
  const info = getRepositoryInfo();
  const pathname = usePathname();
  const router = useRouter();
  const images = getAllImageUrls();

  const handleBackClick = () => {
    const parentPath = pathname.replace(/\/report$/, "");
    router.push(parentPath);
  };

  const report = getReport();

  if (!report || !info) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Please Generate a report first.</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { title, content } = report;
  const { owner, repo } = info;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Report
        </Button>
      </div>
      <div>
        <FinalReport
          title={title}
          content={content}
          repo={repo}
          owner={owner}
          images={images}
        />
      </div>
    </div>
  );
}
