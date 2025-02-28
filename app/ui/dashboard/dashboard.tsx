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
import { cn } from "@/app/lib/utils";
import { VisibleSections } from "@/app/lib/definitions";

type DashboardProps = {
  owner: string;
  repo: string;
  children: {
    contributorsList: React.ReactNode;
    projectInfo: React.ReactNode;
    commitQuality: React.ReactNode;
    commitFrequency: React.ReactNode;
    commitContribution: React.ReactNode;
    commitSize: React.ReactNode;
    pullRequestOverview: React.ReactNode;
    pullRequestMembers: React.ReactNode;
    pullRequestComments: React.ReactNode;
    pullRequestReviews: React.ReactNode;
  };
};

export default function Dashboard({ owner, repo, children }: DashboardProps) {
  const [visibleSections, setVisibleSections] = React.useState<VisibleSections>(
    {
      overview: true,
      commits: {
        visible: true,
        quality: true,
        frequency: true,
        size: true,
        contributions: true,
      },
      branches: true,
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
    setVisibleSections((prev) => ({
      ...prev,
      [section]:
        typeof prev[section] === "object"
          ? { ...(prev[section] as object), visible: !prev[section].visible }
          : !prev[section],
    }));
  };

  const toggleSubsection = (
    section: keyof VisibleSections,
    subsection: string,
  ) => {
    setVisibleSections((prev) => {
      const sectionValue = prev[section];
      if (typeof sectionValue === "object" && "visible" in sectionValue) {
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
      {/*Project subject and group.*/}
      <header>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <Link
              href={`https://git.ntnu.no/${owner}/${repo}`}
              className={cn(
                lusitana.className,
                "hover:underline text-blue-600",
              )}
            >
              {owner}/{repo} Dashboard
            </Link>
          </h1>
        </div>
      </header>

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
              {visibleSections.overview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      Repository Overview
                    </CardTitle>
                    <CardDescription>
                      General information and contributors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-1">
                      {children.contributorsList}
                    </div>
                    <div className="md:col-span-1">{children.projectInfo}</div>
                  </CardContent>
                </Card>
              )}

              {visibleSections.commits.visible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
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

              {visibleSections.branches && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      Branching Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add branch analysis content here */}
                    <p className="text-gray-600">
                      Branch analysis content will be added here.
                    </p>
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
