"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from "recharts"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PullRequestData } from "@/app/lib/definitions"

export function PullRequestMetrics({ data }: { data: PullRequestData }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const handleBarClick = (data: any) => {
    setSelectedMetric(data.name)
    setIsDialogOpen(true)
  }

  const commentsByMemberData = Object.entries(data.commentsByMember || {}).map(([name, count]) => ({ name, count }))
  const reviewStatusData = [
    { name: "With Review", value: data.prsWithReview || 0 },
    { name: "Without Review", value: data.prsWithoutReview || 0 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Metrics</CardTitle>
        <CardDescription>Detailed analysis of pull request activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {commentsByMemberData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Comments per Group Member</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commentsByMemberData} onClick={handleBarClick}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Comments Made" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reviewStatusData.some((item) => item.value > 0) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">PR Review Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reviewStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Fast-Merged Pull Requests</h3>
            <p className="text-sm text-gray-500 mb-2">PRs merged within 5 minutes of creation</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Merged At</TableHead>
                  <TableHead>Time to Merge (minutes)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.fastMergedPRs || []).map((pr) => {
                  const createdAt = new Date(pr.created_at)
                  const mergedAt = new Date(pr.merged_at)
                  const timeToMerge = ((mergedAt.getTime() - createdAt.getTime()) / (1000 * 60)).toFixed(2)

                  return (
                    <TableRow key={pr.number}>
                      <TableCell>{pr.title}</TableCell>
                      <TableCell>{pr.user}</TableCell>
                      <TableCell>{createdAt.toLocaleString()}</TableCell>
                      <TableCell>{mergedAt.toLocaleString()}</TableCell>
                      <TableCell>{timeToMerge}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Details for {selectedMetric}</DialogTitle>
              <DialogDescription>Detailed information about comments made by this member.</DialogDescription>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR Title</TableHead>
                  <TableHead>PR Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.pullRequests || [])
                  .filter((pr) => pr.commenters && pr.commenters[selectedMetric as string])
                  .map((pr) => (
                    <TableRow key={pr.number}>
                      <TableCell>{pr.title}</TableCell>
                      <TableCell>{pr.user}</TableCell>
                      <TableCell>{pr.review_comments}</TableCell>
                      <TableCell>{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

