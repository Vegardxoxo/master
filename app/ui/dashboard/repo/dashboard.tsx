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

type DashboardProps = {
  owner: string;
  repo: string;
  children: {
    contributorsList: React.ReactNode;
    projectInfo: React.ReactNode;
    commitQuality: React.ReactNode;
    commitFrequency: React.ReactNode;
  };
};

export default function Dashboard({ owner, repo, children }: DashboardProps) {
  const [visibleSections, setVisibleSections] = React.useState({
    overview: true,
    commits: true,
    branches: true,
    pullRequests: true,
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className=" flex flex-col lg:flex-row md:space-x-10 min-h-screen">
      {/* Dashboard DashboardNavigation */}
      <div className="static md:sticky top-0 h-1/4 w-72 pt-8 sm:max-md:mx-auto sm:max-md:w-full">
        <DashboardNavigation onToggle={toggleSection} visibleSections={visibleSections} />
      </div>

      {/*Dashboard Content*/}
      <div className="container mx-auto p-8 ">
        {/*Project Name*/}
        <div className="mb-4 text-3xl font-bold">
          <Link
            href={`https://git.ntnu.no/${owner}/${repo}`}
            className={`${lusitana.className} text-3xl font-bold hover:underline text-blue-600`}
          >
            {owner}/{repo}-Dashboard
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
            <CardContent className="flex flex-col gap-y-10 md:flex md:flex-row md:space-x-10 md:justify-between sm:flex-col">
              {children.contributorsList}
              {children.projectInfo}
            </CardContent>
          </Card>
        )}

        {/* Commit Card*/}
        {visibleSections.commits && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Commit Analysis</CardTitle>
              <CardDescription>
                Quality and frequency of commits
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-10">
              {children.commitQuality}
              {children.commitFrequency}
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
          </Card>
        )}
      </div>
    </div>
  );
}
