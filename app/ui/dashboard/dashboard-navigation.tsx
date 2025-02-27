import React from "react"
import {
  LayoutDashboard,
  GitCommit,
  GitPullRequest,
  GitBranch,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { VisibleSections } from "@/app/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SidebarProps = {
  visibleSections: VisibleSections
  onToggle: (section: keyof VisibleSections) => void
  onToggleSubsection: (section: keyof VisibleSections, subsection: string) => void
}

export function DashboardNavigation({ onToggle, onToggleSubsection, visibleSections }: SidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})

  const toggleExpand = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleMainSectionClick = (key: keyof VisibleSections, e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof visibleSections[key] === "object" && "visible" in visibleSections[key]) {
      toggleExpand(key)
    } else {
      onToggle(key)
    }
  }

  const renderSubsections = (key: keyof VisibleSections, value: any) => {
    if (typeof value !== "object" || !("visible" in value)) return null

    return (
      <div className="ml-6 mt-1">
        <ul className="space-y-1">
          {Object.entries(value).map(
            ([subKey, subValue]) =>
              subKey !== "visible" && (
                <li key={subKey}>
                  <div
                    onClick={() => onToggleSubsection(key, subKey)}
                    className="w-full flex items-center justify-between px-3 py-1 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 ease-in-out rounded-md pl-8 cursor-pointer"
                  >
                    <span className="capitalize">{subKey}</span>
                    {typeof subValue === "boolean" &&
                      (subValue ? (
                        <Eye className="h-4 w-4 text-blue-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ))}
                  </div>
                </li>
              ),
          )}
        </ul>
      </div>
    )
  }

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-blue-600">Dashboard Controls</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="space-y-1">
          {Object.entries(visibleSections).map(([key, value]) => (
            <li key={key}>
              <div
                onClick={(e) => handleMainSectionClick(key as keyof VisibleSections, e)}
                className="w-full flex items-center justify-between px-4 py-2 text-md font-medium text-gray-700
                 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 ease-in-out rounded-md cursor-pointer"
              >
                <span className="flex items-center">
                  {getIcon(key)}
                  <span className="ml-3 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </span>
                <span className="flex items-center">
                  {typeof value === "object" && "visible" in value && (
                    <span className="mx-8">
                      {expandedSections[key] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle(key as keyof VisibleSections)
                    }}
                  >
                    {typeof value === "object" && "visible" in value ? (
                      value.visible ? (
                        <Eye className="h-5 w-5 text-blue-500" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )
                    ) : typeof value === "boolean" ? (
                      value ? (
                        <Eye className="h-5 w-5 text-blue-500" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )
                    ) : null}
                  </span>
                </span>
              </div>
              {typeof value === "object" &&
                "visible" in value &&
                expandedSections[key] &&
                renderSubsections(key as keyof VisibleSections, value)}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function getIcon(key: string) {
  switch (key) {
    case "overview":
      return <LayoutDashboard className="h-5 w-5 text-blue-500" />
    case "commits":
      return <GitCommit className="h-5 w-5 text-green-500" />
    case "branches":
      return <GitBranch className="h-5 w-5 text-yellow-500" />
    case "pullRequests":
      return <GitPullRequest className="h-5 w-5 text-purple-500" />
    default:
      return null
  }
}

