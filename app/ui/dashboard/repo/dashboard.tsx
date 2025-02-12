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
import type { VisibleSections } from "@/app/lib/definitions";

type DashboardProps = {
  owner: string;
  repo: string;
  children: {
    // Project info
    contributorsList: React.ReactNode;
    projectInfo: React.ReactNode;
    // Commit related
    commitQuality: React.ReactNode;
    commitFrequency: React.ReactNode;
    commitContribution: React.ReactNode;
    commitSize: React.ReactNode;
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
      pullRequests: true,
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

  const toggleSubsection = (section: keyof VisibleSections, subsection: string) => {
    setVisibleSections((prev) => {
      const sectionValue = prev[section]
      if (typeof sectionValue === "object" && "visible" in sectionValue) {
        return {
          ...prev,
          [section]: {
            ...sectionValue,
            [subsection]: !sectionValue[subsection],
          },
        }
      }
      return prev
    })
  }

  return (
    <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 p-4 lg:p-8">
      {/* Dashboard Navigation */}
      <div className="lg:w-1/4">
        <DashboardNavigation
          onToggle={toggleSection}
          onToggleSubsection={toggleSubsection}
          visibleSections={visibleSections}
        />
      </div>

      {/*Dashboard Content*/}
      <div className="flex-grow">
        {/*Project Name*/}
        <div className="mb-6">
          <Link
            href={`https://git.ntnu.no/${owner}/${repo}`}
            className={`${lusitana.className} text-3xl font-bold hover:underline text-blue-600`}
          >
            {owner}/{repo} Dashboard
          </Link>
        </div>

        {/* General information Card */}
        {visibleSections.overview && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Repository Overview</CardTitle>
              <CardDescription>
                General information and contributors
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-6 md:flex-row md:gap-x-6 md:justify-between">
              {children.contributorsList}
              {children.projectInfo}
            </CardContent>
          </Card>
        )}

        {/* Commit Card*/}
        {visibleSections.commits.visible && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Commit Analysis</CardTitle>
              <CardDescription>
                Quality and frequency of commits
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-6">
              {visibleSections.commits.quality && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Commit Quality</h3>
                  {children.commitQuality}
                </div>
              )}
              {visibleSections.commits.frequency && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Commit Frequency
                  </h3>
                  {children.commitFrequency}
                </div>
              )}
              {visibleSections.commits.size && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Commit Size</h3>
                  {children.commitSize}
                </div>
              )}
              {visibleSections.commits.contributions && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Contributions per Member
                  </h3>
                  {children.commitContribution}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Branches Card*/}
        {visibleSections.branches && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Branching Strategy</CardTitle>
              <CardDescription>
                Analysis of branch usage and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>{/* Add branch analysis content here */}</CardContent>
          </Card>
        )}

        {/* Pull Request Card*/}
        {visibleSections.pullRequests && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pull Request Analysis</CardTitle>
              <CardDescription>
                Review process and PR status overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add pull request analysis content here */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
