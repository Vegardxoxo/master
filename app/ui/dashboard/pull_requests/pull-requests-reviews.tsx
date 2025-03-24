"use client";
import { PullRequestData } from "@/app/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PullRequestsMembersTable from "@/app/ui/dashboard/pull_requests/pull-requests-members-table";
import { useState } from "react";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function PullRequestsReviews({
  data,
}: {
  data: PullRequestData;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any[] | null>(null);
  const reviewsByMember = Object.entries(data.reviewsByMember || {}).map(
    ([name, { count, prs }]) => ({
      name,
      count,
      prs,
    }),
  );

  const handleDataClick = (data: any) => {
    setSelectedData(
      data.reviewsByMember ? data.reviewsByMember[data.name].prs : data.prs,
    );
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Reviews</CardTitle>
      </CardHeader>

      <CardContent>
        <div>
          {reviewsByMember.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={reviewsByMember}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" onClick={handleDataClick}>
                  {reviewsByMember.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div>No reviews have been made so far.</div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Details for PR reviews</DialogTitle>
              <DialogDescription>
                Detailed information about reviews made by this member.
              </DialogDescription>
            </DialogHeader>
            <PullRequestsMembersTable data={selectedData || []} />
          </DialogContent>
        </Dialog>
        <div className={"mt-4"}>
          <BestPractices
            title={"Obtain feedback through code reviews"}
            icon={"merge"}
            variant={"success"}
          >
            <ul className="space-y-1 list-disc pl-5">
              <li>
                Request feedback through code reviews to ensure code quality
              </li>
              <li>
                Code reviews help identify whether a solution is the most
                effective approach
              </li>
              <li>
                Involve team members with different perspectives and expertise
              </li>
              <li>
                Invite specific stakeholders to reviews when code touches their
                domain knowledge
              </li>
              <li>
                Cross-team reviews help identify security implications or
                domain-specific considerations
              </li>
              <li>
                Create faster feedback loops to prevent problems later in
                development
              </li>
              <li>
                Senior developers can transfer knowledge to junior developers
                through reviews
              </li>
              <li>
                Reviews provide practical, hands-on learning opportunities for
                the team
              </li>
            </ul>
          </BestPractices>
        </div>
      </CardContent>
    </Card>
  );
}
