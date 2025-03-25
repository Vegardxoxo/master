"use client";

import React from "react";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardNavigation } from "@/app/ui/dashboard/dashboard-navigation";
import { cn } from "@/app/lib/utils/utils";
import { VisibleSections } from "@/app/lib/definitions";
import Files from "@/app/ui/dashboard/project_info/file-explorer/files";
import { GitBranch, GitCommit, LayoutDashboard, GitMerge } from "lucide-react";

type DashboardProps = {
  owner: string;
  repo: string;
  children: {
    contributorsList: React.ReactNode;
    projectInfo: React.ReactNode;
    milestones: React.ReactNode;
    files: React.ReactNode;
    coverage: React.ReactNode;
    commitQuality: React.ReactNode;
    commitFrequency: React.ReactNode;
    commitContribution: React.ReactNode;
    commitSize: React.ReactNode;
    branch: React.ReactNode;
    branchingStrategy: React.ReactNode;
    pipeline: React.ReactNode;
    pullRequestOverview: React.ReactNode;
    pullRequestMembers: React.ReactNode;
    pullRequestComments: React.ReactNode;
    pullRequestReviews: React.ReactNode;
  };
};

export default function Dashboard({ owner, repo, children }: DashboardProps) {
  const [visibleSections, setVisibleSections] = React.useState<VisibleSections>(
    {
      overview: {
        visible: true,
        contributors: true,
        milestones: true,
        info: true,
        files: true,
        coverage: true,
      },
      commits: {
        visible: true,
        quality: true,
        frequency: true,
        size: true,
        contributions: true,
      },
      branches: {
        visible: true,
        to_main: true,
        strategy: true,
      },
      pipelines: true,
      pullRequests: {
        visible: true,
        overview: true,
        members: true,
        comments: true,
        reviews: true,
      },
    },
  );

  const toggleSection = (section: keyof VisibleSections) => {
    setVisibleSections((prev) => {
      const sectionValue = prev[section];

      if (typeof sectionValue === "object" && "visible" in sectionValue) {
        return {
          ...prev,
          [section]: {
            ...sectionValue,
            visible: !sectionValue.visible,
          },
        };
      } else {
        return {
          ...prev,
          [section]: !sectionValue,
        };
      }
    });
  };

  const toggleSubsection = (
    section: keyof VisibleSections,
    subsection: string,
  ) => {
    setVisibleSections((prev) => {
      const sectionValue = prev[section];
      if (
        typeof sectionValue === "object" &&
        "visible" in sectionValue &&
        subsection in sectionValue
      ) {
        return {
          ...prev,
          [section]: {
            ...sectionValue,
            [subsection]: !sectionValue[subsection],
          },
        };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen">
      <main className="py-6">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:space-x-4">
            {/*Sticky navigation*/}
            <div className="lg:min-w-fit mb-6 lg:mb-0">
              <div className="sticky top-6">
                <DashboardNavigation
                  onToggle={toggleSection}
                  onToggleSubsection={toggleSubsection}
                  visibleSections={visibleSections}
                />
              </div>
            </div>

            {/*Card container*/}
            <div className="flex-grow space-y-6">
              {visibleSections.overview.visible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                      <LayoutDashboard className="h-5 w-5" />
                      Repository Overview
                    </CardTitle>
                    <CardDescription>
                      General information and contributors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className={"grid grid-cols-2 gap-6"}>
                      {visibleSections.overview.contributors &&
                        children.contributorsList}
                      {visibleSections.overview.info && children.projectInfo}
                    </div>
                    <div className={"grid grid-cols-1 gap-6"}>
                      {visibleSections.overview.milestones &&
                        children.milestones}
                      {visibleSections.overview.files && children.files}
                      {visibleSections.overview.coverage && children.coverage}
                    </div>
                  </CardContent>
                </Card>
              )}

              {visibleSections.commits.visible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                      <GitCommit className="h-5 w-5" />
                      Commit Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {visibleSections.commits.quality && (
                      <div>{children.commitQuality}</div>
                    )}
                    {visibleSections.commits.frequency && (
                      <div>{children.commitFrequency}</div>
                    )}
                    {visibleSections.commits.size && (
                      <div>{children.commitSize}</div>
                    )}
                    {visibleSections.commits.contributions && (
                      <div>{children.commitContribution}</div>
                    )}
                  </CardContent>
                </Card>
              )}

              {visibleSections.branches.visible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                      <GitBranch className="h-5 w-5" />
                      Branching Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={"grid  gap-6"}>
                      {visibleSections.branches.to_main && children.branch}
                      {visibleSections.branches.strategy &&
                        children.branchingStrategy}
                    </div>
                  </CardContent>
                </Card>
              )}
              {visibleSections.pipelines && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                      <GitMerge className="h-5 w-5" />
                      CI/CD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visibleSections.pipelines && children.pipeline}
                  </CardContent>
                </Card>
              )}

              {visibleSections.pullRequests.visible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      Pull Request Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {visibleSections.pullRequests.overview && (
                      <div>{children.pullRequestOverview}</div>
                    )}
                    {visibleSections.pullRequests.members && (
                      <div> {children.pullRequestMembers}</div>
                    )}
                    {visibleSections.pullRequests.comments && (
                      <div>{children.pullRequestComments}</div>
                    )}

                    {visibleSections.pullRequests.reviews && (
                      <div>{children.pullRequestReviews}</div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
