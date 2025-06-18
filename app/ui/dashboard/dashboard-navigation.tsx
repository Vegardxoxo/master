"use client";

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  LayoutDashboard,
} from "lucide-react";
import type { VisibleSections } from "@/app/lib/definitions/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type SidebarProps = {
  visibleSections: VisibleSections;
  onToggle: (section: keyof VisibleSections) => void;
  onToggleSubsection: (
    section: keyof VisibleSections,
    subsection: string,
  ) => void;
};

// Define the order of sections
const SECTION_ORDER: (keyof VisibleSections)[] = [
  "overview",
  "commits",
  "branches",
  "pipelines",
  "pullRequests",
];

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

  // Helper function to get text from a section or subsection
  const getText = (item: any): string => {
    if (typeof item === "object" && "text" in item) {
      return item.text;
    }
    return "Unknown";
  };

  // Helper function to check if an item is visible
  const isItemVisible = (item: any): boolean => {
    if (typeof item === "boolean") return item;
    if (typeof item === "object" && "visible" in item) return item.visible;
    return false;
  };

  // Helper function to check if an item has subsections
  const hasSubsections = (item: any): boolean => {
    if (typeof item !== "object") return false;
    return Object.keys(item).some(
      (key) =>
        key !== "visible" && key !== "text" && typeof item[key] === "object",
    );
  };

  // Render subsections for a section
  const renderSubsections = (
    section: keyof VisibleSections,
    sectionData: any,
  ) => {
    if (!hasSubsections(sectionData)) return null;

    return (
      <div className="mt-1 ml-7 pl-2 border-l border-gray-200">
        <ul className="space-y-1 py-1">
          {Object.entries(sectionData).map(([key, value]) => {
            // Skip non-subsection properties
            if (
              key === "visible" ||
              key === "text" ||
              typeof value !== "object"
            )
              return null;

            return (
              <li key={key}>
                <div className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded-md">
                  <span className="text-gray-700">{getText(value)}</span>
                  <Switch
                    checked={isItemVisible(value)}
                    onCheckedChange={() => onToggleSubsection(section, key)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Dashboard Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-2">
          {/* Render sections in the specified order */}
          {SECTION_ORDER.map((sectionKey) => {
            const value = visibleSections[sectionKey];
            if (!value) return null; // Skip if section doesn't exist

            const isExpanded = expandedSections[sectionKey];
            const isVisible = isItemVisible(value);
            const sectionText = getText(value);
            const canExpand = hasSubsections(value);

            return (
              <li
                key={sectionKey}
                className={`
                rounded-lg overflow-hidden transition-all duration-200
                ${isExpanded ? "bg-gray-100" : "hover:bg-gray-50"}
              `}
              >
                <div
                  onClick={() => canExpand && toggleExpand(sectionKey)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 
                    font-medium transition-colors duration-150 ease-in-out 
                    cursor-pointer
                    ${isVisible ? "text-gray-900" : "text-gray-500"}
                  `}
                >
                  <span className="flex items-center">
                    {getIcon(sectionKey)}
                    <span className="ml-3 text-base">{sectionText}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    {canExpand && (
                      <button
                        className={`
                          p-1 rounded-full transition-colors
                          ${isExpanded ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(sectionKey);
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
                        onToggle(sectionKey);
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
                {canExpand &&
                  isExpanded &&
                  renderSubsections(sectionKey, value)}
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
