"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface SidebarProps {
  onToggle: (section: string, visible: boolean) => void
}

export function Sidebar({ onToggle }: SidebarProps) {
  const [sections, setSections] = useState({
    repoOverview: true,
    projectInfo: true,
    contributors: true,
    branches: true,
    commits: true,
    pullRequests: true,
  })

  const handleToggle = (section: string) => {
    setSections((prev) => {
      const newState = { ...prev, [section]: !prev[section] }
      onToggle(section, newState[section])
      return newState
    })
  }

  return (
    <Card className="w-64 fixed left-4 top-4 h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle>Dashboard Sections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="repoOverview"
              checked={sections.repoOverview}
              onCheckedChange={() => handleToggle("repoOverview")}
            />
            <Label htmlFor="repoOverview">Repository Overview</Label>
          </div>
          <div className="ml-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projectInfo"
                checked={sections.projectInfo}
                onCheckedChange={() => handleToggle("projectInfo")}
              />
              <Label htmlFor="projectInfo">Project Info</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contributors"
                checked={sections.contributors}
                onCheckedChange={() => handleToggle("contributors")}
              />
              <Label htmlFor="contributors">Contributors</Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="branches" checked={sections.branches} onCheckedChange={() => handleToggle("branches")} />
            <Label htmlFor="branches">Branches</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="commits" checked={sections.commits} onCheckedChange={() => handleToggle("commits")} />
            <Label htmlFor="commits">Commits</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pullRequests"
              checked={sections.pullRequests}
              onCheckedChange={() => handleToggle("pullRequests")}
            />
            <Label htmlFor="pullRequests">Pull Requests</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

