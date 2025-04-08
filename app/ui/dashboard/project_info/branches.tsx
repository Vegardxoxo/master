import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchBranchesWithStatus } from "@/app/lib/data/github-api-functions";
import { _Branches } from "@/app/lib/definitions";

interface BranchesProps {
  owner: string;
  repo: string;
  branches: _Branches[];
}

export default async function Branches({
  owner,
  repo,
  branches,
}: BranchesProps) {
  const repoData = await fetchBranchesWithStatus(owner, repo, branches);

  return (
    <Card className="mb-8 group 0">
      <CardHeader>
        <CardTitle>Branches</CardTitle>
        <CardDescription>Status of repository branches</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repoData.map((branch) => (
              <TableRow key={branch.name}>
                <TableCell className="font-medium">{branch.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      branch.status === "active" ? "default" : "secondary"
                    }
                  >
                    {branch.status}
                  </Badge>
                </TableCell>
                <TableCell>{branch.lastUpdate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
