"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import type { CommitStats } from "@/app/lib/definitions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import CommitContributionsTable from "@/app/ui/dashboard/commits/commit-contributions-table"

const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props
  const minHeight = 5
  const barHeight = Math.max(height, minHeight)

  const adjustedY = height < minHeight ? y - (minHeight - height) : y

  return <rect x={x} y={adjustedY} width={width} height={barHeight} fill={fill} />
}

export default function CommitContributions({
  data,
}: {
  data: Record<string, CommitStats>
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<CommitStats | null>(null)
  const chartData = Object.keys(data).map((key) => ({
    name: data[key].name,
    additions: data[key].additions,
    deletions: data[key].deletions,
    co_authored_lines: data[key].co_authored_lines,
    total: data[key].additions + data[key].deletions + data[key].co_authored_lines,
    email: key,
    commits: data[key].commits,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-md shadow-md border border-border">
          <p className="font-bold">{label}</p>
          <p className="text-green-500">Additions: {payload[0].value}</p>
          <p className="text-red-500">Deletions: {payload[1].value}</p>
          <p className="text-orange-500">Co-authored lines: {payload[2].value}</p>
          <p className="font-semibold">Total: {payload[0].value + payload[1].value + payload[2].value}</p>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (barData: any) => {
    setSelectedUser(data[barData.email])
    setIsOpen(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Contributions per Group Member</CardTitle>
        <CardDescription>Distribution of additions, deletions, and co-authored lines</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            additions: {
              label: "Additions",
              color: "hsl(142, 76%, 36%)",
            },
            deletions: {
              label: "Deletions",
              color: "hsl(var(--destructive))",
            },
            co_authored_lines: {
              label: "Co-authored Lines",
              color: "hsl(32, 98%, 56%)",
            },
          }}
          className="h-[600px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 40, left: 60, bottom: 80 }}>
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props
                  const name = payload.value
                  const displayName = name.length > 15 ? `${name.substring(0, 12)}...` : name

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" fontSize={13} transform="rotate(-45)">
                        {displayName}
                      </text>
                      <title>{name}</title>
                    </g>
                  )
                }}
              />
              <YAxis
                label={{
                  value: "Lines of Code",
                  angle: -90,
                  position: "insideLeft",
                    offset: -45,
                  style: { fontSize: "14px", textAnchor: "middle" },
                }}
                tick={{ fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="additions"
                stackId="a"
                fill="var(--color-additions)"
                shape={<CustomBar />}
                minPointSize={5}
              />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="deletions"
                stackId="a"
                fill="var(--color-deletions)"
                shape={<CustomBar />}
                minPointSize={5}
              />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="co_authored_lines"
                stackId="a"
                fill="var(--color-co_authored_lines)"
                shape={<CustomBar />}
                minPointSize={5}
              >
                <LabelList
                  dataKey="commits"
                  position="top"
                  content={({ value, x, y, width }) => (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 12}
                      fill="#000000"
                      textAnchor="middle"
                      fontSize={13}
                    >
                      {`${value} commits`}
                    </text>
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Click on a bar to view detailed contribution information
        </div>
        {/*Drill-down*/}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader className="h-fit">
              <DialogTitle className="text-2xl font-bold">Commit Details</DialogTitle>
              <DialogDescription className="text-lg font-semibold">
                Detailed information for {selectedUser && selectedUser.name}.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && <CommitContributionsTable data={selectedUser} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

