import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {fetchRepoOverview} from "@/app/lib/data";
import {studentRepos} from "@/app/lib/placeholder-data"
import {ViewProject} from "@/app/ui/courses/buttons";

export default async function ReactTable() {
    const repoData = await Promise.all(
        studentRepos.map(({owner, repo}) => fetchRepoOverview(owner, repo)
        ))

    return (
        <Table>
            <TableCaption>Projects</TableCaption>
            <TableHeader>
                <TableRow className={"bg-blue-500 hover:ring-sky-500 text-white"}>
                    <TableHead className={"text-white"}>Project Name</TableHead>
                    <TableHead className={"text-white"}>Group Members</TableHead>
                    <TableHead className={"text-white"}>Open Issues</TableHead>
                    <TableHead className={"text-white"}>View Project</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {repoData.map((repo, index) => (
                    repo && (
                        <TableRow key={index} className={"odd:bg-white even:bg-slate-100 cursor-pointer"}>
                            <TableCell className="font-medium">{repo.name}</TableCell>
                            <TableCell>{repo.contributors.join(", ")}</TableCell>
                            <TableCell>{repo.openIssues}</TableCell>
                            <TableCell className={"flex justify-end gap-2"}> <ViewProject owner={repo.contributors}
                                                                                          repo={repo.name}/></TableCell>
                        </TableRow>
                    )
                ))}
            </TableBody>
        </Table>
    )
}