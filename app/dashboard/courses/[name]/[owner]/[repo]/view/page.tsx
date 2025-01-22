import {fetchRepoDetails} from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/courses/breadcrumbs";

export default async function Page(props: { params: Promise<{ owner: string, repo: string }> }) {
    const params = await props.params;
    const owner = params.owner;
    const repo = params.repo;

    const repoDetails = await fetchRepoDetails(owner, repo);
    console.log(repoDetails)

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {label: 'courses', href: '/dashboard/courses'},
                    {
                        label: 'View Project',
                        href: `/dashboard/courses/${owner}/${repo}`,
                        active: true,
                    },
                ]}
            />

        </main>
    )


}