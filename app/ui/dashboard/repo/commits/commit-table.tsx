import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {CommitEval, LLMResponse} from "@/app/lib/definitions";
import Link from "next/link";

export default function CommitTable({ data }: { data: LLMResponse[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Message</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((commit, index) => (
          <TableRow className={"even:bg-slate-100"} key={index}>
            <TableCell>
             <Link className={"text-blue-600 underline hover:cursor-pointer text-pretty"} href={commit.url} target="_blank" rel="noopener noreferrer">{commit.commit_message}</Link>
            </TableCell>
            <TableCell className={"text-pretty"}>{commit.reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
