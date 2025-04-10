"use client";

import React from "react";
import {
  LayoutDashboard,
  GitCommit,
  GitPullRequest,
  GitBranch,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  GitMerge,
} from "lucide-react";
import type { VisibleSections } from "@/app/lib/definitions/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SidebarProps = {
  visibleSections: VisibleSections;
  onToggle: (section: keyof VisibleSections) => void;
  onToggleSubsection: (
    section: keyof VisibleSections,
    subsection: string,
  ) => void;
};

export function DashboardNavigation({
  onToggle,
  onToggleSubsection,
  visibleSections,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMainSectionClick = (
    key: keyof VisibleSections,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (
      typeof visibleSections[key] === "object" &&
      "visible" in visibleSections[key]
    ) {
      toggleExpand(key);
    } else {
      onToggle(key);
    }
  };

  const renderSubsections = (key: keyof VisibleSections, value: any) => {
    if (typeof value !== "object" || !("visible" in value)) return null;

    return (
      <div className="mt-1 ml-7 pl-2 border-l border-gray-200">
        <ul className="space-y-1 py-1">
          {Object.entries(value).map(
            ([subKey, subValue]) =>
              subKey !== "visible" && (
                <li key={subKey}>
                  <div
                    onClick={() => onToggleSubsection(key, subKey)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm 
                      ${
                        typeof subValue === "boolean" && subValue
                          ? "text-gray-800 font-medium"
                          : "text-gray-600 font-normal"
                      } 
                      hover:bg-gray-100 transition-colors 
                      duration-150 ease-in-out rounded-md cursor-pointer
                    `}
                  >
                    <span className="capitalize">
                      {subKey.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    {typeof subValue === "boolean" && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full">
                        {subValue ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ),
          )}
        </ul>
      </div>
    );
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-xl font-semibold text-blue-600">
          Dashboard Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-2">
          {Object.entries(visibleSections).map(([key, value]) => {
            const isExpanded = expandedSections[key];
            const isObject = typeof value === "object" && "visible" in value;
            const isVisible = isObject
              ? (value as any).visible
              : typeof value === "boolean"
                ? value
                : false;

            return (
              <li
                key={key}
                className={`
                rounded-lg overflow-hidden transition-all duration-200
                ${isExpanded ? "bg-gray-100" : "hover:bg-gray-50"}
              `}
              >
                <div
                  onClick={(e) =>
                    handleMainSectionClick(key as keyof VisibleSections, e)
                  }
                  className={`
                    w-full flex items-center justify-between px-4 py-3 
                    font-medium transition-colors duration-150 ease-in-out 
                    cursor-pointer
                    ${isVisible ? "text-gray-900" : "text-gray-700"}
                  `}
                >
                  <span className="flex items-center">
                    {getIcon(key)}
                    <span className="ml-3 capitalize text-base">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </span>
                  <span className="flex items-center space-x-2">
                    {isObject && (
                      <button
                        className={`
                          p-1 rounded-full transition-colors
                          ${isExpanded ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(key);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(key as keyof VisibleSections);
                      }}
                    >
                      {isVisible ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </span>
                </div>
                {isObject &&
                  isExpanded &&
                  renderSubsections(key as keyof VisibleSections, value)}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function getIcon(key: string) {
  switch (key) {
    case "overview":
      return <LayoutDashboard className="h-5 w-5 text-blue-500" />;
    case "commits":
      return <GitCommit className="h-5 w-5 text-green-500" />;
    case "branches":
      return <GitBranch className="h-5 w-5 text-yellow-500" />;
    case "pullRequests":
      return <GitPullRequest className="h-5 w-5 text-purple-500" />;
    case "pipelines":
      return <GitMerge className="h-5 w-5 text-orange-500" />;
    default:
      return null;
  }
}
