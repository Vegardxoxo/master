import { getRepository } from "@/app/lib/database-functions";
import { UpdateRepositoryForm } from "@/app/ui/courses/add/update-repo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function Page(props: {
  params: Promise<{
    name: string;
    year: string;
    semester: string;
    id: string;
  }>;
}) {
  const params = await props.params;
  const { name, year, semester, id } = params;
  const { repository } = await getRepository(id);

  if (!repository) {
    notFound();
  }

  // Build URLs for breadcrumb navigation
  const coursesUrl = "/dashboard/courses";
  const specificCourseUrl = `/dashboard/courses/${name}/${year}/${semester}`;
  const repositoriesUrl = `${specificCourseUrl}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={coursesUrl}>Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={specificCourseUrl}>
                {name} {semester} {year}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Repository</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back button */}
        <Link
          href={repositoriesUrl}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to repositories
        </Link>

        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Edit Repository
          </h1>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <UpdateRepositoryForm repositoryId={id} repository={repository} />
        </div>
      </div>
    </div>
  );
}